"use client";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const token = params.get("access_token");
        if (token) {
          localStorage.setItem("soundgit_user", JSON.stringify({ token, time: Date.now() }));
          localStorage.setItem("access_token", token);
          window.history.replaceState({}, document.title, window.location.pathname);
          setAuthed(true);
          return;
        }
      }
      const user = localStorage.getItem("soundgit_user");
      const token2 = localStorage.getItem("access_token");
      const googleUser = localStorage.getItem("google_user");
      setAuthed(!!(user || token2 || googleUser));
    };
    check();
  }, []);
  if (authed === null) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono text-xs">Yükleniyor...</div>;
  }
  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 rotate-45 bg-gradient-to-br from-[#00ff88] to-[#0088ff] mb-6 shadow-[0_0_30px_#00ff88]" />
        <h1 className="text-2xl font-black tracking-widest mb-2">STUDIO KİLİTLİ</h1>
        <p className="text-sm opacity-60 mb-2 text-center font-mono">Google ile giriş yapmadan stüdyoya giremezsin</p>
        <p className="text-[11px] opacity-40 mb-8 text-center">You must login with Google to access studio</p>
        <a href="/api/auth/login" className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition">Google ile Giriş Yap →</a>
        <a href="/" className="mt-6 text-xs opacity-50 hover:opacity-100 underline">← Ana Sayfa / Home</a>
      </div>
    );
  }
  return <>{children}</>;
}
