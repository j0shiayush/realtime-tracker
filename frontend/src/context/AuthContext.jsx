import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { disconnectActiveSocket } from "../utils/socketManager";

const API_URL = "http://localhost:4500";
const TOKEN_KEY = "token";
const USERNAME_KEY = "username";
const FULLNAME_KEY = "fullName";
const PROFILE_PICTURE_KEY = "profilePicture";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. A stronger lock to prevent React Strict Mode from double-firing
  const hasHandledOAuth = useRef(false); 

  useEffect(() => {
    // If we already handled the initial load or OAuth, do not run again
    if (hasHandledOAuth.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state"); 

    if (code && state) {
      // Lock the gate immediately so the second React render ignores this
      hasHandledOAuth.current = true; 

      fetch(`${API_URL}/auth/${state}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })
      .then(async (res) => {
        // We capture the JSON response first to check for backend errors
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Authentication failed");
        }
        return data;
      })
      .then(data => {
        if (data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USERNAME_KEY, data.user.username);
          localStorage.setItem(FULLNAME_KEY, data.user.fullName);
          if (data.user.profilePicture) {
            localStorage.setItem(PROFILE_PICTURE_KEY, data.user.profilePicture);
          }

          setToken(data.token);
          setUser({
            username: data.user.username,
            fullName: data.user.fullName,
            profilePicture: data.user.profilePicture || ""
          });
        }
      })
      .catch(err => {
        console.error(`🚨 OAuth Error (${state}):`, err);
        // This alert will tell you exactly what is failing if the loop happens again
        alert(`OAuth Login Failed: ${err.message}. Open DevTools (F12) for details.`);
      })
      .finally(() => {
        // Clean the URL only AFTER everything has finished processing
        window.history.replaceState({}, document.title, "/");
        setIsLoading(false);
      });
      
      return; 
    }

    // --- Standard Local Storage Check ---
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    const storedFullName = localStorage.getItem(FULLNAME_KEY);
    const storedProfilePicture = localStorage.getItem(PROFILE_PICTURE_KEY);

    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser({
        username: storedUsername,
        fullName: storedFullName || storedUsername,
        profilePicture: storedProfilePicture || ""
      });
    }

    setIsLoading(false);
    // Lock the gate for standard loads too
    hasHandledOAuth.current = true; 
  }, []);

  // 2. Standard Login
  const login = useCallback(async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USERNAME_KEY, data.username);
    localStorage.setItem(FULLNAME_KEY, data.fullName || data.username);
    if (data.profilePicture) {
      localStorage.setItem(PROFILE_PICTURE_KEY, data.profilePicture);
    }

    setToken(data.token);
    setUser({
      username: data.username,
      fullName: data.fullName || data.username,
      profilePicture: data.profilePicture || ""
    });

    return data;
  }, []);

  // 3. Register
  const register = useCallback(async (username, password, fullName) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, fullName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  }, []);

  // 4. Logout
  const logout = useCallback(() => {
    disconnectActiveSocket();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(FULLNAME_KEY);
    localStorage.removeItem(PROFILE_PICTURE_KEY);
    setToken(null);
    setUser(null);
    // Reset the lock when logging out so they can log back in
    hasHandledOAuth.current = false; 
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      register,
    }),
    [user, token, isLoading, login, logout, register]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}