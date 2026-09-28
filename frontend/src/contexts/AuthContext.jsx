import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("@App:user");
      const storedToken = localStorage.getItem("@App:token");

      if (storedUser && storedUser !== "undefined") {
        if (storedToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.warn("Lixo encontrado no localStorage, limpando...", error);
      localStorage.removeItem("@App:user");
      localStorage.removeItem("@App:token");
    }
    return null;
  });

  const signIn = (userData, token) => {
    setUser(userData);
    localStorage.setItem("@App:user", JSON.stringify(userData));
    localStorage.setItem("@App:token", token);

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    delete api.defaults.headers.common["Authorization"];
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}