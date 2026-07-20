import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import ResumeBuilder from "./components/ResumeBuilder";
import { Loader2 } from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
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

  return user ? <ResumeBuilder user={user} /> : <Login />;
}
