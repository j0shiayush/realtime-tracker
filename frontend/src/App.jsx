import "leaflet/dist/leaflet.css";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import TrackingMap from "./components/TrackingMap";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <SocketProvider>
      <div className="relative h-full w-full overflow-hidden bg-slate-950">
        <TrackingMap />
        <Dashboard />
      </div>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
