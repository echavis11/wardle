import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

import { useRouter } from "next/router";

export default function AuthPanel({ apiBaseUrl, onLoggedInHighScore }) {
  const { token, username, setToken } = useContext(AuthContext);

  const [mode, setMode] = useState("login"); // "login" or "register"
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!u.trim() || !p.trim()) {
      setMsg("Enter a username and password.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "login" : "register";
      const res = await fetch(`${apiBaseUrl}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u.trim(), password: p })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Something went wrong.");
        return;
      }

      if (mode === "register") {
        // After registering, auto-login
        const loginRes = await fetch(`${apiBaseUrl}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u.trim(), password: p })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setMsg(loginData?.error || "Registered, but login failed.");
          return;
        }
        setToken(loginData.token, u.trim());
        onLoggedInHighScore?.(loginData.high_score ?? 0);
        router.push("/");
      } else {
        setToken(data.token, u.trim());
        onLoggedInHighScore?.(data.high_score ?? 0);
        router.push("/");
      }

      setP("");
    } catch (err) {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setMsg("Logged out.");
  };

  if (token) {
    return (
      <div className="w-full flex items-center justify-between bg-white/10 rounded-xl p-4 mt-6">
        <div className="text-white">
          <div className="font-semibold">Signed in{username ? ` as ${username}` : ""}</div>
          <div className="text-sm text-white/70">High score saves to your account.</div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/10 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode("login")}
          className={`px-3 py-1 rounded-lg text-white transition ${
            mode === "login" ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          className={`px-3 py-1 rounded-lg text-white transition ${
            mode === "register" ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={u}
          onChange={(e) => setU(e.target.value)}
          placeholder="Username"
          className="px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10 outline-none"
        />
        <input
          value={p}
          onChange={(e) => setP(e.target.value)}
          placeholder="Password"
          type="password"
          className="px-3 py-2 rounded-lg bg-black/30 text-white border border-white/10 outline-none"
        />

        <button
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
          type="submit"
        >
          {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        {msg && <div className="text-white/90 text-sm">{msg}</div>}
        <div className="text-white/60 text-xs">
          If you don’t log in, your high score is only saved for this session.
        </div>
      </form>
    </div>
  );
}
