import React, { useRef, useEffect, useState } from "react";
import { usePlayerStore, useVidchainStore } from "./stores/useVidchainStore";
import { toVidchainObject } from "./lib/utils";
import PreviewBar from "./components/previewBar";
import { Textarea } from "./components/ui/textarea";

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
  const placeholder = `{ 
  "sequenceTitle": "My Sequence", 
  "clips": [ 
    { 
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
      "start": 10, 
      "end": 20 
    }, 
    { 
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
    "start": 0, 
    "end": 10 
    }]
  }`;

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
        videoId: videoId || "qAQahr6Eddg",
        playerVars: { playsinline: 1 },
        events: {
          onReady: () => {
            setIsReady(true);
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
      const videoId = nextClip.videoId;
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
    if (!jsonInputField.current) return;

    try {
      const preProcessedParse = JSON.parse(jsonInputField.current.value.trim());
      const processedParse = toVidchainObject(preProcessedParse);
      useVidchainStore.setState({ vidchainData: processedParse });
      currentClipIndex.current = 0;
    } catch (err) {
      console.error("Invalid JSON:", err);
    }

    console.log("Parsed JSON:", useVidchainStore.getState().vidchainData);
  };

  const confirmPreview = () => {
    if (!player) return;
    if (vidchainData && vidchainData.clips.length > 0) {
      const firstClip = vidchainData.clips[0];
      const videoId = firstClip.videoId
      if (videoId) {
        player.loadVideoById({
          videoId,
          startSeconds: firstClip.start,
          endSeconds: firstClip.end,
        });
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="flex flex-row items-center gap-4 p-8">
        <div className="flex flex-col gap-4 items-center">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">{vidchainData?.sequenceTitle ?? "Vidchain"}</h1>
          <div ref={playerRef} className="rounded-lg" />

          {isReady && (
            <div className="flex gap-4">
              <button onClick={() => player?.playVideo()} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer scroll-m-20 text-sm font-semibold tracking-tight">Play</button>
              <button onClick={() => player?.pauseVideo()} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer scroll-m-20 text-sm font-semibold tracking-tight">Pause</button>
              <button onClick={() => player?.stopVideo()} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer scroll-m-20 text-sm font-semibold tracking-tight">Stop</button>
            </div>
          )}
        </div>

        {vidchainData && (
          <>
            <PreviewBar vidchainData={vidchainData} player={player} currentClipIndex={currentClipIndex} confirmPreview={confirmPreview} />
          </>
        )}
      </div>
      <Textarea ref={jsonInputField} className="w-1/2 h-80 p-2 border border-gray-300 rounded-lg" placeholder={placeholder} onChange={parseJSON} />

    </div>
  );
};

export default YouTubePlayer;
