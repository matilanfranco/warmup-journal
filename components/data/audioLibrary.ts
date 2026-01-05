export type AudioItem = {
  id: string;
  name: string;
  durationSec: number; // por ahora mock, después lo calculamos
  type: "breathing" | "range" | "relax" | "register";
  level: "easy" | "medium" | "hard";
  audioUrl: string; // /audio/...
  imageUrl?: string; // /images/...
};

export const AUDIO_LIBRARY: AudioItem[] = [
  {
    id: "lip-trills-gentle",
    name: "Lip trills – gentle",
    durationSec: 45,
    type: "register",
    level: "easy",
    audioUrl: "/audio/lip-trills-gentle.m4a",
  },
  {
    id: "breath-control",
    name: "Breath control",
    durationSec: 60,
    type: "breathing",
    level: "easy",
    audioUrl: "/audio/breath-control.m4a",
  },
  {
    id: "sirens-medium",
    name: "Sirens – medium",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/sirens-medium.m4a",
  },
];

// helper: buscar item por id
export const getAudioById = (id: string) =>
  AUDIO_LIBRARY.find((a) => a.id === id);