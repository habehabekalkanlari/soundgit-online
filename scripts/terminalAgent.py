#!/usr/bin/env python3
"""
PondOS v25 - Lokal Canli Terminal Ajani
Python subprocess + Pandas + Laya + Healer
"""
import subprocess
import sys
import time
import json
import os
try:
    import pandas as pd
    HAS_PANDAS = True
except:
    HAS_PANDAS = False
    print("Pandas yok, pip install pandas --break-system-packages")
class LayaAnalyzer:
    def analyze(self, log):
        lower = log.lower()
        crit = "info"
        score = 0
        if any(x in lower for x in ["error", "failed", "cannot", "module not found", "exited with 1"]):
            crit = "critical"; score = 90
        elif "warning" in lower or "warn" in lower:
            crit = "warning"; score = 50
        elif "compiled successfully" in lower or "ready" in lower or "ok" in lower:
            crit = "success"; score = 0
        file_match = None
        import re
        m = re.search(r'(app|lib|components)/[^\s:]+\.(ts|tsx|js|jsx)', log)
        if m: file_match = m.group(0)
        line_match = None
        m2 = re.search(r':(\d+):(\d+)', log)
        if m2: line_match = int(m2.group(1))
        return {"criticality": crit, "score": score, "file": file_match, "line": line_match}
class PandasParser:
    def __init__(self):
        self.laya = LayaAnalyzer()
    def parse(self, logs):
        rows = []
        for i, log in enumerate(logs):
            a = self.laya.analyze(log)
            rows.append({"index": i, "log": log[:300], **a})
        if HAS_PANDAS and rows:
            df = pd.DataFrame(rows)
            critical = df[df["criticality"] == "critical"]
            warnings = df[df["criticality"] == "warning"]
            return {
                "total": len(df),
                "critical": len(critical),
                "warnings": len(warnings),
                "critical_logs": critical.to_dict("records") if len(critical) > 0 else [],
                "all": rows,
                "top_files": df["file"].value_counts().head(3).to_dict() if "file" in df.columns else {}
            }
        else:
            critical = [r for r in rows if r["criticality"] == "critical"]
            warnings = [r for r in rows if r["criticality"] == "warning"]
            return {"total": len(rows), "critical": len(critical), "warnings": len(warnings), "critical_logs": critical, "all": rows, "top_files": {}}
class TerminalAgent:
    def __init__(self):
        self.parser = PandasParser()
    def run(self, command):
        print(f"Calistiriliyor: {command}")
        start = time.time()
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=120)
            output = result.stdout + result.stderr
            logs = [l for l in output.split("\n") if l.strip()][-100:]
            success = result.returncode == 0
            exit_code = result.returncode
        except Exception as e:
            output = str(e)
            logs = [output]
            success = False
            exit_code = 1
        duration = time.time() - start
        parsed = self.parser.parse(logs)
        print(f"{'OK' if success else 'FAIL'} Exit code: {exit_code}, Sure: {duration:.1f}s, Log: {len(logs)} satir")
        print(f"\n{'='*60}")
        print(f"{'Basarili' if success else 'Basarisiz'} - {parsed['critical']} kritik, {parsed['warnings']} uyari, {duration:.1f}s")
        print(f"Toplam: {parsed['total']}, Kritik: {parsed['critical']}, Uyari: {parsed['warnings']}")
        if parsed["top_files"]:
            print(f"Top dosyalar: {parsed['top_files']}")
        print(f"{'='*60}\n")
        # Kaydet
        result_data = {
            "command": command,
            "success": success,
            "exitCode": exit_code,
            "duration": duration,
            "logs": logs,
            "parsed": parsed,
            "output": output[:5000]
        }
        os.makedirs("/tmp", exist_ok=True)
        with open("/tmp/terminal_result.json", "w") as f:
            json.dump(result_data, f, indent=2)
        print(f"Detay: /tmp/terminal_result.json")
        return result_data
if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "npm run build"
    agent = TerminalAgent()
    agent.run(cmd)
