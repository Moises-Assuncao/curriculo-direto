import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Se o .env não estiver preenchido ainda, a aplicação roda em "modo de teste
// local": sem login de verdade e salvando os dados no localStorage do
// navegador, só pra você conseguir ver a interface funcionando. Assim que
// você preencher o .env com as chaves reais do Firebase, isso é ignorado e
// o login com Google + salvamento na nuvem passam a valer.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = isFirebaseConfigured ? getAuth(app) : null;
export const db = isFirebaseConfigured ? getFirestore(app) : null;
const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

const DEMO_STORAGE_KEY = "curriculo-direto:demo-local";

export function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error("Firebase não configurado (modo de teste local)."));
  }
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  if (!isFirebaseConfigured) return Promise.resolve();
  return signOut(auth);
}

// Cada usuário tem um único documento com o currículo dele em curriculos/{uid}
export async function loadResume(uid) {
  if (!isFirebaseConfigured) {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  const ref = doc(db, "curriculos", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveResume(uid, payload) {
  if (!isFirebaseConfigured) {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
    return;
  }
  const ref = doc(db, "curriculos", uid);
  await setDoc(ref, { ...payload, atualizadoEm: new Date().toISOString() }, { merge: true });
}
