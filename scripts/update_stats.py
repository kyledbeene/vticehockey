#!/usr/bin/env python3
"""Refresh the stats CSVs on the site so you only have to commit them.

  python3 scripts/update_stats.py d2          # pull D2 (ACHA) straight from the ACHA stats feed
  python3 scripts/update_stats.py d3          # read GameSheet exports from ~/Downloads (D3 / ACCHL M3)
  python3 scripts/update_stats.py all         # both
  add --dry-run to print what would change without writing

Both modes MERGE into the existing CSVs: the header row, player order, names and positions you
already fixed by hand (McCabe, D'Antona, ...) are kept, and only the stat columns are overwritten.
Players are matched by jersey number (goalies with no number in the feed: by last name).
A player on the feed but not in the CSV is appended; one in the CSV but not on the feed is left alone.
"""
import csv, json, re, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEASON_FILE = "2026-27"
DOWNLOADS = Path.home() / "Downloads"
MAX_AGE_HOURS = 72

# ---- D2 (ACHA / HockeyTech) --------------------------------------------------
ACHA_BASE = "https://lscluster.hockeytech.com/feed/index.php?key=e6867b36742a0c9d&client_code=acha&fmt=json"
ACHA_SEASON, ACHA_TEAM = 73, 372            # 2026-27 men's season, Virginia Tech
D2_DIR = ROOT / "stats"
D3_DIR = ROOT / "M2A" / "stats"

def fetch(q):
    with urllib.request.urlopen(urllib.request.Request(ACHA_BASE + q, headers={"User-Agent": "Mozilla/5.0"}), timeout=30) as r:
        return json.load(r)["SiteKit"]["Statviewtype"]

def i(x):
    try: return int(float(x))
    except (TypeError, ValueError): return 0

def f(x, places):
    try: return f"{float(x):.{places}f}"
    except (TypeError, ValueError): return f"{0:.{places}f}"

def acha_skater(p):
    gp = i(p.get("games_played")); pts = i(p.get("points"))
    return {"GP": gp, "G": i(p.get("goals")), "A": i(p.get("assists")), "PTS": pts,
            "Pt/G": f(pts / gp if gp else 0, 2), "PPG": i(p.get("power_play_goals")),
            "SHG": i(p.get("short_handed_goals")), "GWG": i(p.get("game_winning_goals")),
            "SOGW": i(p.get("shootout_winning_goals")), "PIM": i(p.get("penalty_minutes"))}

def acha_goalie(p):
    mins = i(p.get("minutes_played")); ga = i(p.get("goals_against"))
    return {"GP": i(p.get("games_played")), "W": i(p.get("wins")), "L": i(p.get("regulation_losses")),
            "OTL": i(p.get("ot_losses")), "SOL": i(p.get("shootout_losses")), "GA": ga,
            "GAA": f(ga * 60 / mins if mins else 0, 2).rstrip("0").rstrip(".") if mins else "0",
            "SVS": i(p.get("saves")), "SV%": f(p.get("save_percentage"), 3), "SO": i(p.get("shutouts")),
            "Min": mins, "SOW": i(p.get("shootout_wins"))}

# ---- D3 (GameSheet exports) --------------------------------------------------
# GameSheet header -> our header. Matching is case/punctuation-insensitive; first hit wins.
ALIASES = {
    "GP": ["gp", "gamesplayed"], "G": ["g", "goals"], "A": ["a", "assists"], "PTS": ["pts", "points", "p"],
    "Pt/G": ["ptg", "ppg_", "pointspergame", "ptspergame"], "PPG": ["ppg", "powerplaygoals"],
    "SHG": ["shg", "shorthandedgoals"], "GWG": ["gwg", "gamewinninggoals"], "W": ["w", "wins"],
    "PIM": ["pim", "penaltyminutes"], "L": ["l", "losses"], "OTL": ["otl", "overtimelosses"],
    "SOL": ["sol", "shootoutlosses"], "GA": ["ga", "goalsagainst"], "GAA": ["gaa", "goalsagainstaverage"],
    "SVS": ["svs", "sv", "saves"], "SV%": ["sv_", "svpct", "savepct", "savepercentage", "sv%"],
    "SO": ["so", "shutouts"], "Min": ["min", "mins", "minutes", "toi", "minutesplayed"], "SOW": ["sow", "shootoutwins"],
}
norm = lambda s: re.sub(r"[^a-z0-9%_]", "", (s or "").lower().replace("%", "_").replace("/", "")) or {"#": "num", "+/-": "plusminus"}.get((s or "").strip().strip("'"), "")

def newest(pattern):
    cutoff = time.time() - MAX_AGE_HOURS * 3600
    c = [p for p in DOWNLOADS.glob(pattern) if p.is_file() and p.stat().st_mtime >= cutoff]
    return max(c, key=lambda p: p.stat().st_mtime) if c else None

def read_rows(path):
    with open(path, newline="", encoding="utf-8-sig") as fh:
        return list(csv.DictReader(fh))

def gs_value(row, ours):
    by_norm = {norm(k): v for k, v in row.items() if k}
    for a in ALIASES.get(ours, []):
        if a in by_norm and by_norm[a] not in (None, ""):
            return by_norm[a].strip()
    return None

