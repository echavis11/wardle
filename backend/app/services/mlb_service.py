import pandas as pd
import os
import random

# ======================================================
# MODERN MLB TEAMS (LAHMAN IDS – INTERNAL USE ONLY)
# ======================================================

MODERN_MLB_TEAMS = {
    "ARI", "ATL", "BAL", "BOS", "CHN", "CHA", "CIN", "CLE", "COL", "DET",
    "HOU", "KCA", "ANA", "LAN", "MIA", "MIL", "MIN", "NYN", "NYA", "OAK",
    "PHI", "PIT", "SDN", "SEA", "SFN", "SLN", "TBA", "TEX", "TOR", "WAS"
}

# ======================================================
# DISPLAY MAPPINGS
# ======================================================

TEAM_NAME_MAPPING = {
    "ARI": "Arizona Diamondbacks",
    "ATL": "Atlanta Braves",
    "BAL": "Baltimore Orioles",
    "BOS": "Boston Red Sox",
    "CHN": "Chicago Cubs",
    "CHA": "Chicago White Sox",
    "CIN": "Cincinnati Reds",
    "CLE": "Cleveland Guardians",
    "COL": "Colorado Rockies",
    "DET": "Detroit Tigers",
    "HOU": "Houston Astros",
    "KCA": "Kansas City Royals",
    "ANA": "Los Angeles Angels",
    "LAN": "Los Angeles Dodgers",
    "MIA": "Miami Marlins",
    "MIL": "Milwaukee Brewers",
    "MIN": "Minnesota Twins",
    "NYN": "New York Mets",
    "NYA": "New York Yankees",
    "OAK": "Oakland Athletics",
    "PHI": "Philadelphia Phillies",
    "PIT": "Pittsburgh Pirates",
    "SDN": "San Diego Padres",
    "SEA": "Seattle Mariners",
    "SFN": "San Francisco Giants",
    "SLN": "St. Louis Cardinals",
    "TBA": "Tampa Bay Rays",
    "TEX": "Texas Rangers",
    "TOR": "Toronto Blue Jays",
    "WAS": "Washington Nationals",
}

TEAM_DISPLAY_ABBREV = {
    "ARI": "ARI",
    "ATL": "ATL",
    "BAL": "BAL",
    "BOS": "BOS",
    "CHN": "CHC",
    "CHA": "CWS",
    "CIN": "CIN",
    "CLE": "CLE",
    "COL": "COL",
    "DET": "DET",
    "HOU": "HOU",
    "KCA": "KC",
    "ANA": "LAA",
    "LAN": "LAD",
    "MIA": "MIA",
    "MIL": "MIL",
    "MIN": "MIN",
    "NYN": "NYM",
    "NYA": "NYY",
    "OAK": "OAK",
    "PHI": "PHI",
    "PIT": "PIT",
    "SDN": "SD",
    "SEA": "SEA",
    "SFN": "SF",
    "SLN": "STL",
    "TBA": "TB",
    "TEX": "TEX",
    "TOR": "TOR",
    "WAS": "WSH",
}

TEAM_COLORS = {
    "ARI": "#A71930",
    "ATL": "#13274F",
    "BAL": "#DF4601",
    "BOS": "#BD3039",
    "CHN": "#0E3386",
    "CHA": "#27251F",
    "CIN": "#C6011F",
    "CLE": "#00385D",
    "COL": "#33006F",
    "DET": "#0C2340",
    "HOU": "#002D62",
    "KCA": "#004687",
    "ANA": "#BA0021",
    "LAN": "#005A9C",
    "MIA": "#00A3E0",
    "MIL": "#12284B",
    "MIN": "#002B5C",
    "NYN": "#002D72",
    "NYA": "#003087",
    "OAK": "#003831",
    "PHI": "#E81828",
    "PIT": "#FDB827",
    "SDN": "#2F241D",
    "SEA": "#0C2C56",
    "SFN": "#FD5A1E",
    "SLN": "#C41E3A",
    "TBA": "#092C5C",
    "TEX": "#003278",
    "TOR": "#134A8E",
    "WAS": "#AB0003",
}

# ======================================================
# GLOBAL CACHES
# ======================================================

