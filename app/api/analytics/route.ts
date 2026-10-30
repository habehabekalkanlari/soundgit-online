import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const possible = [
      path.join(process.cwd(), 'data-pipeline', 'silver', 'analytics.json'),
      path.join(process.cwd(), 'public', 'data', 'analytics.json'),
      path.join(process.cwd(), 'app', 'data', 'analytics.json'),
    ];
    for (const p of possible) {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return NextResponse.json(data);
      }
    }
    // fallback mock
    return NextResponse.json({
      total_tracks: 101,
      casio: { title: "Casio-MT-45-16-Beat", bpm: 128, key: "F#m", key_normalized: "F# minor", likes: 110, lufs: -8.2, genre: "techno" },
      similar_count: 12,
      top_percentile: 92,
      lfs: { bpm: 128, key: "F# minor", lufs: -8.2, drop_punch: 72, recommendation: "Drop'ta punch eksik, transient shaper dene" }
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