def gs_stats(row, header):
    out = {}
    for h in header[3:]:
        v = gs_value(row, h)
        if v is None and h == "Pt/G":
            gp, pts = i(gs_value(row, "GP")), i(gs_value(row, "PTS"))
            v = f"{pts / gp:.2f}" if gp else "0.00"
        out[h] = "--" if v is None else v
    return out

# ---- merge -------------------------------------------------------------------
def last(name): return re.sub(r"[^a-z]", "", name.split()[-1].lower()) if name.split() else ""

def merge(path, incoming, label):
    """incoming: list of dicts {num, name, pos, stats{col: value}}"""
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.reader(fh))
    incoming = [p for p in incoming if p["name"].strip().lower() not in ("empty net", "totals", "total", "team", "")]
    header, body = rows[0], [r for r in rows[1:] if any(r)]
    keep = len(header)
    changes, used = 0, set()
    for r in body:
        r += [""] * (keep - len(r))
        cand = [k for k, p in enumerate(incoming) if k not in used and (
            (p["num"] and r[0].strip() == str(p["num"])) or (not p["num"] and last(p["name"]) == last(r[1])))]
        if not cand: continue
        used.add(cand[0]); p = incoming[cand[0]]
        for h, v in p["stats"].items():
            if h in header:
                idx = header.index(h)
                if r[idx] != str(v): r[idx] = str(v); changes += 1
    for k, p in enumerate(incoming):
        if k not in used:
            print(f"  + {label}: adding #{p['num']} {p['name']} (not in CSV yet)")
            body.append([str(p["num"]), p["name"], p["pos"]] + [str(p["stats"].get(h, "--")) for h in header[3:]])
            changes += 1
    return header, [r[:keep] for r in body], changes

def write(path, header, body, dry):
    if dry: return
    with open(path, "r", newline="", encoding="utf-8") as fh:
        eol = "\r\n" if "\r\n" in fh.read(2000) else "\n"   # keep the file's existing line endings
    with open(path, "w", newline="", encoding="utf-8") as fh:
        csv.writer(fh, lineterminator=eol).writerows([header] + body)

def run_d2(dry):
    print("D2 (ACHA feed)")
    sk = [dict(num=p["jersey_number"], name=p["name"], pos=p["position"], stats=acha_skater(p))
          for p in fetch(f"&feed=modulekit&view=statviewtype&season_id={ACHA_SEASON}&team_id={ACHA_TEAM}")]
    gk = [dict(num=p.get("jersey_number", ""), name=p["name"], pos="G", stats=acha_goalie(p))
          for p in fetch(f"&feed=modulekit&view=statviewtype&type=goalies&season_id={ACHA_SEASON}&team_id={ACHA_TEAM}")]
    for kind, data in (("skaters", sk), ("goalies", gk)):
        path = D2_DIR / f"{kind}-{SEASON_FILE}.csv"
        h, b, n = merge(path, data, kind)
        write(path, h, b, dry)
        print(f"  {path.relative_to(ROOT)}: {n} value(s) {'would change' if dry else 'updated'}")

def run_d3(dry):
    print("D3 (GameSheet exports in ~/Downloads)")
    sf, gf = newest("player-stats*.csv"), newest("goalie-stats*.csv")
    if not sf and not gf:
        print("  No player-stats*.csv / goalie-stats*.csv from the last %dh in ~/Downloads. Export them from GameSheet first." % MAX_AGE_HOURS)
        return False
    for kind, src in (("skaters", sf), ("goalies", gf)):
        if not src: print(f"  no {kind} export found, skipping"); continue
        path = D3_DIR / f"{kind}-{SEASON_FILE}.csv"
        with open(path, newline="", encoding="utf-8") as fh: header = next(csv.reader(fh))
        rows = read_rows(src)
        data = []
        for r in rows:
            by = {norm(k): v for k, v in r.items() if k}
            name = (by.get("player") or by.get("name") or by.get("goalie") or "").strip()
            number = re.sub(r"\D", "", by.get("num") or by.get("number") or by.get("jersey") or "")
            if not name: continue
            data.append(dict(num=number, name=name.title(), pos=(by.get("pos") or by.get("pos.") or ("G" if kind == "goalies" else "")).strip(),
                             stats=gs_stats(r, header)))
        missing = [h for h in header[3:] if not any(gs_value(r, h) is not None for r in rows[:1])]
        h, b, n = merge(path, data, kind)
        write(path, h, b, dry)
        print(f"  {src.name} -> {path.relative_to(ROOT)}: {n} value(s) {'would change' if dry else 'updated'}")
        if missing: print(f"    columns not in the export (left as --): {', '.join(missing)}")
    return True

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    mode = args[0] if args else "all"
    if mode in ("d2", "all"): run_d2(dry)
    if mode in ("d3", "all"): run_d3(dry)
    if mode not in ("d2", "d3", "all"): sys.exit(__doc__)
    print("Done. Review with `git diff stats M2A/stats`, then commit." if not dry else "Dry run, nothing written.")
