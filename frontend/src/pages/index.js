import { useState, useEffect } from "react";
import BoxGrid from "@/components/BoxGrid";
import Header from "@/components/Header";
import TeamDisplay from "@/components/TeamDisplay";
import ShuffleButton from "@/components/ShuffleButton";
import { teamData } from "@/constants/teamData";

export default function Home() {
  const [randomTeam, setRandomTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [lineup, setLineup] = useState(Array(9).fill(null));
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamColor, setTeamColor] = useState("#FFFFFF");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // Fetch players when randomTeam changes
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!randomTeam) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE_URL}/api/team-players/${encodeURIComponent(randomTeam)}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTeamPlayers(data.players || []);
      } catch (e) {
        console.error(`Failed to fetch players for ${randomTeam}:`, e);
        setError(`Failed to load players for ${randomTeam}.`);
        setTeamPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamPlayers();
  }, [randomTeam, API_BASE_URL]);

  // Shuffle team handler (uses local teamData for color)
  const handleShuffleTeam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDropdownIndex(null);

      const res = await fetch(`${API_BASE_URL}/api/random-team`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      setRandomTeam(data.team);
      setTeamColor(teamData[data.team]?.color || "#FFFFFF");
    } catch (e) {
      console.error("Failed to fetch random team:", e);
      setError("Failed to load random team.");
    } finally {
      setIsLoading(false);
    }
  };

  // Position labels in order matching lineup slots
  const positionLabels = ["C", "1B", "2B", "SS", "3B", "OF", "OF", "OF", "UTIL"];

  // Filter players by position code
  const getEligiblePlayers = (positionCode) => {
    if (positionCode === "UTIL") {
      return teamPlayers; // allow any player
    }
    return teamPlayers.filter(
      (p) => Array.isArray(p.positions) && p.positions.includes(positionCode)
    );
  };

  // When clicking a lineup slot, toggle dropdown
  const handleLineupSlotClick = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  // When selecting a player from dropdown
  const handleSelectPlayerForSlot = (index, player) => {
    const updated = [...lineup];
    updated[index] = player;
    setLineup(updated);
    setDropdownIndex(null);
  };

  // Reset game
  const handleResetGame = () => {
    setRandomTeam(null);
    setTeamPlayers([]);
    setLineup(Array(9).fill(null));
    setDropdownIndex(null);
    setError(null);
  };

  // Calculate total batting average
  const calculateTotalBattingAverage = () => {
    const filled = lineup.filter((p) => p !== null);
    if (filled.length === 0) return "0.000";
    const total = filled.reduce((sum, p) => sum + p.batting_average, 0);
    return (total / filled.length).toFixed(3);
  };

  const isLineupFull = lineup.every((slot) => slot !== null);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        <Header />

        {isLoading && (
          <p className="text-white text-lg mt-6 animate-pulse">Loading...</p>
        )}
        {error && <p className="text-red-500 text-lg mt-6">{error}</p>}

        {!isLoading && !error && (
          <>
            <div className="flex flex-col items-center">
              <ShuffleButton
                onClick={handleShuffleTeam}
                disabled={dropdownIndex !== null}
              />

              {randomTeam && (
                <TeamDisplay teamName={randomTeam} teamColor={teamColor} />
              )}
            </div>

            <div className="flex flex-col items-center mt-10">
              <h2 className="text-white text-2xl mb-6 font-semibold">
                Your Lineup
              </h2>

              <div className="grid grid-cols-3 gap-6">
                {lineup.map((player, index) => {
                  const bgColor = player
                    ? teamData[player.team]?.color || "#4B5563"
                    : "#374151";

                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handleLineupSlotClick(index)}
                        style={{ backgroundColor: bgColor }}
                        className="w-36 h-20 text-white rounded-xl border border-white transition transform hover:scale-105 hover:shadow-xl"
                      >
                        {positionLabels[index]}
                        <br />
                        {player ? player.name : "Empty Slot"}
                      </button>

                      {dropdownIndex === index && (
                        <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200">
                          {getEligiblePlayers(positionLabels[index]).length ===
                          0 ? (
                            <div className="px-4 py-2 text-gray-500">
                              No players for this position
                            </div>
                          ) : (
                            getEligiblePlayers(positionLabels[index]).map((p) => (
                              <div
                                key={p.id}
                                className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-black transition"
                                onClick={() => handleSelectPlayerForSlot(index, p)}
                              >
                                {p.name}
                              </div>
                            ))
                          )}
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

              {isLineupFull && (
                <button
                  onClick={handleResetGame}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
