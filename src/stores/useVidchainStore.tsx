import { create } from "zustand";
import type { VidchainObject } from "../types";

type VidchainStore = {
    vidchainData: VidchainObject | null;
    setVidchainData: (data: VidchainObject | null) => void;
};

export const useVidchainStore = create<VidchainStore>((set) => ({
    vidchainData: null,
    setVidchainData: (data) => set({ vidchainData: data }),
}));

export const usePlayerStore = create<{
    player: YT.Player | null;
    setPlayer: (player: YT.Player | null) => void;
}>((set) => ({
    player: null,
    setPlayer: (player) => set({ player }),
}));
