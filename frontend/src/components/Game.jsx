// components/Game.jsx
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { teamData } from "@/constants/teamData";
import TeamDisplay from "@/components/TeamDisplay";
import ShuffleButton from "@/components/ShuffleButton";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Game() {
  const { token, username, setToken } = useContext(AuthContext);

  const [randomTeam, setRandomTeam] = useState(null);
  const [teamAbbrev, setTeamAbbrev] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [lineup, setLineup] = useState(Array(9).fill(null));
  const [activeIndex, setActiveIndex] = useState(null);

  const [teamColor, setTeamColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [highScore, setHighScore] = useState(0);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [hasPickedPlayer, setHasPickedPlayer] = useState(false);

  const positionLabels = ["C", "1B", "2B", "SS", "3B", "OF", "OF", "OF", "UTIL"];

  /* ---------------- LOAD HIGH SCORE ---------------- */

  useEffect(() => {
    if (!token) return;

    const loadHighScore = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/high-score`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setHighScore(Number(data.high_score || 0));
      } catch {}
    };

    loadHighScore();
  }, [token]);

  /* ---------------- FETCH TEAM PLAYERS ---------------- */

  useEffect(() => {
    if (!randomTeam) return;

    const fetchPlayers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE_URL}/api/team-players/${encodeURIComponent(randomTeam)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTeamPlayers(data.players || []);
      } catch {
        setError("Failed to load players.");
        setTeamPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [randomTeam]);
  /* ---------------- GAME ACTIONS ---------------- */

  const shuffleTeam = async () => {
    if (hasShuffled && !hasPickedPlayer) return;

    try {
      setIsLoading(true);
      setError(null);
      setActiveIndex(null);

      const res = await fetch(`${API_BASE_URL}/api/random-team`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setRandomTeam(data.team);
      setTeamAbbrev(data.team_abbrev);
      setTeamColor(teamData[data.team]?.color || "#ffffff");

      setHasShuffled(true);
      setHasPickedPlayer(false);
    } catch {
      setError("Failed to load random team.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    shuffleTeam();
    
  }, []);

  const eligiblePlayers = (pos) => {
    if (pos === "UTIL") return teamPlayers;
    return teamPlayers.filter(
      (p) => Array.isArray(p.positions) && p.positions.includes(pos)
    );
  };

  const selectPlayer = (player) => {
    if (lineup[activeIndex]) return;

    const next = [...lineup];
    next[activeIndex] = player;

    setLineup(next);
    setActiveIndex(null);
    setHasPickedPlayer(true);
    setHasShuffled(false);
  };

  const totalAverage = () => {
    const filled = lineup.filter(Boolean);
    if (!filled.length) return "0.000";
    return (
      filled.reduce((s, p) => s + p.batting_average, 0) / filled.length
    ).toFixed(3);
  };

  const resetGame = async () => {
    const score = Number(totalAverage());

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/high-score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ score })
        });
        const data = await res.json();
        if (res.ok) setHighScore(Number(data.high_score || 0));
      } catch {
        if (score > highScore) setHighScore(score);
      }
    } else if (score > highScore) {
      setHighScore(score);
    }

    setRandomTeam(null);
    setTeamPlayers([]);
    setLineup(Array(9).fill(null));
    setActiveIndex(null);
    setHasShuffled(false);
    setHasPickedPlayer(false);
  };

  const lineupFull = lineup.every(Boolean);

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* AUTH BAR */}
      <div className="w-full flex justify-end mb-6">
        {token ? (
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              Signed in{username ? ` as ${username}` : ""}
            </span>
            <button
              onClick={() => setToken(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Log in
          </Link>
        )}
      </div>

      {error && <p className="text-red-500 text-lg mb-4">{error}</p>}

      {/* SHUFFLE */}
      <div className="flex flex-col items-center">
        {isLoading ? (
          <div className="text-white animate-pulse mt-4">Loading...</div>
        ) : (
          <ShuffleButton
            onClick={shuffleTeam}
            disabled={hasShuffled && !hasPickedPlayer}
          />
        )}

        {randomTeam && (
          <TeamDisplay teamName={teamAbbrev} teamColor={teamColor} />
        )}
      </div>

      {/* LINEUP GRID */}
      <div className="mt-10 flex flex-col items-center">
        <h2 className="text-white text-2xl mb-6 font-semibold">Your Lineup</h2>

        <div className="grid grid-cols-3 gap-6">
          {lineup.map((player, i) => (
            <div key={i} className="relative">
              <button
                onClick={() =>
                  !player && hasShuffled && !hasPickedPlayer && setActiveIndex(i)
                }
                style={{
                  backgroundColor: player
                    ? teamData[player.team]?.color
                    : "#374151"
                }}
                className={`w-36 h-24 rounded-xl text-white border border-white flex flex-col items-center justify-center transition
                  ${player ? "opacity-90 cursor-not-allowed" : "hover:scale-105"}`}
              >
                <span className="font-semibold">{positionLabels[i]}</span>
                <span>{player ? player.name : "Empty Slot"}</span>
                {player && (
                  <span className="text-yellow-400 text-sm">
                    {player.batting_average.toFixed(3)}
                  </span>
                )}
              </button>

              {/* GLASS DROPDOWN */}
              {activeIndex === i &&
                hasShuffled &&
                !hasPickedPlayer &&
                !player && (
                  <div
                    className="absolute z-20 mt-2 w-56 max-h-64 overflow-y-auto
                               bg-black/70 backdrop-blur-xl rounded-xl shadow-2xl
                               border border-white/10"
                  >
                    {eligiblePlayers(positionLabels[i]).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => selectPlayer(p)}
                        className="px-4 py-2 text-white cursor-pointer transition
                                   hover:bg-white/10 border-b border-white/5
                                   last:border-b-0"
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        <p className="text-white text-xl mt-6">
          Total Batting Average:{" "}
          <span className="font-bold text-yellow-400">{totalAverage()}</span>
        </p>

        {highScore > 0 && (
          <p className="text-white text-xl mt-2">
            High Score:{" "}
            <span className="font-bold text-green-400">
              {highScore.toFixed(3)}
            </span>
          </p>
        )}

        {lineupFull && (
          <button
            onClick={resetGame}
            className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition hover:scale-105"
          >
            Play Again
          </button>
        )}
      </div>
    </>
  );
}
