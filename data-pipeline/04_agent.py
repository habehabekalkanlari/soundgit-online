"""
LangGraph (Agent yönetir) -> Scrape -> Clean -> Query -> LFM3-Omni loop
"""
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
import pathlib, json

class PipelineState(TypedDict):
    step: str
    tracks: List[dict]
    cleaned: bool
    analytics: dict
    omni_feedback: str
    retries: int

def node_scrape(state: PipelineState):
    print("\n[LangGraph] 1. Scraping Beatport/Splice...")
    try:
        from _01_scrape import scrape_splice_pack, scrape_beatport_top100
        tracks = scrape_splice_pack() + scrape_beatport_top100()
    except:
        tracks = []
    return {"step": "scraped", "tracks": tracks, "retries": state.get("retries",0)}

def node_clean(state: PipelineState):
    print("[LangGraph] 2. Polars cleaning...")
    try:
        from _02_clean import clean_tracks
        clean_tracks()
        return {"step": "cleaned", "cleaned": True}
    except Exception as e:
        print(f"Clean hata: {e}")
        return {"step": "clean_failed", "retries": state.get("retries",0)+1}

def node_query(state: PipelineState):
    print("[LangGraph] 3. DuckDB query...")
    from _03_query import query_bounces
    analytics = query_bounces()
    return {"step": "queried", "analytics": {"top_count": len(analytics["top"])}}

def node_omni_feedback(state: PipelineState):
    print("[LangGraph] 4. LFM3-Omni-2B yorumluyor...")
    # Mock - gerçekte Liquid API çağrısı
    feedback = "LFM3-Omni: En çok tutan bounce'lar F# minor, 128 BPM, techno. Drop'ta sidechain çok agresif, biraz yumuşat. Bir sonraki bounce için önceki top 3'ün key'ini kullan."
    return {"step": "done", "omni_feedback": feedback}

def should_retry(state: PipelineState):
    if state.get("step")=="clean_failed" and state.get("retries",0)<2:
        return "clean"
    if state.get("step")=="done":
        return END
    return "query" if state.get("step")=="cleaned" else "omni"

# Graph
workflow = StateGraph(PipelineState)
workflow.add_node("scrape", node_scrape)
workflow.add_node("clean", node_clean)
workflow.add_node("query", node_query)
workflow.add_node("omni", node_omni_feedback)

workflow.set_entry_point("scrape")
workflow.add_edge("scrape", "clean")
workflow.add_conditional_edges("clean", should_retry, {"clean": "clean", "query": "query", END: END})
workflow.add_edge("query", "omni")
workflow.add_edge("omni", END)

app = workflow.compile()

if __name__=="__main__":
    print("🌀 LangGraph Pipeline başlıyor...")
    result = app.invoke({"step": "start", "tracks": [], "cleaned": False, "analytics": {}, "omni_feedback": "", "retries": 0})
    print("\n✅ Pipeline bitti:")
    print(json.dumps(result, indent=2, default=str))
