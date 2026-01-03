import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("wardle_token");
    const savedUsername = localStorage.getItem("wardle_username");

    if (
      savedToken &&
      savedToken !== "undefined" &&
      savedToken !== "null"
    ) {
      setTokenState(savedToken);
      if (savedUsername) setUsername(savedUsername);
    } else {
      localStorage.removeItem("wardle_token");
      localStorage.removeItem("wardle_username");
    }
  }, []);

  const setToken = (newToken, newUsername) => {
    if (
      !newToken ||
      newToken === "undefined" ||
      newToken === "null"
    ) {
      localStorage.removeItem("wardle_token");
      localStorage.removeItem("wardle_username");
      setTokenState(null);
      setUsername(null);
      return;
    }

    localStorage.setItem("wardle_token", newToken);
    if (newUsername) {
      localStorage.setItem("wardle_username", newUsername);
      setUsername(newUsername);
    }

    setTokenState(newToken);
  };

  const value = useMemo(
    () => ({ token, username, setToken }),
    [token, username]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
