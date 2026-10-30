"""
Playwright (Splice/Beatport scrape) -> Splice'den sample pack, Beatport'tan track data çeker
"""
from playwright.sync_api import sync_playwright
import polars as pl
from pydantic import BaseModel
from typing import Optional
import time, json, pathlib

class Track(BaseModel):
    title: str
    artist: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    genre: Optional[str] = None
    source: str
    url: str
    likes: Optional[int] = None

def scrape_beatport_top100(genre="techno", limit=50):
    tracks=[]
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Beatport Top 100
        page.goto(f"https://www.beatport.com/genre/{genre}/1", timeout=30000)
        page.wait_for_timeout(3000)
        # Kartları topla - selector Beatport'un yapısına göre
        items = page.query_selector_all("li[data-testid='track']")
        for item in items[:limit]:
            try:
                title = item.query_selector("[data-testid='track-title']") or item.query_selector("a")
                tracks.append(Track(
                    title=title.inner_text() if title else "Unknown",
                    bpm=None, key=None, genre=genre,
                    source="beatport", url=page.url
                ).model_dump())
            except: pass
        browser.close()
    return tracks

def scrape_splice_pack(pack_url="https://splice.com/sounds/packs"):
    tracks=[]
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(pack_url, timeout=30000)
        page.wait_for_timeout(4000)
        # Splice pack listesi
        cards = page.query_selector_all("div[data-testid='pack-card']") or page.query_selector_all("a[href*='/sounds/packs/']")
        for card in cards[:30]:
            try:
                tracks.append(Track(
                    title=card.inner_text()[:100],
                    source="splice", genre="sample-pack",
                    url=card.get_attribute("href") or pack_url
                ).model_dump())
            except: pass
        browser.close()
    return tracks

if __name__=="__main__":
    print("🔍 Beatport + Splice scraping...")
    data = scrape_splice_pack() + scrape_beatport_top100()
    # Kaydet - Parquet öncesi JSON
    out = pathlib.Path(__file__).parent/"raw"/"tracks.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(data, indent=2))
    print(f"✓ {len(data)} track -> {out}")
