import json
import random
import os

def load_teams():
    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'teams.json')

    try:
        with open(file_path, 'r') as file:
            teams = json.load(file)
        
    except FileNotFoundError:
        teams = [
            "Yankees", "Red Sox", "Blue Jays", "Rays", "Orioles",
            "Guardians", "Royals", "White Sox", "Tigers", "Twins",
            "Athletics", "Angels", "Astros", "Mariners", "Rangers",
            "Phillies", "Mets", "Nationals", "Marlins", "Braves",
            "Cardinals", "Pirates", "Cubs", "Brewers", "Reds",
            "Rockies", "Dodgers", "Padres", "Diamondbacks", "Giants"
        ]
    return teams

def get_random_team():
    all_teams = load_teams()
    if not all_teams:
        print("Error: No teams available to select from")
        return None

    random_team = random.choice(all_teams)
    return random_team
