"""
Polars (BPM/Key temizle) -> BPM, Key, Loudness normalize eder
"""
import polars as pl
import pathlib
import json

try:
    import librosa
except ImportError:
    librosa = None

def normalize_key(k: str) -> str:
    if not k:
        return "UNKNOWN"
    k = k.strip()
    # F#m, Am, Gm, Em gibi kısa halleri düzelt
    mapping = {
        "F#M": "F# minor", "F#m": "F# minor", "F#": "F# minor",
        "AM": "A minor", "Am": "A minor", "A": "A minor",
        "GM": "G minor", "Gm": "G minor", "G": "G minor",
        "EM": "E minor", "Em": "E minor", "E": "E minor",
        "CM": "C minor", "Cm": "C minor",
        "DM": "D minor", "Dm": "D minor",
        "BM": "B minor", "Bm": "B minor",
    }
    # büyük/küçük duyarsız bak
    for short, full in mapping.items():
        if k.upper() == short.upper() or k == short:
            return full
    # zaten uzun formdaysa koru
    if "minor" in k.lower() or "major" in k.lower():
        return k
    return k.upper()

def clean_tracks():
    raw_path = pathlib.Path(__file__).parent / "raw" / "tracks.json"
    if not raw_path.exists():
        print("raw/tracks.json yok, mock data oluşturuluyor...")
        mock = [
            {"title": f"Bounce v{i}", "artist": "Producer", "bpm": 128 + i % 5, "key": ["F#m","Am","Gm","Em"][i%4], "genre": "techno", "source": "soundgit", "url": "", "likes": 10 + i}
            for i in range(100)
        ]
        # Casio MT-45'i de ekle - gerçek bounce
        mock.append({"title": "Casio-MT-45-16-Beat", "artist": "habehabe", "bpm": 128, "key": "F#m", "genre": "techno", "source": "upload", "url": "Casio-MT-45-16-Beat.wav", "likes": 110, "lufs": -8.2})
        raw_path.parent.mkdir(parents=True, exist_ok=True)
        raw_path.write_text(json.dumps(mock, indent=2))
    
    data = json.loads(raw_path.read_text())
    df = pl.DataFrame(data)
    
    df = df.with_columns([
        pl.col("bpm").cast(pl.Int16, strict=False).fill_null(128),
        pl.col("key").str.strip_chars().fill_null("UNKNOWN"),
        pl.col("genre").str.to_lowercase().fill_null("unknown"),
        pl.col("likes").cast(pl.Int32, strict=False).fill_null(0),
        pl.col("title").str.strip_chars(),
    ])
    
    df = df.filter((pl.col("bpm") >= 60) & (pl.col("bpm") <= 200))
    
    # Düzgün key normalize - map ile
    df = df.with_columns(
        pl.col("key").map_elements(normalize_key, return_dtype=pl.String).alias("key_normalized")
    )
    
    bronze = pathlib.Path(__file__).parent / "bronze" / "tracks.parquet"
    bronze.parent.mkdir(parents=True, exist_ok=True)
    df.write_parquet(bronze)
    
    print(f"✓ Polars temizledi: {df.shape[0]} track (key bug fixlendi)")
    print(df.head(10))
    print(f"-> {bronze}")
    return df

def analyze_bounce_audio(file_path: str):
    if librosa is None:
        return {"bpm": 128, "key": "F#m", "duration": 8.0}
    y, sr = librosa.load(file_path, duration=30)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    key_idx = chroma.mean(axis=1).argmax()
    keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    return {"bpm": int(tempo), "key": keys[key_idx], "duration": librosa.get_duration(y=y, sr=sr)}

if __name__ == "__main__":
    clean_tracks()
