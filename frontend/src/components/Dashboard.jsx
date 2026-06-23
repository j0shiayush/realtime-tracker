import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  MapPin,
  Radio,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

function StatusDot({ status }) {
  const isConnected = status === "connected";
  return (
    <span className="relative flex h-3 w-3">
      {isConnected && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${
          isConnected ? "bg-emerald-400" : "bg-red-500"
        }`}
      />
    </span>
  );
}

function formatCoord(value) {
  return value?.toFixed(6) ?? "—";
}

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const { user: authUser, logout } = useAuth();
  const { activeUsers, socketId, connected } = useSocket();

  const connectedCount = activeUsers.filter(
    (user) => user.status === "connected"
  ).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute left-0 top-1/2 z-30 -translate-y-1/2 rounded-r-xl border border-l-0 border-white/10 bg-slate-900/70 p-2 text-white backdrop-blur-md transition-all hover:bg-slate-800/80"
        style={{ left: isOpen ? "20rem" : "0" }}
        aria-label={isOpen ? "Close dashboard" : "Open dashboard"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <aside
        className={`absolute left-0 top-0 z-20 flex h-full w-80 flex-col border-r border-white/10 bg-slate-950/60 backdrop-blur-md transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2">
              <Radio className="text-cyan-400" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Live Tracker
              </h1>
              <p className="text-xs text-slate-400">Real-time fleet view</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={14} />
                <span className="text-xs uppercase tracking-wide">Active</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-white">
                {connectedCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-slate-400">
                {connected ? (
                  <Wifi size={14} className="text-emerald-400" />
                ) : (
                  <WifiOff size={14} className="text-red-400" />
                )}
                <span className="text-xs uppercase tracking-wide">You</span>
              </div>
              <p className="mt-1 text-sm font-medium text-white">
                {connected ? "Connected" : "Offline"}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Users
          </h2>

          {activeUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
              <MapPin className="mx-auto mb-2 text-slate-500" size={24} />
              <p className="text-sm text-slate-400">Waiting for location data…</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {activeUsers.map((user) => {
                const isSelf = user.id === socketId;
                const displayName = isSelf
                  ? authUser?.fullName || user.fullName || authUser?.username
                  : user.fullName || user.username || `User ${user.id.slice(0, 8)}`;

                return (
                  <li
                    key={user.id}
                    className={`rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10 ${
                      isSelf ? "ring-1 ring-cyan-400/40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusDot status={user.status} />
                          <p className="truncate text-sm font-medium text-white">
                            {displayName}
                          </p>
                        </div>
                        <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
                          {user.id}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          user.status === "connected"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-white/5 bg-slate-900/40 px-2 py-1.5">
                        <span className="text-slate-500">Lat</span>
                        <p className="font-mono text-slate-200">
                          {formatCoord(user.currentLocation?.lat)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-slate-900/40 px-2 py-1.5">
                        <span className="text-slate-500">Lng</span>
                        <p className="font-mono text-slate-200">
                          {formatCoord(user.currentLocation?.lng)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-[10px] text-slate-500">
                      Trail points: {user.pathHistory.length}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {socketId && (
          <footer className="border-t border-white/10 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Your Socket ID
            </p>
            <p className="mt-1 truncate font-mono text-xs text-slate-300">
              {socketId}
            </p>
          </footer>
        )}

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition-all hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
