import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';
import { Navigation, Loader2 } from 'lucide-react';
import { fetchSakuraLocations } from '../services/overpassService';
import MarkerClusterGroup from 'react-leaflet-cluster';

interface MapProps {
  locations: Location[];
  onLocationSelect: (id: string) => void;
  selectedLocationId: string | null;
  onLocationsFetched: (newLocations: Location[]) => void;
}

// --- ヘルパー関数（住所を自動取得） ---
const getPlaceName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'ja' } }
    );
    const data = await response.json();
    // 施設名、公園名、または地名の最初の要素を取得
    return data.display_name.split(',')[0] || "不明な地点";
  } catch (error) {
    console.error("住所取得エラー:", error);
    return "新しい桜の地点";
  }
};

// --- サブコンポーネント ---

const MapController: React.FC<{ onBoundsChange: (bounds: L.LatLngBounds) => void }> = ({ onBoundsChange }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const map = useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onBoundsChange(map.getBounds()), 3000);
    },
    load: () => onBoundsChange(map.getBounds())
  });

  useEffect(() => {
    const t = setTimeout(() => onBoundsChange(map.getBounds()), 1000);
    return () => clearTimeout(t);
  }, []);
  return null;
};

const MapRecenter: React.FC<{ lat: number; lng: number; selectedId: string | null }> = ({ lat, lng, selectedId }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (selectedId) map.flyTo([lat, lng], 16, { duration: 1.5 });
  }, [lat, lng, selectedId, map]);
  return null;
};

const MapClickHandler: React.FC<{ onMapClick: (latlng: L.LatLng) => void }> = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

// --- メインコンポーネント ---

export const Map: React.FC<MapProps> = ({ locations, onLocationSelect, selectedLocationId, onLocationsFetched }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [newMarker, setNewMarker] = useState<L.LatLng | null>(null);

  const defaultCenter = { lat: 33.5848, lng: 130.3833 };

  const handleBoundsChange = async (bounds: L.LatLngBounds) => {
    if (mapInstance && mapInstance.getZoom() < 10) return;
    setIsLoading(true);
    try {
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();
      const newLocations = await fetchSakuraLocations(south, west, north, east);
      if (newLocations.length > 0) onLocationsFetched(newLocations);
    } catch (error) {
      console.error("Overpass API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomIcon = (color: string, isSelected: boolean) => {
    const size = isSelected ? 40 : 24;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: all 0.3s ease;"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !mapInstance) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        mapInstance.flyTo([latitude, longitude], 15);
      },
      () => alert("現在地を取得できませんでした。")
    );
  };

  const handleSave = async () => {
    if (!newMarker) return;

    setIsLoading(true); // 住所取得中にローディングを表示
    const placeName = await getPlaceName(newMarker.lat, newMarker.lng);

    const newLocation: Location = {
      id: `user-${Date.now()}`,
      lat: newMarker.lat,
      lng: newMarker.lng,
      name: `${placeName}`,
      description: `${placeName}で見つけた新しい桜です。`,
      currentStatus: "mankai", // 型定義に合わせた値
      photos: []
    };

    onLocationsFetched([newLocation]);
    setNewMarker(null);
    setIsLoading(false);
    alert(`「${placeName}の桜」として地図に登録しました！`);
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
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="saturate-[0.8]"
        />

        <MapController onBoundsChange={handleBoundsChange} />
        <MapClickHandler onMapClick={(latlng) => setNewMarker(latlng)} />
        
        {selectedLocation && (
          <MapRecenter lat={selectedLocation.lat} lng={selectedLocation.lng} selectedId={selectedLocationId} />
        )}

        {/* 既存のピンをクラスタリング表示 */}
        <MarkerClusterGroup 
        chunkedLoading 
        maxClusterRadius={20}
        // ↓ ここから追加：数字の周りに背景を作る設定
  iconCreateFunction={(cluster) => {
    const count = cluster.getChildCount(); // まとまっている数
    
    return L.divIcon({
      html: `
        <div style="
          background-color: rgba(255, 183, 197, 0.9); 
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          border: 3px solid white; 
          color: #d147a3; 
          font-weight: bold; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
          ${count}
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: L.point(40, 40),
    });
  }}
>
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createCustomIcon("#ffb7c5", location.id === selectedLocationId)}
              eventHandlers={{ click: () => onLocationSelect(location.id) }}
            />
          ))}
        </MarkerClusterGroup>

        {/* ユーザーが今タップした新しいピン（クラスタの外に置くことで常に最前面に表示） */}
        {newMarker && (
          <Marker position={newMarker} icon={createCustomIcon("#ff1493", true)} />
        )}

        {/* 現在地表示 */}
        {currentPosition && (
          <Marker 
            position={[currentPosition.lat, currentPosition.lng]}
            icon={L.divIcon({
              className: 'current-pos-icon',
              html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          />
        )}
      </MapContainer>

      {/* 決定UI：新しくピンが立ったときだけ表示 */}
      {newMarker && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[400] bg-white p-4 rounded-lg shadow-xl flex flex-col items-center gap-2 w-[280px]">
          <p className="text-sm font-bold text-gray-700">ここにサクラを追加しますか？</p>
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setNewMarker(null)} 
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-bold active:bg-gray-200"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSave} 
              className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-md text-sm font-bold shadow-sm active:bg-pink-600"
            >
              場所を決定
            </button>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md z-[400] flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
          <span className="text-xs font-bold text-gray-600">処理中...</span>
        </div>
      )}

      {/* 現在地ボタン */}
      <button
        onClick={handleCurrentLocation}
        className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100 z-[400] text-gray-600 transition-all"
      >
        <Navigation className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
};