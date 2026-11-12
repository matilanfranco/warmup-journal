// The user's single cool down routine.
// Saved in localStorage and in users/{uid}/routines/cooldown (the cloud copy
// is the fallback when the phone has nothing, e.g. after reinstalling).

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const KEY = "cooldownRoutineItems";

function readLocal(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export async function getCooldownIds(): Promise<string[]> {
  const local = readLocal();
  if (local.length > 0) return local;
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  try {
    const snap = await getDoc(doc(db, `users/${uid}/routines`, "cooldown"));
    const ids = snap.exists() && Array.isArray(snap.data().audioIds) ? (snap.data().audioIds as string[]) : [];
    if (ids.length) localStorage.setItem(KEY, JSON.stringify(ids));
    return ids;
  } catch { return []; }
}

export async function saveCooldownIds(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  const uid = auth.currentUser?.uid;
  if (uid) {
    await setDoc(doc(db, `users/${uid}/routines`, "cooldown"), {
      audioIds: ids,
      updatedAt: new Date().toLocaleString(),
    });
  }
}
