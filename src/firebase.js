import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "YOUR_ADMIN_GMAIL@gmail.com";

export const firebaseReady = Object.values(firebaseConfig).every(Boolean);

const app = firebaseReady && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = firebaseReady ? getAuth(app) : null;
export const db = firebaseReady ? getFirestore(app) : null;
export const storage = firebaseReady ? getStorage(app) : null;

export function isAdminUser(user) {
  return Boolean(user?.email && user.email.toLowerCase() === adminEmail.toLowerCase());
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase is not configured yet.");
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function signOutAdmin() {
  if (auth) {
    await signOut(auth);
  }
}
