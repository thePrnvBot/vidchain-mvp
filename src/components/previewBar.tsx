import { motion } from "motion/react";
import { Play, Clock, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VidchainObject } from "../types";

type PreviewBarProps = {
  vidchainData: VidchainObject | null;
  player: YT.Player | null;
  currentClipIndex: React.MutableRefObject<number>;
  confirmPreview: () => void;
};

const clipVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  }),
};

const PreviewBar: React.FC<PreviewBarProps> = ({
  vidchainData,
  player,
  currentClipIndex,
  confirmPreview,
}) => {
  if (!vidchainData?.clips.length) return null;

  const totalDuration = vidchainData.clips.reduce(
    (acc, clip) => acc + (clip.end - clip.start),
    0
  );

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">Clip Sequence</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {vidchainData.clips.length} clips • {totalDuration}s total
        </p>
      </div>

      {/* Clips List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {vidchainData.clips.map((clip, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={clipVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => {
                if (!player || !clip.videoId) return;
                currentClipIndex.current = index;
                player.loadVideoById({
                  videoId: clip.videoId,
                  startSeconds: clip.start,
                  endSeconds: clip.end,
                });
              }}
            >
              {/* Clip Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0 relative">
                <img
                  src={clip.thumbnail}
                  alt={`Clip ${index + 1}`}
                  className="w-20 h-12 object-cover rounded-lg"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Clip {index + 1}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{clip.end - clip.start}s</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Action */}
      <div className="p-3 border-t border-border bg-muted/30">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={confirmPreview}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm transition-colors hover:bg-primary/90"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Play from Start</span>
        </motion.button>
      </div>
    </div>
  );
};

export default PreviewBar;
