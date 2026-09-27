import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("@App:user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const signIn = (userData, token) => {
    setUser(userData); 

    localStorage.setItem("@App:user", JSON.stringify(userData));
    localStorage.setItem("@App:token", token);
  };

  const signOut = () => {
    setUser(null); 
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    
    window.location.href = "/login";
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