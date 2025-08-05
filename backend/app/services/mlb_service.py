import pandas as pd
import os
import random

# Global caches
_players_cache = None
_teams_cache = None

# Team name mappings for better display
TEAM_NAME_MAPPING = {
    'NYA': 'New York Yankees',
    'BOS': 'Boston Red Sox', 
    'TOR': 'Toronto Blue Jays',
    'TBA': 'Tampa Bay Rays',
    'BAL': 'Baltimore Orioles',
    'CLE': 'Cleveland Guardians',
    'KC': 'Kansas City Royals',
    'CWS': 'Chicago White Sox',
    'DET': 'Detroit Tigers',
    'MIN': 'Minnesota Twins',
    'OAK': 'Oakland Athletics',
    'LAA': 'Los Angeles Angels',
    'HOU': 'Houston Astros',
    'SEA': 'Seattle Mariners',
    'TEX': 'Texas Rangers',
    'PHI': 'Philadelphia Phillies',
    'NYN': 'New York Mets',
    'WAS': 'Washington Nationals',
    'MIA': 'Miami Marlins',
    'ATL': 'Atlanta Braves',
    'STL': 'St. Louis Cardinals',
    'PIT': 'Pittsburgh Pirates',
    'CHN': 'Chicago Cubs',
    'MIL': 'Milwaukee Brewers',
    'CIN': 'Cincinnati Reds',
    'COL': 'Colorado Rockies',
    'LAN': 'Los Angeles Dodgers',
    'SD': 'San Diego Padres',
    'ARI': 'Arizona Diamondbacks',
    'SF': 'San Francisco Giants'
}

def _get_data_file_path(filename):
    """Helper to get the absolute path to a data file."""
    return os.path.join(os.path.dirname(__file__), '..', 'data', filename)

# ==================== DATA LOADING ====================

def load_mlb_data():
    global _players_cache, _teams_cache

    if _players_cache is not None and _teams_cache is not None:
        return _players_cache, _teams_cache

    try:
        batting_path = _get_data_file_path('Batting.csv')
        people_path = _get_data_file_path('People.csv')
        fielding_path = _get_data_file_path('Fielding.csv')

        batting_df = pd.read_csv(batting_path)
        people_df = pd.read_csv(people_path)
        fielding_df = pd.read_csv(fielding_path)

        # Filter for some meaningful ABs to avoid noise (e.g., accidental 1.000 from 1 AB)
        batting_df = batting_df[batting_df['AB'] >= 10]

        # Calculate batting average safely
        batting_df['batting_avg'] = batting_df.apply(
            lambda row: round(row['H'] / row['AB'], 3) if row['AB'] > 0 else 0.000,
            axis=1
        )

        # For each player, find the season with highest batting average
        best_seasons = batting_df.sort_values(['playerID', 'batting_avg', 'AB'], ascending=[True, False, False])
        best_batting = best_seasons.groupby('playerID').head(1)

        # Get most recent fielding position per player
        latest_fielding_year = fielding_df.groupby('playerID')['yearID'].max().reset_index()
        latest_fielding = fielding_df.merge(latest_fielding_year, on=['playerID', 'yearID'])
        all_positions = (
            fielding_df.groupby('playerID')['POS']
            .apply(lambda pos: ','.join(sorted(set(pos.dropna()))))
            .reset_index()
            .rename(columns={'POS': 'positions'})
        )

        # Merge batting with people info
        player_data = best_batting.merge(
            people_df[['playerID', 'nameFirst', 'nameLast']],
            on='playerID', how='left'
        )

        # Merge position info into player_data
        player_data = player_data.merge(all_positions, on='playerID', how='left')


        # Build players list
        players = []
        for _, row in player_data.iterrows():
            players.append({
                'id': row['playerID'],
                'name': f"{row['nameFirst']} {row['nameLast']}",
                'team': row['teamID'],
                'batting_average': row['batting_avg'],
                'year': int(row['yearID']),
                'hits': int(row['H']) if pd.notna(row['H']) else 0,
                'at_bats': int(row['AB']) if pd.notna(row['AB']) else 0,
                'home_runs': int(row['HR']) if pd.notna(row['HR']) else 0,
                'rbi': int(row['RBI']) if pd.notna(row['RBI']) else 0,
                'position': row['positions'] if pd.notna(row['positions']) else 'UTIL'
            })

        # Current MLB teams filtering
        current_mlb_teams = list(TEAM_NAME_MAPPING.keys())
        all_teams = batting_df['teamID'].unique().tolist()
        teams = [team for team in current_mlb_teams if team in all_teams]

        _players_cache = players
        _teams_cache = teams

        return players, teams

    except Exception as e:
        print(f"ERROR loading MLB data: {e}")
        import traceback
        traceback.print_exc()
        return [], []


# ==================== PLAYER FUNCTIONS ====================

def get_all_players():
    """Returns all loaded players."""
    players, _ = load_mlb_data()
    return players

def get_players_by_team(team_name):
    """Returns players for a specific team."""
    players, _ = load_mlb_data()
    
    team_players = [
        player for player in players 
        if player.get('team', '').upper() == team_name.upper()
    ]
    
    # Sort by batting average and return top players
    team_players = sorted(team_players, key=lambda p: p['batting_average'], reverse=True)
    return team_players[:20]  # Top 20 players

def get_player_by_id(player_id):
    """Returns a single player by ID."""
    players, _ = load_mlb_data()
    
    for player in players:
        if player.get('id') == player_id:
            return player
    return None

def get_random_players_sample(count=50):
    """Returns a random sample of players."""
    players, _ = load_mlb_data()
    
    # Filter for players with decent batting averages
    good_players = [p for p in players if p['batting_average'] >= 0.200]
    
    if len(good_players) < count:
        return good_players
    
    return random.sample(good_players, count)

# ==================== TEAM FUNCTIONS ====================

def get_all_teams():
    """Returns all available team abbreviations."""
    _, teams = load_mlb_data()
    return teams

def get_random_team():
    """Returns a random team abbreviation."""
    teams = get_all_teams()
    if not teams:
        print("Error: No teams available to select from")
        return None
    
    return random.choice(teams)

def get_team_display_name(team_abbrev):
    """Convert team abbreviation to full display name."""
    return TEAM_NAME_MAPPING.get(team_abbrev, team_abbrev)

def get_all_team_mappings():
    """Returns dictionary of all team abbreviations to display names."""
    return TEAM_NAME_MAPPING.copy()

# ==================== UTILITY FUNCTIONS ====================

def get_team_stats(team_abbrev):
    """Get aggregate stats for a team."""
    players = get_players_by_team(team_abbrev)
    
    if not players:
        return None
    
    total_players = len(players)
    avg_batting_avg = sum(p['batting_average'] for p in players) / total_players
    total_hrs = sum(p['home_runs'] for p in players)
    total_rbis = sum(p['rbi'] for p in players)
    
    return {
        'team': team_abbrev,
        'team_display': get_team_display_name(team_abbrev),
        'player_count': total_players,
        'avg_batting_average': round(avg_batting_avg, 3),
        'total_home_runs': total_hrs,
        'total_rbis': total_rbis
    }

def search_players(query, limit=10):
    """Search players by name."""
    players, _ = load_mlb_data()
    
    query_lower = query.lower()
    matching_players = [
        player for player in players 
        if query_lower in player['name'].lower()
    ]
    
    # Sort by batting average
    matching_players = sorted(matching_players, key=lambda p: p['batting_average'], reverse=True)
    
    return matching_players[:limit]