import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext'; // Adjust path if needed

// Fix for default Leaflet icon bugs in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Premium Marker using Tailwind CSS
const createCustomMarker = (username) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div class="flex flex-col items-center justify-center -mt-8">
        <span class="bg-slate-900/90 backdrop-blur-sm text-cyan-400 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md mb-1 border border-cyan-500/30 shadow-lg whitespace-nowrap">
          ${username}
        </span>
        <div class="h-4 w-4 bg-cyan-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

export default function TrackerMap() {
  const { activeUsers } = useSocket();

  // Center of India (Default fallback location)
  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        className="h-full w-full"
        zoomControl={false} // Hides default zoom to keep UI clean
      >
{/* STADIA MAPS: ALIDADE SMOOTH DARK (Premium Google Maps feel) */}
<TileLayer
  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
  maxZoom={20}
/>

        {/* Map over live Socket.io users */}
        {activeUsers.map((user) => (
          <Marker 
            key={user.id} 
            position={[user.currentLocation.lat, user.currentLocation.lng]}
            icon={createCustomMarker(user.username)}
          >
            <Popup className="bg-slate-900 border border-white/10 rounded-lg">
              <div className="text-slate-200 p-1">
                <p className="font-semibold text-cyan-400">{user.fullName}</p>
                <p className="text-xs text-slate-400">Live Tracking Active</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}