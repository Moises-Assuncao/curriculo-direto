import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";
import Login from "./components/Login";
import ResumeBuilder from "./components/ResumeBuilder";
import { Loader2 } from "lucide-react";

const DEMO_USER = { uid: "demo-local", displayName: "Modo de teste", photoURL: null };

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Sem .env preenchido: pula direto pro construtor, salvando local no
    // navegador, só pra visualizar a interface sem precisar configurar o
    // Firebase ainda.
    if (!isFirebaseConfigured) {
      setUser(DEMO_USER);
      setCheckingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F6F7F5] flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[#1F6F5C]" />
      </div>
    );
  }

  return (
    <>
      {!isFirebaseConfigured && (
        <div className="bg-[#FFF4E5] text-[#7A5A00] text-xs text-center py-1.5 px-3">
          Modo de teste local — o Firebase ainda não foi configurado (veja o
          README). Os dados estão sendo salvos só neste navegador.
        </div>
      )}
      {user ? <ResumeBuilder user={user} /> : <Login />}
    </>
  );
}
