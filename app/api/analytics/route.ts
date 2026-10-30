import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'data');
    const p = path.join(baseDir, 'analytics.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, analytics: [] }, { status: 200 });
  }
}
