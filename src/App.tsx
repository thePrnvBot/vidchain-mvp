import React, { useRef, useEffect, useState } from "react";
import type { VidchainObject } from "./types";
import { usePlayerStore, useVidchainStore } from "./stores/useVidchainStore";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: typeof YT;
  }
}

const YouTubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);
  const player = usePlayerStore((state) => state.player);
  const jsonInputField = useRef<HTMLTextAreaElement>(null);
  const [isReady, setIsReady] = useState(false);
  const currentClipIndex = useRef(0);

  // Zustand store
  const vidchainData = useVidchainStore((state) => state.vidchainData);

  // Initialize YouTube player
  useEffect(() => {
    if (player) return;

    // Load YouTube IFrame API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      if (!document.querySelector("#youtube-iframe-api")) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = initializePlayer;
    };

    // Initialize the player with a default video or the first clip
    const initializePlayer = (videoId?: string) => {

      if (!playerRef.current) return;

      const newPlayer = new window.YT.Player(playerRef.current, {
        height: "390",
        width: "640",
        videoId: videoId || "dQw4w9WgXcQ",
        playerVars: { playsinline: 1 },
        events: {
          onReady: (event) => {
            setIsReady(true);
            event.target.playVideo();
          },
          onStateChange: (event) => {
            // When video ends, play next clip
            if (event.data == 0) {
              queueNextClip();
            }
          },
        },
      });

      usePlayerStore.setState({ player: newPlayer });
    };

    loadYouTubeAPI();
  }, [player]);

  // Queue the next clip in the vidchainData
  const queueNextClip = () => {
    const vidchainState = useVidchainStore.getState().vidchainData;
    if (!vidchainState?.clips) {
      console.log("No vidchain data");
      return;
    }

    const nextIndex = currentClipIndex.current + 1;
    if (nextIndex < vidchainState.clips.length) {
      currentClipIndex.current = nextIndex;
      const nextClip = vidchainState && vidchainState.clips ? vidchainState.clips[nextIndex] : null;
      console.log("Loading next clip:", nextClip);
      if (!nextClip) return;
      const videoIdMatch = nextClip.url.match(/v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      const player = usePlayerStore.getState().player;
      if (videoId) {
        player?.loadVideoById({
          videoId,
          startSeconds: nextClip.start,
          endSeconds: nextClip.end,
        });
      }
      console.log("Queued next clip:", nextClip);
    } else {
      console.log("Reached end of sequence");
    }
  };

  // Parse JSON input and update Zustand store
  const parseJSON = () => {
    if (!player || !jsonInputField.current) return;

    try {
      const parsed: VidchainObject = JSON.parse(jsonInputField.current.value);
      useVidchainStore.setState({ vidchainData: parsed });
      currentClipIndex.current = 0;

      if (vidchainData && vidchainData.clips.length > 0) {
        const firstClip = vidchainData.clips[0];
        const videoIdMatch = firstClip.url.match(/v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
          player.loadVideoById({
            videoId,
            startSeconds: firstClip.start,
            endSeconds: firstClip.end,
          });
        }
      }
    } catch (err) {
      console.error("Invalid JSON:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{vidchainData?.sequenceTitle ?? "Vidchain"}</h1>
      <div ref={playerRef} className="rounded-lg" />

      {isReady && (
        <div className="flex gap-4">
          <button onClick={() => player?.playVideo()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Play</button>
          <button onClick={() => player?.pauseVideo()} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Pause</button>
          <button onClick={() => player?.stopVideo()} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Stop</button>
        </div>
      )}

      {vidchainData?.clips.map((clip, index) => (
        <div key={index} className="flex flex-row gap-2 items-center">
          <p>Clip {index + 1}</p>
          <p>Duration: {clip.end - clip.start}s</p>
          <button
            onClick={() => {
              if (!player) return;
              const videoIdMatch = clip.url.match(/v=([^&]+)/);
              const videoId = videoIdMatch ? videoIdMatch[1] : null;
              if (videoId) {
                currentClipIndex.current = index;
                player.loadVideoById({
                  videoId,
                  startSeconds: clip.start,
                  endSeconds: clip.end,
                });
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Load Clip
          </button>
        </div>
      ))}

      <textarea ref={jsonInputField} className="w-1/2 h-32 p-2 border border-gray-300 rounded-lg" placeholder="Insert Vidchain JSON here!" />
      <a onClick={parseJSON} className="hover:underline cursor-pointer">Confirm!</a>
    </div>
  );
};

export default YouTubePlayer;
