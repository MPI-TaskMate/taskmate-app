import { loginUser } from "../services/authService";
import { jwtDecode } from "jwt-decode";
import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContextDefinition";

type User = {
  userId: string;
  email: string;
};

type JwtPayload = {
  userId: string;
  email: string;
  exp: number;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(savedToken);

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password });

    localStorage.setItem("token", response.token);
    setToken(response.token);

    const decoded = jwtDecode<JwtPayload>(response.token);

    setUser({
      userId: decoded.userId,
      email: decoded.email,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}