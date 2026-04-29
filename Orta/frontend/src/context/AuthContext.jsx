import { useEffect, useState } from "react";
import { getProfile } from "../api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setIsChecking(false);
      return;
    }

    try {
      const data = await getProfile();
      setUser(data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async () => {
    setIsChecking(true);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsChecking(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isChecking,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
