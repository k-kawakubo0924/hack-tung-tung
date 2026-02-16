import React, { useState } from 'react';
import { MOCK_LOCATIONS } from './constants';
import { Location, Photo } from './types';
import { Map } from './components/Map';
import { DetailPanel } from './components/DetailPanel';
import { Cherry } from 'lucide-react';

export default function App() {
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const selectedLocation = locations.find(l => l.id === selectedLocationId) || null;

  const handleLocationSelect = (id: string) => {
    setSelectedLocationId(id);
  };

  const handleClosePanel = () => {
    setSelectedLocationId(null);
  };

  const handleAddPhoto = (locationId: string, photo: Photo) => {
    setLocations(prevLocations => 
      prevLocations.map(loc => {
        if (loc.id === locationId) {
          // Add new photo to the beginning of the array
          return { ...loc, photos: [photo, ...loc.photos] };
        }
        return loc;
      })
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row bg-pink-50">
      
      {/* Header Overlay (Mobile) / Sidebar (Desktop) */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
        <div className="flex items-center justify-between">
           <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 pointer-events-auto flex items-center space-x-2">
             <div className="bg-pink-500 p-1.5 rounded-full text-white">
                <Cherry className="w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold text-gray-800 font-zen tracking-wider">サクラアップ</h1>
           </div>
        </div>
      </header>

      {/* Main Map Area */}
      <main className="flex-1 relative z-0">
        <Map 
          locations={locations} 
          onLocationSelect={handleLocationSelect}
          selectedLocationId={selectedLocationId}
        />
      </main>

      {/* Detail Panel */}
      <DetailPanel 
        location={selectedLocation} 
        isOpen={!!selectedLocation} 
        onClose={handleClosePanel}
        onAddPhoto={handleAddPhoto}
      />

    </div>
  );
}
