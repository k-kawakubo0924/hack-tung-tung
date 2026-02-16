import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';
import { STATUS_COLORS } from '../constants';
import { Navigation, Loader2 } from 'lucide-react';
import { fetchSakuraLocations } from '../services/overpassService';

// NOTE: leaflet.css is imported in index.html via <link> tag.

interface MapProps {
  locations: Location[];
  onLocationSelect: (id: string) => void;
  selectedLocationId: string | null;
  onLocationsFetched: (newLocations: Location[]) => void;
}

// Component to handle map events (move, load) with debounce
const MapController: React.FC<{
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}> = ({ onBoundsChange }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const map = useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onBoundsChange(map.getBounds());
      }, 3000); // 3 seconds debounce to respect API rate limits
    },
    load: () => {
       // Initial load might also need a slight delay or check
       onBoundsChange(map.getBounds());
    }
  });
  
  // Trigger initial load on mount
  useEffect(() => {
      // Small delay to ensure map is ready
      const t = setTimeout(() => {
          onBoundsChange(map.getBounds());
      }, 1000);
      return () => clearTimeout(t);
  }, []);

  return null;
};

// Component to handle programmatic panning
const MapRecenter: React.FC<{ lat: number; lng: number; selectedId: string | null }> = ({ lat, lng, selectedId }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (selectedId) {
      map.flyTo([lat, lng], 16, { duration: 1.5 });
    }
  }, [lat, lng, selectedId, map]);
  return null;
};

export const Map: React.FC<MapProps> = ({ locations, onLocationSelect, selectedLocationId, onLocationsFetched }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Default center (Fukuoka)
  const defaultCenter = { lat: 33.5848, lng: 130.3833 };

  const handleBoundsChange = async (bounds: L.LatLngBounds) => {
    // Avoid fetching if zoomed out too far (country level)
    // Zoom 11-12 is roughly city level.
    if (mapInstance && mapInstance.getZoom() < 13) return; // Stricter zoom level to reduce data load

    setIsLoading(true);
    try {
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();

      const newLocations = await fetchSakuraLocations(south, west, north, east);
      if (newLocations.length > 0) {
          onLocationsFetched(newLocations);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomIcon = (color: string, isSelected: boolean) => {
    const size = isSelected ? 40 : 24;
    const border = isSelected ? '3px solid white' : '2px solid white';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${border};
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !mapInstance) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        mapInstance.flyTo([latitude, longitude], 15);
      },
      () => alert("現在地を取得できませんでした。")
    );
  };

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        ref={setMapInstance}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="saturate-[0.8]"
        />

        <MapController onBoundsChange={handleBoundsChange} />
        
        {selectedLocation && (
          <MapRecenter 
            lat={selectedLocation.lat} 
            lng={selectedLocation.lng} 
            selectedId={selectedLocationId} 
          />
        )}

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(
              STATUS_COLORS[location.currentStatus],
              location.id === selectedLocationId
            )}
            eventHandlers={{
              click: () => onLocationSelect(location.id),
            }}
          />
        ))}

        {currentPosition && (
           <Marker 
             position={[currentPosition.lat, currentPosition.lng]}
             icon={L.divIcon({
               className: 'custom-div-icon',
               html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
               iconSize: [16, 16],
               iconAnchor: [8, 8]
             })}
           />
        )}
      </MapContainer>

      {/* Attribution */}
      <div className="absolute bottom-1 left-1 z-[400] text-[10px] text-gray-500 bg-white/70 px-1 rounded pointer-events-none">
        © OpenStreetMap contributors
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md z-[400] flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
          <span className="text-xs font-bold text-gray-600">桜を探しています...</span>
        </div>
      )}

      {/* Current Location Button */}
      <button
        onClick={handleCurrentLocation}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-all z-[400] text-gray-600"
        aria-label="現在地を表示"
      >
        <Navigation className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
};