export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rvuiklogpbknbqvizddv.supabase.co"
    const secret = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    if (!secret) {
      return NextResponse.json({ tracks: [], error: "No secret" })
    }
    const res = await fetch(`${url}/rest/v1/tracks?select=*&order=created_at.desc`, {
      headers: {
        "apikey": secret,
        "Authorization": `Bearer ${secret}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    })
    const data = await res.json()
    if (!Array.isArray(data)) {
      return NextResponse.json({ tracks: [], error: data })
    }
    return NextResponse.json({ tracks: data })
  } catch (e: any) {
    return NextResponse.json({ tracks: [], error: e.message }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rvuiklogpbknbqvizddv.supabase.co"
    const secret = process.env.SUPABASE_SECRET_KEY || ""
    const res = await fetch(`${url}/rest/v1/tracks`, {
      method: "POST",
      headers: {
        "apikey": secret,
        "Authorization": `Bearer ${secret}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    return NextResponse.json(data[0] || data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
