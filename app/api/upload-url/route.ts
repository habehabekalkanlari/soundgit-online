export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(url, secret)
    const { data, error } = await supabase.storage.from('tracks').createSignedUploadUrl(fileName)
    if (error) return NextResponse.json({error: error.message}, {status:500})
    return NextResponse.json({ signedUrl: data.signedUrl, path: data.path })
  } catch (e:any) {
    return NextResponse.json({error: e.message}, {status:500})
  }
}
