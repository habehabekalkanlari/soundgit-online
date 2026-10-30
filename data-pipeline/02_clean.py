"""
Polars (BPM/Key temizle) -> BPM, Key, Loudness normalize eder
"""
import polars as pl
import pathlib, json
import librosa
import re

def clean_tracks():
    raw_path = pathlib.Path(__file__).parent/"raw"/"tracks.json"
    if not raw_path.exists():
        print("raw/tracks.json yok, mock data oluşturuluyor...")
        # Mock data
        mock = [
            {"title": f"Bounce v{i}", "artist": "Producer", "bpm": 128+i%5, "key": ["F#m","Am","Gm","Em"][i%4], "genre": "techno", "source": "soundgit", "url": "", "likes": 10+i}
            for i in range(100)
        ]
        raw_path.parent.mkdir(exist_ok=True)
        raw_path.write_text(json.dumps(mock))
    
    data = json.loads(raw_path.read_text())
    df = pl.DataFrame(data)
    
    # Temizle
    df = df.with_columns([
        pl.col("bpm").cast(pl.Int16, strict=False).fill_null(128),
        pl.col("key").str.strip_chars().str.to_uppercase().fill_null("UNKNOWN"),
        pl.col("genre").str.to_lowercase().fill_null("unknown"),
        pl.col("likes").cast(pl.Int32, strict=False).fill_null(0),
        pl.col("title").str.strip_chars(),
    ])
    
    # BPM outlier temizle
    df = df.filter((pl.col("bpm") >= 60) & (pl.col("bpm") <= 200))
    
    # Key normalize: F#m -> F# minor
    df = df.with_columns(
        pl.col("key").str.replace_all("M", " major").str.replace_all("m", " minor").alias("key_normalized")
    )
    
    # Kaydet - Parquet (DuckDB için)
    bronze = pathlib.Path(__file__).parent/"bronze"/"tracks.parquet"
    bronze.parent.mkdir(exist_ok=True)
    df.write_parquet(bronze)
    
    print(f"✓ Polars temizledi: {df.shape[0]} track")
    print(df.head(5))
    print(f"-> {bronze}")
    return df

def analyze_bounce_audio(file_path: str):
    """Librosa ile bounce analizi - BPM/Key otomatik"""
    y, sr = librosa.load(file_path, duration=30)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    # Key detection basit
    key_idx = chroma.mean(axis=1).argmax()
    keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    return {"bpm": int(tempo), "key": keys[key_idx], "duration": librosa.get_duration(y=y, sr=sr)}

if __name__=="__main__":
    clean_tracks()
