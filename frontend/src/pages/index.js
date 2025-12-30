import { useState, useEffect, useContext } from "react";
import Header from "@/components/Header";
import TeamDisplay from "@/components/TeamDisplay";
import ShuffleButton from "@/components/ShuffleButton";
import { teamData } from "@/constants/teamData";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { token, username, setToken } = useContext(AuthContext);

  const [randomTeam, setRandomTeam] = useState(null);
  const [teamAbbrev, setTeamAbbrev] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [lineup, setLineup] = useState(Array(9).fill(null));
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamColor, setTeamColor] = useState("#FFFFFF");
  const [hasShuffled, setHasShuffled] = useState(false);
  const [hasPickedPlayer, setHasPickedPlayer] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Load saved high score if logged in
  useEffect(() => {
    const loadHighScore = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/high-score`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setHighScore(Number(data.high_score || 0));
      } catch {
        // ignore
      }
    };
    loadHighScore();
  }, [token, API_BASE_URL]);


  useEffect(() => {
    if (randomTeam) {
      console.log("Selected team:", randomTeam);
    }
  }, [randomTeam]);
  
  // Fetch players for selected team
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!randomTeam) return;
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
        setError(`Failed to load players for ${randomTeam}.`);
        setTeamPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamPlayers();
  }, [randomTeam, API_BASE_URL]);

  const handleShuffleTeam = async () => {
    if (hasShuffled && !hasPickedPlayer) return;

    try {
      setIsLoading(true);
      setError(null);
      setDropdownIndex(null);

      const res = await fetch(`${API_BASE_URL}/api/random-team`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setRandomTeam(data.team);
      setTeamAbbrev(data.team_abbrev);
      setTeamColor(teamData[data.team]?.color || "#FFFFFF");

      setHasShuffled(true);
      setHasPickedPlayer(false);
    } catch {
      setError("Failed to load random team.");
    } finally {
      setIsLoading(false);
    }
  };

  const positionLabels = ["C", "1B", "2B", "SS", "3B", "OF", "OF", "OF", "UTIL"];

  const getEligiblePlayers = (positionCode) => {
    if (positionCode === "UTIL") return teamPlayers;
    return teamPlayers.filter(
      (p) => Array.isArray(p.positions) && p.positions.includes(positionCode)
    );
  };

  const handleLineupSlotClick = (index) => {
    if (lineup[index] || !hasShuffled || hasPickedPlayer) return;
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleSelectPlayerForSlot = (index, player) => {
    if (lineup[index] || !hasShuffled || hasPickedPlayer) return;

    const updated = [...lineup];
    updated[index] = player;
    setLineup(updated);
    setDropdownIndex(null);
    setHasPickedPlayer(true);
    setHasShuffled(false);
  };

  const calculateTotalBattingAverage = () => {
    const filled = lineup.filter((p) => p !== null);
    if (filled.length === 0) return "0.000";
    const total = filled.reduce((sum, p) => sum + p.batting_average, 0);
    return (total / filled.length).toFixed(3);
  };

  const resetLocalState = () => {
    setRandomTeam(null);
    setTeamPlayers([]);
    setLineup(Array(9).fill(null));
    setDropdownIndex(null);
    setError(null);
    setHasShuffled(false);
    setHasPickedPlayer(false);
  };

  const handleResetGame = async () => {
    const finalScore = Number(calculateTotalBattingAverage());

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/high-score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ score: finalScore })
        });

        const data = await res.json();
        if (res.ok) {
          setHighScore(Number(data.high_score || 0));
        } else if (finalScore > highScore) {
          setHighScore(finalScore);
        }
      } catch {
        if (finalScore > highScore) setHighScore(finalScore);
      }
    } else {
      if (finalScore > highScore) setHighScore(finalScore);
    }

    resetLocalState();
  };

  const isLineupFull = lineup.every((slot) => slot !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        <Header />

        {/* Login / Logout */}
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

        {error && <p className="text-red-500 text-lg mt-4">{error}</p>}

        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="w-48 h-12 flex items-center justify-center bg-gray-700 rounded-xl mt-4">
              <p className="text-white text-lg font-semibold animate-pulse">
                Loading...
              </p>
            </div>
          ) : (
            <ShuffleButton
              onClick={handleShuffleTeam}
              disabled={hasShuffled && !hasPickedPlayer}
            />
          )}

          {randomTeam && (
            <TeamDisplay teamName={teamAbbrev} teamColor={teamColor} />
          )}
        </div>

        <div className="flex flex-col items-center mt-10">
          <h2 className="text-white text-2xl mb-6 font-semibold">Your Lineup</h2>

          <div className="grid grid-cols-3 gap-6">
            {lineup.map((player, index) => {
              const bgColor = player
                ? teamData[player.team]?.color || "#4B5563"
                : "#374151";

              return (
                <div key={index} className="relative flex flex-col items-center">
                  <button
                    onClick={() => handleLineupSlotClick(index)}
                    style={{ backgroundColor: bgColor }}
                    className={`w-36 h-24 text-white rounded-xl border border-white transition transform hover:scale-105 hover:shadow-xl flex flex-col justify-center items-center ${
                      lineup[index] ? "opacity-90 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="font-semibold">{positionLabels[index]}</span>
                    <span>{player ? player.name : "Empty Slot"}</span>
                    {player && (
                      <span className="text-yellow-400 text-sm mt-1">
                        Avg: {player.batting_average.toFixed(3)}
                      </span>
                    )}
                  </button>

                  {dropdownIndex === index &&
                    hasShuffled &&
                    !hasPickedPlayer &&
                    !lineup[index] && (
                      <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200">
                        {getEligiblePlayers(positionLabels[index]).map((p) => (
                          <div
                            key={p.id}
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-black transition"
                            onClick={() => handleSelectPlayerForSlot(index, p)}
                          >
                            {p.name}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          <p className="text-white text-xl mt-6">
            Total Batting Average:{" "}
            <span className="font-bold text-yellow-400">
              {calculateTotalBattingAverage()}
            </span>
          </p>

          {highScore > 0 && (
            <p className="text-white text-xl mt-6">
              High Score:{" "}
              <span className="font-bold text-green-400">
                {highScore.toFixed(3)}
              </span>
            </p>
          )}

          {isLineupFull && (
            <button
              onClick={handleResetGame}
              className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
