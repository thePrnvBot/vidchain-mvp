import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { VidchainObject } from "../types";

export const toVidchainObject = (data: any): VidchainObject => {
  return {
    sequenceTitle: data.sequenceTitle,
    clips: data.clips.map((clip: any) => ({
      videoId: clip.url.match(/v=([^&]+)/)?.[1] || "",
      thumbnail: `https://i.ytimg.com/vi/${clip.url.match(/v=([^&]+)/)?.[1] || ""}/maxresdefault.jpg`,
      start: clip.start,
      end: clip.end,
    })),
  };
}