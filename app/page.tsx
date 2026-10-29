"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animationId: number
    let time = 0
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      time += 0.015
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const waves = [
        { color: '#00ff88', amp: 80, freq: 0.008, speed: 1, y: canvas.height * 0.5 },
        { color: '#0088ff', amp: 60, freq: 0.012, speed: 1.3, y: canvas.height * 0.5 + 20 },
        { color: '#ff0088', amp: 40, freq: 0.015, speed: 0.8, y: canvas.height * 0.5 - 20 },
      ]
      waves.forEach((wave, idx) => {
        ctx.beginPath()
        ctx.strokeStyle = wave.color
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.6 - idx * 0.15
        for (let x = 0; x < canvas.width; x += 2) {
          const y = wave.y + Math.sin(x * wave.freq + time * wave.speed) * wave.amp + Math.sin(x * wave.freq * 0.5 + time * wave.speed * 0.7) * wave.amp * 0.5
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 20
        ctx.shadowColor = wave.color
        ctx.stroke()
        ctx.shadowBlur = 0
      })
      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(draw)
    }
    draw()
    // Check user - Supabase auth'dan gelen hash'i parse et
    const checkUser = () => {
      const hash = window.location.hash
      if (hash.includes('access_token')) {
        // Supabase auth callback - user bilgisini localStorage'a kaydet (basit)
        try {
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get('access_token')
          if (accessToken) {
            // JWT decode ile user bilgisi (basit)
            const payload = JSON.parse(atob(accessToken.split('.')[1]))
            setUser({ email: payload.email, avatar: payload.user_metadata?.avatar_url, name: payload.user_metadata?.full_name || payload.email })
            localStorage.setItem('soundgit_user', JSON.stringify({ email: payload.email, avatar: payload.user_metadata?.avatar_url }))
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (e) {}
      } else {
        const saved = localStorage.getItem('soundgit_user')
        if (saved) setUser(JSON.parse(saved))
      }
    }
    checkUser()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])
  const handleGoogleLogin = () => {
    window.location.href = `https://rvuiklogpbknbqvizddv.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`
  }
  const handleLogout = () => {
    localStorage.removeItem('soundgit_user')
    setUser(null)
  }
  const handleDonate = () => {
    window.open('https://www.buymeacoffee.com/habehabekalkanlari', '_blank')
  }
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-6 right-6 z-20 flex gap-3 items-center">
        {user ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 backdrop-blur rounded-full border border-zinc-700">
              {user.avatar && <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />}
              <span className="text-xs text-white max-w-[120px] truncate">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-zinc-800 text-white font-bold rounded-full hover:bg-zinc-700 transition text-sm">Çıkış</button>
            <button onClick={handleDonate} className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition text-sm">☕ Donate</button>
          </>
        ) : (
          <>
            <button onClick={handleDonate} className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition text-sm">☕ Donate</button>
            <button onClick={handleGoogleLogin} className="px-4 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition text-sm flex items-center gap-2"><span>G</span> Google ile Giriş</button>
          </>
        )}
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">SOUNDGIT</h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-mono">Bounce Version Control for Producers</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/studio" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition text-lg">→ Open Studio</Link>
            <a href="https://github.com/habehabekalkanlari/soundgit-online" target="_blank" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition text-lg"> GitHub</a>
          </div>
        </div>
      </div>
    </div>
  )
}
