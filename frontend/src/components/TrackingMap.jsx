import { Fragment, useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useSocket } from "../context/SocketContext";
import { getUserColor } from "../utils/userColor";

const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function createUserIcon(color, isSelf) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${isSelf ? 18 : 14}px;
      height: ${isSelf ? 18 : 14}px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.9);
      border-radius: 50%;
      box-shadow: 0 0 12px ${color}, 0 0 24px ${color}66;
    "></div>`,
    iconSize: [isSelf ? 18 : 14, isSelf ? 18 : 14],
    iconAnchor: [isSelf ? 9 : 7, isSelf ? 9 : 7],
  });
}

function MapViewController({ users, socketId }) {
  const map = useMap();
  const self = socketId ? users[socketId] : null;

  useEffect(() => {
    if (!self?.currentLocation) return;
    map.setView(
      [self.currentLocation.lat, self.currentLocation.lng],
      map.getZoom() || 16,
      { animate: true }
    );
  }, [self?.currentLocation?.lat, self?.currentLocation?.lng, map, socketId]);

  return null;
}

export default function TrackingMap() {
  const { activeUsers, users, socketId } = useSocket();

  const defaultCenter = useMemo(() => {
    const self = socketId ? users[socketId] : null;
    if (self?.currentLocation) {
      return [self.currentLocation.lat, self.currentLocation.lng];
    }
    return [20, 0];
  }, [socketId, users]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={16}
      zoomControl={false}
      className="absolute inset-0 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url={DARK_TILE_URL}
      />
      <MapViewController users={users} socketId={socketId} />
      {activeUsers.map((user) => {
        if (!user.currentLocation) return null;
        const color = getUserColor(user.id);
        const position = [user.currentLocation.lat, user.currentLocation.lng];
        const isSelf = user.id === socketId;

        return (
          <Fragment key={user.id}>
            {user.pathHistory.length > 1 && (
              <Polyline
                positions={user.pathHistory}
                pathOptions={{
                  color,
                  weight: 3,
                  opacity: user.status === "connected" ? 0.85 : 0.35,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}
            <Marker
              position={position}
              icon={createUserIcon(color, isSelf)}
              opacity={user.status === "connected" ? 1 : 0.5}
            />
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
