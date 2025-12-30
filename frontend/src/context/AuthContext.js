import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [username, setUsername] = useState(null);

  // Load from localStorage on first mount
  useEffect(() => {
    const savedToken = localStorage.getItem("wardle_token");
    const savedUsername = localStorage.getItem("wardle_username");
    if (savedToken) setTokenState(savedToken);
    if (savedUsername) setUsername(savedUsername);
  }, []);

  const setToken = (newToken, newUsername) => {
    if (!newToken) {
      localStorage.removeItem("wardle_token");
      localStorage.removeItem("wardle_username");
      setTokenState(null);
      setUsername(null);
      return;
    }

    localStorage.setItem("wardle_token", newToken);
    if (newUsername) localStorage.setItem("wardle_username", newUsername);

    setTokenState(newToken);
    setUsername(newUsername || null);
  };

  const value = useMemo(
    () => ({ token, username, setToken }),
    [token, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