_players_cache = None
_teams_cache = None

# ======================================================
# DATA LOADING
# ======================================================

def _get_data_file_path(filename):
    return os.path.join(os.path.dirname(__file__), "..", "data", filename)

def safe_int(value):
    try:
        if pd.isna(value):
            return 0
        return int(value)
    except Exception:
        return 0


def load_mlb_data():
    global _players_cache, _teams_cache

    if _players_cache is not None and _teams_cache is not None:
        return _players_cache, _teams_cache

    batting_df = pd.read_csv(_get_data_file_path("Batting.csv"))
    people_df = pd.read_csv(_get_data_file_path("People.csv"))
    fielding_df = pd.read_csv(_get_data_file_path("Fielding.csv"))

    batting_df = batting_df[batting_df["AB"] >= 300]
    batting_df["batting_avg"] = batting_df["H"] / batting_df["AB"]

    best = batting_df.sort_values(
        ["playerID", "batting_avg", "AB"],
        ascending=[True, False, False]
    ).groupby("playerID").head(1)

    positions = (
        fielding_df.groupby("playerID")["POS"]
        .apply(lambda p: sorted(set(p.dropna())))
        .reset_index()
    )

    merged = best.merge(
        people_df[["playerID", "nameFirst", "nameLast"]],
        on="playerID",
        how="left"
    ).merge(
        positions,
        on="playerID",
        how="left"
    )

    players = []
    for _, r in merged.iterrows():
        players.append({
            "id": r["playerID"],
            "name": f"{r['nameFirst']} {r['nameLast']}",
            "team": r["teamID"],
            "batting_average": round(r["batting_avg"], 3),
            "year": safe_int(r["yearID"]),
            "hits": safe_int(r["H"]),
            "at_bats": safe_int(r["AB"]),
            "home_runs": safe_int(r["HR"]),
            "rbi": safe_int(r["RBI"]),
            "positions": r["POS"] if isinstance(r["POS"], list) else ["UTIL"]
        })

    teams_in_data = set(batting_df["teamID"].unique())
    teams = sorted(t for t in MODERN_MLB_TEAMS if t in teams_in_data)

    _players_cache = players
    _teams_cache = teams

    return players, teams

# ======================================================
# PLAYER FUNCTIONS
# ======================================================

def get_all_players():
    return load_mlb_data()[0]


def get_players_by_team(team_id):
    players, _ = load_mlb_data()
    return sorted(
        [p for p in players if p["team"] == team_id],
        key=lambda p: p["batting_average"],
        reverse=True
    )[:50]


def get_player_by_id(player_id):
    for p in load_mlb_data()[0]:
        if p["id"] == player_id:
            return p
    return None


def get_random_players_sample(count=50):
    players = [p for p in load_mlb_data()[0] if p["batting_average"] >= 0.200]
    return random.sample(players, min(count, len(players)))

# ======================================================
# TEAM FUNCTIONS
# ======================================================

def get_all_teams():
    return load_mlb_data()[1]


def get_random_team():
    teams = get_all_teams()
    return random.choice(teams) if teams else None


def get_team_display_name(team_id):
    return TEAM_NAME_MAPPING.get(team_id, team_id)


def get_team_display_abbrev(team_id):
    return TEAM_DISPLAY_ABBREV.get(team_id, team_id)


def get_team_color(team_id):
    return TEAM_COLORS.get(team_id, "#000000")


def get_team_stats(team_id):
    players = get_players_by_team(team_id)
    if not players:
        return None

    return {
        "team_id": team_id,
        "team_name": get_team_display_name(team_id),
        "team_abbrev": get_team_display_abbrev(team_id),
        "player_count": len(players),
        "avg_batting_average": round(
            sum(p["batting_average"] for p in players) / len(players), 3
        ),
        "total_home_runs": sum(p["home_runs"] for p in players),
        "total_rbis": sum(p["rbi"] for p in players)
    }

# ======================================================
# SEARCH
# ======================================================

def search_players(query, limit=10):
    q = query.lower()
    matches = [p for p in load_mlb_data()[0] if q in p["name"].lower()]
    return sorted(matches, key=lambda p: p["batting_average"], reverse=True)[:limit]
