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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center p-8">
      <div className="w-full max-w-xl bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
        
        {/* TOP ROW: logo + nav + auth */}
        <HeaderBar />

        {/* PAGE TITLE */}
        <h1 className="text-white text-3xl font-bold mb-6">
          Leaderboard
        </h1>

        {loading && (
          <p className="text-white animate-pulse">
            Loading leaderboard…
          </p>
        )}

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && leaders.length === 0 && (
          <p className="text-white/70">
            No scores yet.
          </p>
        )}

        {!loading && !error && leaders.length > 0 && (
          <ul className="space-y-3">
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
  );
}

/* ---------- React sub-component ---------- */

function LeaderboardRow({ rank, username, score }) {
  return (
    <li className="flex justify-between items-center bg-white/10 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-yellow-400 font-bold text-lg">
          #{rank}
        </span>
        <span className="text-white font-semibold">
          {username}
        </span>
      </div>
      <span className="text-green-400 font-mono">
        {score.toFixed(3)}
      </span>
    </li>
  );
}