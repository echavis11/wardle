from flask import Blueprint, jsonify, request
from app.services.mlb_service import (
    get_random_team, 
    get_team_display_name, 
    get_all_team_mappings,
    get_players_by_team, 
    get_player_by_id, 
    get_random_players_sample,
    get_team_stats,
    search_players,
    get_all_teams
)

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/status', methods=['GET'])
def status():
    """API health check"""
    return jsonify({"message": "Wardle Backend API is running!"}), 200

# ==================== GAME ENDPOINTS ====================

@api_bp.route("/start", methods=["GET"])
def start_game():
    """Initialize a new game"""
    return jsonify({"status": "started"})

@api_bp.route("/reset", methods=["POST"])
def reset_game():
    """Clear and restart game"""
    return jsonify({"status": "reset"})

@api_bp.route("/state", methods=["GET"])
def get_state():
    """Return current game state"""
    return jsonify({"state": "active", "message": "Game state placeholder"})

# ==================== TEAM ENDPOINTS ====================

@api_bp.route("/random-team", methods=["GET"])
def get_a_random_team_endpoint():
    """Get a random MLB team"""
    team_abbrev = get_random_team()
    
    if team_abbrev:
        return jsonify({
            "team": team_abbrev,
            "team_display": get_team_display_name(team_abbrev)
        }), 200
    else:
        return jsonify({"error": "Could not generate random team"}), 500

@api_bp.route('/teams', methods=['GET'])
def get_all_teams_endpoint():
    """Get all available teams"""
    teams = get_all_teams()
    team_mappings = get_all_team_mappings()
    
    return jsonify({
        "teams": teams,
        "team_mappings": team_mappings
    }), 200

@api_bp.route('/team-stats/<team_abbrev>', methods=['GET'])
def get_team_stats_endpoint(team_abbrev):
    """Get aggregate statistics for a team"""
    stats = get_team_stats(team_abbrev)
    
    if stats:
        return jsonify(stats), 200
    else:
        return jsonify({"error": "Team not found or no data available"}), 404

# ==================== PLAYER ENDPOINTS ====================

@api_bp.route('/team-players/<team_name>', methods=['GET'])
def get_players_for_team(team_name):
    """Get all players for a specific team"""
    players = get_players_by_team(team_name)
    team_display = get_team_display_name(team_name)
    
    return jsonify({
        "players": players,
        "team": team_name,
        "team_display": team_display,
        "count": len(players)
    }), 200

@api_bp.route('/player/<player_id>', methods=['GET'])
def get_single_player(player_id):
    """Get details for a specific player"""
    player = get_player_by_id(player_id)
    
    if player:
        return jsonify({"player": player}), 200
    else:
        return jsonify({"error": "Player not found"}), 404

@api_bp.route("/select", methods=["POST"])
def select_player():
    """Accept player selection"""
    data = request.get_json()
    player_id = data.get('player_id')
    
    if player_id:
        player = get_player_by_id(player_id)
        if player:
            return jsonify({"status": "selected", "player": player})
        else:
            return jsonify({"error": "Player not found"}), 404
    
    return jsonify({"error": "No player_id provided"}), 400

@api_bp.route('/sample-players', methods=['GET'])
def get_sample_players():
    """Get a random sample of players for testing"""
    count = request.args.get('count', 20, type=int)
    players = get_random_players_sample(count)
    
    return jsonify({
        "players": players,
        "count": len(players)
    }), 200

@api_bp.route('/search-players', methods=['GET'])
def search_players_endpoint():
    """Search for players by name"""
    query = request.args.get('q', '')
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify({"error": "No search query provided"}), 400
    
    players = search_players(query, limit)
    
    return jsonify({
        "players": players,
        "query": query,
        "count": len(players)
    }), 200