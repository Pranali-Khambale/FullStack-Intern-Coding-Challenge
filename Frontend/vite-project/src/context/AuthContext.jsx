import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser({
            id: decodedToken.id,
            role: decodedToken.role,
            email: decodedToken.email,
            name: decodedToken.name,
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, address, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, address, password }
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
