
import polars as pl
import pathlib, json
parquet = pathlib.Path(__file__).parent / "bronze" / "tracks.parquet"
if not parquet.exists():
    print("bronze yok, önce 02_clean.py çalıştır")
    exit(1)

df = pl.read_parquet(parquet)

# Top 10
top10 = df.sort("likes", descending=True).head(10).to_dicts()

# Casio analysis
casio_df = df.filter(pl.col("title").str.contains("Casio"))
casio = casio_df.to_dicts()[0] if casio_df.shape[0]>0 else None

# Similar 12 tracks: F# minor + BPM 126-130
similar = df.filter(
    (pl.col("key_normalized") == "F# minor") &
    (pl.col("bpm") >= 126) & (pl.col("bpm") <= 130)
).to_dicts()

# Genre sweet spot
genre_stats = df.group_by("genre").agg([
    pl.col("bpm").mode().first().alias("most_common_bpm"),
    pl.col("likes").mean().alias("avg_likes"),
    pl.len().alias("count")
]).sort("avg_likes", descending=True).to_dicts()

analysis = {
    "total_tracks": df.shape[0],
    "casio": casio,
    "top10": top10,
    "similar_count": len(similar),
    "similar_avg_likes": sum(s["likes"] for s in similar)/len(similar) if similar else 0,
    "top_percentile": 100 * (1 - (sorted([d["likes"] for d in df.to_dicts()], reverse=True).index(casio["likes"])/df.shape[0])) if casio else 0,
    "genre_stats": genre_stats,
    "lfs": {
        "bpm": 128,
        "key": "F# minor",
        "lufs": -8.2,
        "drop_punch": 72,
        "recommendation": "Drop'ta punch eksik, transient shaper dene - Attack +35%, Sustain -20%, Tape sat"
    }
}

# Write to multiple places for frontend
out1 = pathlib.Path(__file__).parent / "silver" / "analytics.json"
out1.parent.mkdir(parents=True, exist_ok=True)
out1.write_text(json.dumps(analysis, indent=2))

out2 = pathlib.Path(__file__).parent.parent / "public" / "data" / "analytics.json"
out2.parent.mkdir(parents=True, exist_ok=True)
out2.write_text(json.dumps(analysis, indent=2))

out3 = pathlib.Path(__file__).parent.parent / "app" / "data" / "analytics.json"
out3.parent.mkdir(parents=True, exist_ok=True)
out3.write_text(json.dumps(analysis, indent=2))

print(f"✓ analytics.json → {out1}")
print(f"✓ analytics.json → {out2}")
print(json.dumps(analysis, indent=2)[:2000])
