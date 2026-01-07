import { useEffect, useState } from "react";
import HeaderBar from "@/components/HeaderBar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/leaderboard`);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        setLeaders(data.leaderboard || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <HeaderBar />

      <div className="flex justify-center p-8">
        <div className="w-full max-w-xl bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h1 className="text-white text-3xl font-bold !mb-6 !text-center">
            Leaderboard
          </h1>

          {loading && (
            <p className="text-white animate-pulse">
              Loading leaderboard…
            </p>
          )}

          {error && (
            <p className="text-red-400">{error}</p>
          )}

          {!loading && !error && leaders.length === 0 && (
            <p className="text-white/70">No scores yet.</p>
          )}

          {!loading && !error && leaders.length > 0 && (
            <ul className="space-y-4">
              {leaders.map((user, index) => (
                <LeaderboardRow
                  key={user.username}
                  rank={index + 1}
                  username={user.username}
                  score={user.high_score}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ rank, username, score }) {
  const podiumStyles = {
    1: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black",
    2: "bg-gradient-to-r from-gray-300 to-gray-400 text-black",
    3: "bg-gradient-to-r from-amber-600 to-amber-700 text-black",
  };

  const baseStyle =
    "flex justify-between items-center rounded-xl px-6 py-4 transition";

  const style =
    podiumStyles[rank] ?? "bg-white/10 text-white";

  return (
    <li className={`${baseStyle} ${style}`}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg">
          #{rank}
        </span>

        <span className="font-semibold">
          {username}
        </span>
      </div>

      <span className="font-mono font-bold">
        {score.toFixed(3)}
      </span>
    </li>
  );
}


