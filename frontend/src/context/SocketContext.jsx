import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import {
  clearActiveSocket,
  disconnectActiveSocket,
  setActiveSocket,
} from "../utils/socketManager";

const SOCKET_URL = "http://localhost:4500";

const SocketContext = createContext(null);

function usersReducer(state, action) {
  switch (action.type) {
    case "LOCATION_UPDATE": {
      const { id, latitude, longitude, username, fullName } = action.payload;
      const existing = state[id];
      const pathHistory = existing?.pathHistory ?? [];
      const newPoint = [latitude, longitude];
      const lastPoint = pathHistory[pathHistory.length - 1];
      const updatedPath =
        lastPoint &&
        lastPoint[0] === latitude &&
        lastPoint[1] === longitude
          ? pathHistory
          : [...pathHistory, newPoint];

      return {
        ...state,
        [id]: {
          id,
          username: username ?? existing?.username,
          fullName: fullName ?? existing?.fullName,
          currentLocation: { lat: latitude, lng: longitude },
          pathHistory: updatedPath,
          status: "connected",
        },
      };
    }
    case "USER_DISCONNECTED": {
      const id = action.payload;
      if (!state[id]) return state;
      return {
        ...state,
        [id]: { ...state[id], status: "disconnected" },
      };
    }
    default:
      return state;
  }
}

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [users, dispatch] = useReducer(usersReducer, {});
  const [socketId, setSocketId] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.username) {
      disconnectActiveSocket();
      setConnected(false);
      setSocketId(null);
      return;
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    setActiveSocket(socket);

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("receive-location", (data) => {
      dispatch({ type: "LOCATION_UPDATE", payload: data });
    });

    socket.on("user-disconnected", (id) => {
      dispatch({ type: "USER_DISCONNECTED", payload: id });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      clearActiveSocket();
    };
  }, [isAuthenticated, user?.username]);

  useEffect(() => {
    if (!connected || !navigator.geolocation || !user?.username) return;

    const username = user.username;
    const fullName = user.fullName;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socketRef.current?.emit("send-location", {
          latitude,
          longitude,
          username,
          fullName,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [connected, user?.username, user?.fullName]);

  const activeUsers = Object.values(users);

  return (
    <SocketContext.Provider
      value={{ users, activeUsers, socketId, connected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
