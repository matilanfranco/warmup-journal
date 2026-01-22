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
    id: "aye-ah",
    name: "Aye ah aye ah - Chest to mix belt",
    durationSec: 45,
    type: "register",
    level: "medium",
    audioUrl: "/audio/aye_ah_aye_ah_chest_to_mix_belt.mp3",
  },
  {
    id: "gorilla",
    name: "Gorilla",
    durationSec: 60,
    type: "breathing",
    level: "easy",
    audioUrl: "/audio/gorilla.mp3",
  },
  {
    id: "hey-yeah",
    name: "Hey Yeah!",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/hey_yeah.mp3",
  },
  {
    id: "larynx-vox-fry-reset",
    name: "Larynx vox fry reset",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/larynx_vox_fry_reset.mp3",
  },
   {
    id: "lip-buzz-cold-down",
    name: "Lip buzz - cold down",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/lip_buzz_cold_down.mp3",
  }, 
  {
    id: "lip-buzzes",
    name: "Lip buzzes",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/lip_buzzes.mp3",
  },

  {
    id: "miau",
    name: "Miau!",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/miau.mp3",
  },
  {
    id: "nuh",
    name: "Nuh Nuh Nuh!",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/nuh.mp3",
  },
  {
    id: "wee-awe",
    name: "Wee awe!",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/wee_awe.mp3",
  },
  {
    id: "wuh-vocal-fry",
    name: "Wuh - Vocal fry!",
    durationSec: 50,
    type: "range",
    level: "medium",
    audioUrl: "/audio/wuh_vocal_fry.mp3",
  }
  
];

// helper: buscar item por id
export const getAudioById = (id: string) =>
  AUDIO_LIBRARY.find((a) => a.id === id);