"""
DuckDB (Parquet sorgula: "hangi bounce tuttu?") -> SQL ile analiz
"""
import duckdb, pathlib

def query_bounces():
    parquet = pathlib.Path(__file__).parent/"bronze"/"tracks.parquet"
    if not parquet.exists():
        from _02_clean import clean_tracks
        clean_tracks()
    
    con = duckdb.connect()
    
    # 1. Hangi bounce tuttu? (likes'a göre)
    print("\n🔥 Hangi bounce tuttu? (Top 10)")
    q1 = con.execute(f"""
        SELECT title, bpm, key_normalized, likes, genre
        FROM '{parquet}'
        ORDER BY likes DESC
        LIMIT 10
    """).fetchdf()
    print(q1)
    
    # 2. BPM/Key analizi
    print("\n🎹 BPM/Key dağılımı")
    q2 = con.execute(f"""
        SELECT 
            key_normalized as key,
            AVG(bpm)::INT as avg_bpm,
            COUNT(*) as count,
            AVG(likes)::INT as avg_likes
        FROM '{parquet}'
        GROUP BY key
        ORDER BY count DESC
    """).fetchdf()
    print(q2)
    
    # 3. Genre + BPM sweet spot
    print("\n🎯 Genre BPM sweet spot")
    q3 = con.execute(f"""
        SELECT 
            genre,
            MODE(bpm) as most_common_bpm,
            AVG(likes) as avg_likes
        FROM '{parquet}'
        GROUP BY genre
        ORDER BY avg_likes DESC
    """).fetchdf()
    print(q3)
    
    # Silver tablo oluştur
    silver = pathlib.Path(__file__).parent/"silver"/"analytics.parquet"
    silver.parent.mkdir(exist_ok=True)
    con.execute(f"COPY (SELECT * FROM '{parquet}' WHERE likes > 5) TO '{silver}' (FORMAT PARQUET)")
    print(f"\n✓ Silver -> {silver}")
    
    return {"top": q1, "keys": q2, "genres": q3}

if __name__=="__main__":
    query_bounces()
