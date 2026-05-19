import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiBase";
import API from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // ✅ USER STATE
  const [user, setUser] = useState(null);

  // ✅ LOADING STATE (🔥 VERY IMPORTANT FIX)
  const [loading, setLoading] = useState(true);

  // 🔥 Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && storedUser !== "undefined" && token) {
        const parsedUser = JSON.parse(storedUser);

        setUser({
          ...parsedUser,
          role: parsedUser.role?.toLowerCase(),
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("User parse error:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      // ✅ IMPORTANT: stop loading after checking
      setLoading(false);
    }
  }, []);

  // 🔥 LOGIN (CONNECTED TO BACKEND)
  const login = async (credentials) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials
      );

      const token = res.data.data;

      // 🔥 Decode JWT
      const payload = JSON.parse(atob(token.split(".")[1]));

      const userData = {
        email: payload.sub,
        role: payload.role?.toLowerCase(),
        token: token,
      };

      // Resolve userId + fullName for loan APIs (GET /api/users)
      try {
        localStorage.setItem("token", token);
        const usersRes = await API.get("/users");
        const list = usersRes.data || [];
        const match = list.find(
          (u) => u.email?.toLowerCase() === userData.email?.toLowerCase()
        );
        if (match) {
          userData.userId = match.userId;
          userData.fullName = match.fullName;
          userData.name = match.fullName;
        }
      } catch (e) {
        console.warn("Could not load user profile for loans:", e);
      }

      // 🔥 Store in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      localStorage.setItem("role", userData.role);

      // ✅ SET USER
      setUser(userData);

      return userData;

    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid credentials");
    }
  };

  // 🔥 LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);