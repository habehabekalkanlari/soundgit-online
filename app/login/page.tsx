"use client";
import { useEffect, useState } from "react";
export default function Login(){
  const [msg,setMsg]=useState("Google ile yetkilendiriliyor...");
  useEffect(()=>{
    setMsg("Google ile yetkilendiriliyor... Authorizing with Google...");
    const mockUser={ email:"user@gmail.com", name:"Producer", provider:"google", time:Date.now() };
    localStorage.setItem("soundgit_user", JSON.stringify(mockUser));
    localStorage.setItem("google_user", JSON.stringify(mockUser));
    localStorage.setItem("access_token", "google_auth_"+Date.now());
    setTimeout(()=>{ window.location.href="/studio"; }, 800);
  },[]);
  return (<div className="min-h-screen bg-black flex flex-col items-center justify-center text-white"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" /><p className="font-mono text-xs opacity-60 text-center">{msg}</p><p className="mt-4 text-[10px] opacity-30">Mock Google Auth · İlerde gerçek OAuth ile değişecek</p></div>);
}
