import json
import os

_players_cache = None # Global variable to cache players data

def _get_data_file_path(filename):
    """Helper to get the absolute path to a data file."""
    return os.path.join(os.path.dirname(__file__), '..', 'data', filename)

def load_players():
    """
    Loads MLB player data from 'players.json'.
    Caches the data in memory after the first load.
    """
    global _players_cache
    if _players_cache is not None:
        return _players_cache

    file_path = _get_data_file_path('players.json')
    players = []
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            players = json.load(file)
        if not isinstance(players, list) or not all(isinstance(p, dict) for p in players):
            raise ValueError("players.json is not a list of dictionaries.")
        _players_cache = players
        
    except FileNotFoundError:
        print(f"Error: players.json not found at {file_path}. Please ensure it exists.")
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {file_path}. Check file format.")
    except ValueError as e:
        print(f"Error in players.json format: {e}")
        
    return players

def get_players_by_team(team_name):
    """
    Returns a list of players belonging to the specified team.
    """
    all_players = load_players()
    if not all_players:
        return [] # No players loaded
        
    team_players = [
        player for player in all_players 
        if player.get('team') == team_name
    ]
    return team_players

def get_player_by_id(player_id):
    """
    Returns a single player dictionary by their ID.
    """
    all_players = load_players()
    if not all_players:
        return None
        
    # Convert player_id to string if your IDs are strings in JSON
    player_id_str = str(player_id) 
    
    for player in all_players:
        if str(player.get('id')) == player_id_str: # Ensure type comparison is consistent
            return player
    return None