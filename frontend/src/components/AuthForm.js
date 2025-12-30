import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function AuthForm({ apiBaseUrl }) {
  const { setToken } = useContext(AuthContext);
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!username || !password) {
      setMsg("Enter a username and password.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "login" : "register";
      const res = await fetch(`${apiBaseUrl}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Error occurred.");
        return;
      }

      // Auto-login after register
      if (mode === "register") {
        const loginRes = await fetch(`${apiBaseUrl}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setMsg("Registered, but login failed.");
          return;
        }
        setToken(loginData.token, username);
      } else {
        setToken(data.token, username);
      }

      router.push("/"); // redirect to game
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
      <h2 className="text-white text-2xl font-semibold mb-6 text-center">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h2>

      <div className="flex justify-center gap-2 mb-6">
        {["login", "register"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl transition ${
              mode === m
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {m === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          className="px-4 py-3 rounded-xl bg-black/30 text-white border border-white/10 outline-none"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="px-4 py-3 rounded-xl bg-black/30 text-white border border-white/10 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "..." : mode === "login" ? "Log In" : "Register"}
        </button>

        {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}
      </form>
    </div>
  );
}
