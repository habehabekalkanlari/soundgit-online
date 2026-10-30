"""
DuckDB (Parquet sorgula: "hangi bounce tuttu?") -> Polars fallback + DuckDB optional
"""
import pathlib

def query_with_polars():
    import polars as pl
    parquet = pathlib.Path(__file__).parent / "bronze" / "tracks.parquet"
    if not parquet.exists():
        import sys
        from importlib.util import spec_from_file_location, module_from_spec
        spec = spec_from_file_location("clean", str(pathlib.Path(__file__).parent / "02_clean.py"))
        m = module_from_spec(spec)
        spec.loader.exec_module(m)
        m.clean_tracks()

    df = pl.read_parquet(parquet)

    print("\n🔥 Hangi bounce tuttu? (Top 10)")
    q1 = df.sort("likes", descending=True).head(10).select(["title","bpm","key_normalized","likes","genre"])
    print(q1)

    print("\n🎹 BPM/Key dağılımı")
    q2 = df.group_by("key_normalized").agg([
        pl.col("bpm").mean().cast(pl.Int32).alias("avg_bpm"),
        pl.len().alias("count"),
        pl.col("likes").mean().cast(pl.Int32).alias("avg_likes")
    ]).sort("count", descending=True)
    print(q2)

    print("\n🎯 Genre BPM sweet spot")
    q3 = df.group_by("genre").agg([
        pl.col("bpm").mode().first().alias("most_common_bpm"),
        pl.col("likes").mean().alias("avg_likes")
    ]).sort("avg_likes", descending=True)
    print(q3)

    # Casio özel
    casio = df.filter(pl.col("title").str.contains("Casio"))
    if casio.shape[0]>0:
        print("\n🎵 Casio-MT-45 analizi:")
        print(casio)

    silver = pathlib.Path(__file__).parent / "silver" / "analytics.parquet"
    silver.parent.mkdir(parents=True, exist_ok=True)
    df.filter(pl.col("likes") > 5).write_parquet(silver)
    print(f"\n✓ Silver -> {silver}")
    return {"top": q1, "keys": q2, "genres": q3}

def query_with_duckdb():
    import duckdb
    parquet = pathlib.Path(__file__).parent / "bronze" / "tracks.parquet"
    con = duckdb.connect()
    print("\n🔥 Hangi bounce tuttu? (Top 10)")
    q1 = con.execute(f"SELECT title, bpm, key_normalized, likes, genre FROM '{parquet}' ORDER BY likes DESC LIMIT 10").fetchdf()
    print(q1)
    print("\n🎹 BPM/Key dağılımı")
    q2 = con.execute(f"SELECT key_normalized as key, AVG(bpm)::INT as avg_bpm, COUNT(*) as count, AVG(likes)::INT as avg_likes FROM '{parquet}' GROUP BY key ORDER BY count DESC").fetchdf()
    print(q2)
    print("\n🎯 Genre BPM sweet spot")
    q3 = con.execute(f"SELECT genre, MODE(bpm) as most_common_bpm, AVG(likes) as avg_likes FROM '{parquet}' GROUP BY genre ORDER BY avg_likes DESC").fetchdf()
    print(q3)
    silver = pathlib.Path(__file__).parent / "silver" / "analytics.parquet"
    silver.parent.mkdir(parents=True, exist_ok=True)
    con.execute(f"COPY (SELECT * FROM '{parquet}' WHERE likes > 5) TO '{silver}' (FORMAT PARQUET)")
    print(f"\n✓ Silver -> {silver}")
    return {"top": q1, "keys": q2, "genres": q3}

def query_bounces():
    try:
        return query_with_duckdb()
    except Exception as e:
        print(f"DuckDB yok ({e}), Polars fallback...")
        return query_with_polars()

if __name__ == "__main__":
    query_bounces()
