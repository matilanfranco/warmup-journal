export type AudioItem = {
  id: string;
  name: string;
  durationSec: number; // real length of the audio file
  type: "breathing" | "range" | "relax" | "register";
  level: "easy" | "medium" | "hard";
  audioUrl: string; // /audio/...
  imageUrl?: string; // /images/...
};

export const AUDIO_LIBRARY: AudioItem[] = [
  {
    id: "aye-ah",
    name: "Aye ah aye ah - Chest to mix belt",
    durationSec: 63,
    type: "register",
    level: "medium",
    audioUrl: "/audio/aye_ah_aye_ah_chest_to_mix_belt.mp3",
  },
  {
    id: "gorilla",
    name: "Gorilla",
    durationSec: 13,
    type: "breathing",
    level: "easy",
    audioUrl: "/audio/gorilla.mp3",
  },
  {
    id: "hey-yeah",
    name: "Hey Yeah!",
    durationSec: 58,
    type: "range",
    level: "medium",
    audioUrl: "/audio/hey_yeah.mp3",
  },
  {
    id: "larynx-vox-fry-reset",
    name: "Larynx vox fry reset",
    durationSec: 19,
    type: "range",
    level: "medium",
    audioUrl: "/audio/larynx_vox_fry_reset.mp3",
  },
   {
    id: "lip-buzz-cold-down",
    name: "Lip buzz - cold down",
    durationSec: 63,
    type: "range",
    level: "medium",
    audioUrl: "/audio/lip_buzz_cold_down.mp3",
  }, 
  {
    id: "lip-buzzes",
    name: "Lip buzzes",
    durationSec: 76,
    type: "range",
    level: "medium",
    audioUrl: "/audio/lip_buzzes.mp3",
  },

  {
    id: "miau",
    name: "Miau!",
    durationSec: 95,
    type: "range",
    level: "medium",
    audioUrl: "/audio/miau.mp3",
  },
  {
    id: "nuh",
    name: "Nuh Nuh Nuh!",
    durationSec: 68,
    type: "range",
    level: "medium",
    audioUrl: "/audio/nuh.mp3",
  },
  {
    id: "wee-awe",
    name: "Wee awe!",
    durationSec: 33,
    type: "range",
    level: "medium",
    audioUrl: "/audio/wee_awe.mp3",
  },
  {
    id: "wuh-vocal-fry",
    name: "Wuh - Vocal fry!",
    durationSec: 64,
    type: "range",
    level: "medium",
    audioUrl: "/audio/wuh_vocal_fry.mp3",
  },
  {
    id: "speech-level-12345",
    name: "12345 – Speech Level",
    durationSec: 30,
    type: "register",
    level: "easy",
    audioUrl: "/audio/speech_level_12345.mp3",
  },
  {
    id: "speech-level-idowannago",
    name: "I Don't Wanna Go – Speech Level",
    durationSec: 26,
    type: "register",
    level: "easy",
    audioUrl: "/audio/speech_level_idowannago.mp3",
  },
  {
    id: "lip-buzz-sovt",
    name: "Lip Buzz – SOVT",
    durationSec: 75,
    type: "relax",
    level: "easy",
    audioUrl: "/audio/lip_buzz_sovt.mp3",
  },
  {
    id: "th-sovt",
    name: "TH – SOVT",
    durationSec: 99,
    type: "relax",
    level: "easy",
    audioUrl: "/audio/th_sovt.mp3",
  },
  {
    id: "way-chest",
    name: "Way – Chest",
    durationSec: 42,
    type: "register",
    level: "medium",
    audioUrl: "/audio/way_chest.mp3",
  },
  {
    id: "woah-chest",
    name: "Woah – Chest",
    durationSec: 42,
    type: "register",
    level: "medium",
    audioUrl: "/audio/woah_chest.mp3",
  },
  {
    id: "way-blend",
    name: "Way – Blend",
    durationSec: 53,
    type: "register",
    level: "medium",
    audioUrl: "/audio/way_blend.mp3",
  },
  {
    id: "binny-mix",
    name: "Binny – Mix",
    durationSec: 40,
    type: "register",
    level: "medium",
    audioUrl: "/audio/binny_mix.mp3",
  },
  {
    id: "mama-mix",
    name: "Mama – Mix",
    durationSec: 51,
    type: "register",
    level: "medium",
    audioUrl: "/audio/mama_mix.mp3",
  },
  {
    id: "watwatwat-mix",
    name: "Wat Wat Wat – Mix",
    durationSec: 43,
    type: "register",
    level: "medium",
    audioUrl: "/audio/watwatwat_mix.mp3",
  },
  {
    id: "coperto",
    name: "Coperto",
    durationSec: 80,
    type: "register",
    level: "medium",
    audioUrl: "/audio/coperto.mp3",
  },
  {
    id: "zing-ah-head-voice",
    name: "Zing Ah – Head Voice",
    durationSec: 64,
    type: "range",
    level: "medium",
    audioUrl: "/audio/zing_ah_head_voice.mp3",
  },
  {
    id: "head-agility",
    name: "Head Agility",
    durationSec: 45,
    type: "range",
    level: "hard",
    audioUrl: "/audio/head_agility.mp3",
  },
];

// helper: buscar item por id
export const getAudioById = (id: string) =>
  AUDIO_LIBRARY.find((a) => a.id === id);