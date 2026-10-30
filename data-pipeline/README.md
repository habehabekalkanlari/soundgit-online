# SoundGit Data Pipeline
## Stack: Playwright → Polars → DuckDB → LangGraph → LFM3-Omni-2B

### Kurulum
```bash
cd data-pipeline
pip install -r requirements.txt
playwright install chromium
```

### Çalıştır
```bash
# 1. Scrape (Splice/Beatport)
python 01_scrape.py

# 2. Temizle (BPM/Key)
python 02_clean.py

# 3. Sorgula (Hangi bounce tuttu?)
python 03_query.py

# 4. Agent yönet (full loop)
python 04_agent.py
```

### PondOS komutları
```bash
pondos data              # Full pipeline
pondos omni              # LFM3-Omni bilgisi
temizlik                 # Gereksiz cache temizle
pondos                   # Build + deploy
```

### LFM3-Omni-2B
- WebGPU: https://huggingface.co/spaces/LiquidAI/LFM3-Omni-2B-WebGPU
- On-device, audio dinler, waveform görür, konuşur
- Studio'da sağ altta OMNI butonu
