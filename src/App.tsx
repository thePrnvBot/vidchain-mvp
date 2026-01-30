import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Square, Film, Code, AlertCircle } from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
} as const;

const YouTubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);
  const player = usePlayerStore((state) => state.player);
  const jsonInputField = useRef<HTMLTextAreaElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const currentClipIndex = useRef(0);

  const vidchainData = useVidchainStore((state) => state.vidchainData);

  const placeholder = `{
  "sequenceTitle": "My Awesome Sequence",
  "clips": [
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "start": 10,
      "end": 20
    },
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "start": 30,
      "end": 40
    }
  ]
}`;

  useEffect(() => {
    if (player) return;

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

    const initializePlayer = (videoId?: string) => {
      if (!playerRef.current) return;

      const newPlayer = new window.YT.Player(playerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId || "qAQahr6Eddg",
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event) => {
            if (event.data === 0) {
              queueNextClip();
            }
          },
        },
      });

      usePlayerStore.setState({ player: newPlayer });
    };

    loadYouTubeAPI();
  }, [player]);

  const queueNextClip = () => {
    const vidchainState = useVidchainStore.getState().vidchainData;
    if (!vidchainState?.clips) return;

    const nextIndex = currentClipIndex.current + 1;
    if (nextIndex < vidchainState.clips.length) {
      currentClipIndex.current = nextIndex;
      const nextClip = vidchainState.clips[nextIndex];
      if (!nextClip?.videoId) return;

      const player = usePlayerStore.getState().player;
      player?.loadVideoById({
        videoId: nextClip.videoId,
        startSeconds: nextClip.start,
        endSeconds: nextClip.end,
      });
    }
  };

  const parseJSON = () => {
    if (!jsonInputField.current) return;

    try {
      const rawValue = jsonInputField.current.value.trim();
      if (!rawValue) {
        setParseError(null);
        useVidchainStore.setState({ vidchainData: null });
        return;
      }

      const preProcessedParse = JSON.parse(rawValue);
      const processedParse = toVidchainObject(preProcessedParse);
      useVidchainStore.setState({ vidchainData: processedParse });
      setParseError(null);
      currentClipIndex.current = 0;
    } catch {
      setParseError("Invalid JSON format");
    }
  };

  const confirmPreview = () => {
    if (!player || !vidchainData?.clips.length) return;

    const firstClip = vidchainData.clips[0];
    if (firstClip?.videoId) {
      player.loadVideoById({
        videoId: firstClip.videoId,
        startSeconds: firstClip.start,
        endSeconds: firstClip.end,
      });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <Film className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {vidchainData?.sequenceTitle || "Vidchain"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {vidchainData?.clips.length
                  ? `${vidchainData.clips.length} clips loaded`
                  : "Create your video sequence"}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div ref={playerRef} className="absolute inset-0" />
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <AnimatePresence>
              {isReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => player?.playVideo()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium transition-colors hover:bg-primary/90"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => player?.pauseVideo()}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium transition-colors hover:bg-secondary/80"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => player?.stopVideo()}
                    className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-full font-medium transition-colors hover:bg-destructive/20"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Preview Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {vidchainData ? (
                <PreviewBar
                  key="preview"
                  vidchainData={vidchainData}
                  player={player}
                  currentClipIndex={currentClipIndex}
                  confirmPreview={confirmPreview}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border bg-muted/30"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Enter JSON below to load your video sequence
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* JSON Input Section */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Sequence Configuration
            </span>
          </div>

          <div className="relative">
            <Textarea
              ref={jsonInputField}
              className="min-h-[200px] font-mono text-sm bg-muted/50 border-border/50 resize-none focus:border-primary/50 focus:ring-primary/20"
              placeholder={placeholder}
              onChange={parseJSON}
              spellCheck={false}
            />

            <AnimatePresence>
              {parseError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-2 right-2 flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive text-xs rounded-lg"
                >
                  <AlertCircle className="w-3 h-3" />
                  {parseError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Paste your video sequence JSON above. Each clip requires a YouTube URL, start time, and end time.
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default YouTubePlayer;
