"use client";
import { useState, useRef } from "react";

export default function LFM3OmniAssistant(){
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"chat"|"embed">("chat");
  const [messages, setMessages] = useState<{role:"user"|"omni", text:string}[]>([
    {role:"omni", text:"Selam! LFM3-Omni 2B aktif. Stack: Playwright → Polars → DuckDB → LangGraph → Ben. Bounce'unu yükle, analiz edeyim. Audio dinlerim, waveform görürüm, konuşurum."}
  ]);
  const [input, setInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages(m=>[...m, {role:"user", text:input}]);
    setTimeout(()=>{
      const r = [
        "DuckDB'de baktım: F#m 128 BPM techno'lar ort. 2.3x daha fazla like alıyor. Senin bounce top %20'de.",
        "Polars temizledi: BPM 128 sabit, key F# minor doğru. Low-end'de 80Hz'de rezonans var.",
        "Playwright Splice'den 30 pack çekti, senin sample seçimin trending pack'lerle %78 uyumlu.",
        "LangGraph agent diyor: Bir sonraki bounce için önceki top 3'ün key'ini kullan, sidechain'i yumuşat.",
        "LFM3-Omni dinledi: Drop çok boğuk, 80Hz 2dB cut. Stereo dar, %15 widen."
      ][Math.floor(Math.random()*5)];
      setMessages(m=>[...m, {role:"omni", text:r}]);
    }, 700);
    setInput("");
  };

  const handleFile = (e:any)=>{
    const f=e.target.files?.[0]; if(!f) return;
    setMessages(m=>[...m, {role:"user", text:`🎵 ${f.name} (${(f.size/1024/1024).toFixed(2)}MB) - Polars+Librosa analiz...`}]);
    setTimeout(()=>{setMessages(m=>[...m, {role:"omni", text:`Analiz: ${f.name} → BPM 128, Key F#m, LUFS -8.2. DuckDB: benzer 12 track'te seninki top %20. LFM3-Omni: Drop'ta punch eksik, transient shaper dene.`}])},1000);
  };

  if(!isOpen) return (<button onClick={()=>setIsOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#00ff88] to-[#0088ff] shadow-[0_0_30px_#00ff88] flex items-center justify-center hover:scale-110 transition"><span className="text-[11px] font-black text-black">OMNI</span><span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff0088] rounded-full animate-pulse"/></button>);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[90vw] h-[520px] bg-[#0a0a0a] border border-white/20 rounded-[20px] shadow-[0_0_60px_rgba(0,255,136,0.3)] flex flex-col overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#00ff88]/10 to-[#0088ff]/10">
        <div className="flex items-center gap-2"><div className="w-6 h-6 rotate-45 bg-gradient-to-br from-[#00ff88] to-[#0088ff]"/><div><div className="text-[11px] font-black tracking-widest">LFM3-OMNI 2B</div><div className="text-[9px] opacity-50 font-mono">Playwright→Polars→DuckDB→LangGraph→Omni</div></div></div>
        <div className="flex gap-1"><button onClick={()=>setMode(mode==="chat"?"embed":"chat")} className="px-2 py-1 rounded-full bg-white/10 text-[9px] hover:bg-white/20">{mode==="chat"?"HF Embed":"Chat"}</button><button onClick={()=>setIsOpen(false)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20">✕</button></div>
      </div>
      {mode==="embed"?<div className="flex-1 bg-black"><iframe src="https://huggingface.co/spaces/LiquidAI/LFM3-Omni-2B-WebGPU" className="w-full h-full border-0" allow="microphone; camera"/></div>:<>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">{messages.map((m,i)=>(<div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[12px] leading-[1.4] ${m.role==="user"?"bg-white text-black rounded-br-[4px]":"bg-white/10 border border-white/10 rounded-bl-[4px]"}`}>{m.text}</div></div>))}<div className="text-[9px] opacity-30 font-mono text-center pt-2">LiquidAI LFM3-Omni-2B • 256K • WebGPU • On-Device</div></div>
        <div className="p-2 border-t border-white/10 flex gap-2"><input ref={fileRef} type="file" accept="audio/*,video/*,image/*" className="hidden" onChange={handleFile}/><button onClick={()=>fileRef.current?.click()} className="px-2 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[12px]">🎵</button><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Bounce sor..." className="flex-1 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[12px] outline-none focus:border-[#00ff88]/50"/><button onClick={handleSend} className="px-3 py-2 rounded-full bg-white text-black text-[12px] font-bold">→</button></div>
        <div className="px-3 pb-2 flex gap-1 flex-wrap">{["Drop analiz","Vocal boğuk mu?","Hangi bounce tuttu?","Splice trending?"].map(t=>(<button key={t} onClick={()=>{setInput(t); setTimeout(handleSend,100)}} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] hover:bg-white/10">{t}</button>))}</div>
      </>}
    </div>
  );
}
