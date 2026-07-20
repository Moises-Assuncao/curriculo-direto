import React, { useState } from "react";
import { FileText } from "lucide-react";
import { signInWithGoogle } from "../firebase";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5] flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white border border-[#E3E6E1] rounded-xl p-8 text-center">
        <div className="w-11 h-11 rounded-lg bg-[#1F6F5C] flex items-center justify-center mx-auto mb-4">
          <FileText size={22} className="text-white" />
        </div>
        <h1
          style={{ fontFamily: "Fraunces, serif" }}
          className="text-2xl font-bold text-[#12181F] mb-1"
        >
          Currículo Direto
        </h1>
        <p className="text-sm text-[#6B7268] mb-6">
          Entre com sua conta Google para criar e guardar seu currículo com
          segurança.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 border border-[#D7DBD3] rounded-md py-2.5 font-semibold text-sm text-[#12181F] hover:bg-[#F6F7F5] transition-colors disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16 4 9.1 8.5 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9 39.4 15.9 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.6C41.6 36 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        {error && <p className="text-xs text-[#B4483B] mt-3">{error}</p>}

        <p className="text-xs text-[#8A9187] mt-6">
          Seus dados ficam salvos na sua conta e só você tem acesso a eles.
        </p>
      </div>
    </div>
  );
}
