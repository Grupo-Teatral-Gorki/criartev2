"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, LoginResponse } from "../utils/interfaces";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse["user"]["data"] | null>(null);

  // Load token and user from localStorage when the app starts
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Erro ao carregar usuário do localStorage:", error);
    }
  }, []);

  // Save token and user to localStorage when logging in
  const login = (data: LoginResponse) => {
    setToken(data.token);
    setUser(data.user.data);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user.data));
  };

  // Clear token and user from state and localStorage on logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
