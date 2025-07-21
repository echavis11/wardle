from flask import Blueprint, jsonify
from app.services.team_service import get_random_team
from app.services.player_service import get_players_by_team

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/status', methods=['GET'])
def status():
    """
    A simple status endpoint to check if the API is alive.
    """
    return jsonify({"message": "Wardle Backend API is running!"}), 200
@api_bp.route("/start", methods=["GET"])
def start_game():
    # shuffle teams and return grid setup
    return jsonify({"status": "started"})

@api_bp.route("/select", methods=["POST"])
def select_player():
    # accept player/team choice and update game state
    return jsonify({"status": "selected"})

@api_bp.route("/state", methods=["GET"])
def get_state():
    # return current grid state
    return jsonify({"state": "stub"})

@api_bp.route("/reset", methods=["POST"])
def reset_game():
    # clear and restart
    return jsonify({"status": "reset"})

@api_bp.route("/random-team", methods=["GET"])
def get_a_random_team_endpoint():
    team = get_random_team()

    if team:
        return jsonify({"team": team}), 200
    else:
        return jsonify({"Error: Could not generate random team"}), 500
    
@api_bp.route('/team-players/<team_name>', methods=['GET'])
def get_players_for_team(team_name):
    players = get_players_by_team(team_name)
    return jsonify({"players": players}), 200