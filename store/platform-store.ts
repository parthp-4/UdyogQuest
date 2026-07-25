"use client";

import { create } from "zustand";

type PlatformState = {
  activeProfileId: string | null;
  setActiveProfileId: (profileId: string | null) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
};

export const usePlatformStore = create<PlatformState>((set) => ({
  activeProfileId: null,
  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),
  assistantOpen: false,
  setAssistantOpen: (assistantOpen) => set({ assistantOpen })
}));

