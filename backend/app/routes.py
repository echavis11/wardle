from flask import Blueprint, jsonify, request
from app.services.mlb_service import (
    get_random_team, 
    get_team_display_name, 
    get_team_display_abbrev,
    get_players_by_team, 
    get_player_by_id, 
    get_random_players_sample,
    get_team_stats,
    search_players,
    get_all_teams,
    get_all_players,
    get_team_color
)
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from app.models import User
from app import db
from flask_jwt_extended.exceptions import JWTExtendedException

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
    team_id = get_random_team()

    if not team_id:
        return jsonify({"error": "Could not generate random team"}), 500

    return jsonify({
        "team": team_id,
        "team_display": get_team_display_name(team_id),
        "team_abbrev": get_team_display_abbrev(team_id),
        "color": get_team_color(team_id)
    })


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

@api_bp.route('/all-players', methods=['GET'])
def all_players():
    players = get_all_players()
    return jsonify({'players': players})

@api_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User exists"}), 400

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registered"}), 201


@api_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "high_score": user.high_score})

@api_bp.route("/high-score/<username>", methods=["GET"])
def get_high_score(username):
    user = User.query.filter_by(username=username).first()
    return jsonify({"high_score": user.high_score if user else 0})


@api_bp.route("/high-score/<username>", methods=["POST"])
def update_high_score(username):
    data = request.get_json() or {}
    score = float(data.get("score", 0))

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if score > user.high_score:
        user.high_score = score
        db.session.commit()

    return jsonify({"high_score": user.high_score})
