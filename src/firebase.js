import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, query, orderBy,
} from "firebase/firestore";

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

const DEMO_LIST_KEY = "curriculo-direto:demo-lista";

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

function readDemoList() {
  const raw = window.localStorage.getItem(DEMO_LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}
function writeDemoList(list) {
  window.localStorage.setItem(DEMO_LIST_KEY, JSON.stringify(list));
}

// Cada usuário pode ter vários currículos, guardados em curriculos/{uid}/itens/{id}.
// Se a pessoa já tinha um currículo salvo no formato antigo (um só, em
// curriculos/{uid}), ele é migrado automaticamente pra essa lista na primeira
// vez que "listResumes" é chamado — nada se perde.
export async function listResumes(uid) {
  if (!isFirebaseConfigured) return readDemoList();

  const itemsRef = collection(db, "curriculos", uid, "itens");
  const snap = await getDocs(query(itemsRef, orderBy("atualizadoEm", "desc")));
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (items.length === 0) {
    const legacyRef = doc(db, "curriculos", uid);
    const legacySnap = await getDoc(legacyRef);
    if (legacySnap.exists()) {
      const legacy = legacySnap.data();
      const newRef = doc(itemsRef);
      const now = new Date().toISOString();
      const payload = {
        nome: "Meu currículo",
        data: legacy.data || null,
        template: legacy.template || "moderno",
        criadoEm: now,
        atualizadoEm: now,
      };
      await setDoc(newRef, payload);
      items = [{ id: newRef.id, ...payload }];
    }
  }
  return items;
}

export async function createResume(uid, nome) {
  const now = new Date().toISOString();
  if (!isFirebaseConfigured) {
    const item = { id: `demo-${Date.now()}`, nome, data: null, template: "moderno", criadoEm: now, atualizadoEm: now };
    writeDemoList([item, ...readDemoList()]);
    return item;
  }
  const itemsRef = collection(db, "curriculos", uid, "itens");
  const newRef = doc(itemsRef);
  const payload = { nome, data: null, template: "moderno", criadoEm: now, atualizadoEm: now };
  await setDoc(newRef, payload);
  return { id: newRef.id, ...payload };
}

export async function loadResumeItem(uid, id) {
  if (!isFirebaseConfigured) {
    return readDemoList().find((r) => r.id === id) || null;
  }
  const ref = doc(db, "curriculos", uid, "itens", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveResumeItem(uid, id, payload) {
  if (!isFirebaseConfigured) {
    const next = readDemoList().map((r) => (r.id === id ? { ...r, ...payload, atualizadoEm: new Date().toISOString() } : r));
    writeDemoList(next);
    return;
  }
  const ref = doc(db, "curriculos", uid, "itens", id);
  await setDoc(ref, { ...payload, atualizadoEm: new Date().toISOString() }, { merge: true });
}

export async function renameResumeItem(uid, id, nome) {
  return saveResumeItem(uid, id, { nome });
}

export async function deleteResumeItem(uid, id) {
  if (!isFirebaseConfigured) {
    writeDemoList(readDemoList().filter((r) => r.id !== id));
    return;
  }
  await deleteDoc(doc(db, "curriculos", uid, "itens", id));
}
