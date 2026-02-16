import React, { useState, useEffect } from 'react';
import { MOCK_LOCATIONS } from './constants';
import { Location, Photo, User } from './types';
import { Map as SakuraMap } from './components/Map';
import { DetailPanel } from './components/DetailPanel';
import { AuthModal } from './components/AuthModal';
import { Cherry, UserCircle, LogOut } from 'lucide-react';
import { authService } from './services/authService';

export default function App() {
  const [locations, setLocations] = useState<Location[]>(() => {
    // Initialize mock data with empty likes arrays if not present
    return MOCK_LOCATIONS.map(loc => ({
      ...loc,
      photos: loc.photos.map(p => ({ ...p, likes: p.likes || [] }))
    }));
  });
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const selectedLocation = locations.find(l => l.id === selectedLocationId) || null;

  const handleLocationSelect = (id: string) => {
    setSelectedLocationId(id);
  };

  const handleClosePanel = () => {
    setSelectedLocationId(null);
  };

  // Merge new locations from OSM with existing locations (to keep photos)
  const handleLocationsFetched = (newLocations: Location[]) => {
    setLocations(prev => {
      // Fix: Use the global Map constructor, and cast the entry to [string, Location] tuple
      const existingMap = new Map(prev.map(l => [l.id, l] as [string, Location]));
      const merged = [...prev];

      newLocations.forEach(newLoc => {
        if (!existingMap.has(newLoc.id)) {
          // Initialize photos and likes for new locations
          merged.push({
            ...newLoc,
            photos: []
          });
        }
      });
      return merged;
    });
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

  const handleLikePhoto = (locationId: string, photoId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setLocations(prevLocations => 
      prevLocations.map(loc => {
        if (loc.id === locationId) {
          return {
            ...loc,
            photos: loc.photos.map(photo => {
              if (photo.id === photoId) {
                const hasLiked = photo.likes.includes(currentUser.id);
                const newLikes = hasLiked
                  ? photo.likes.filter(id => id !== currentUser.id) // Unlike
                  : [...photo.likes, currentUser.id]; // Like
                return { ...photo, likes: newLikes };
              }
              return photo;
            })
          };
        }
        return loc;
      })
    );
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row bg-pink-50">
      
      {/* Header Overlay (Mobile) / Sidebar (Desktop) */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
           <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center space-x-2">
             <div className="bg-pink-500 p-1.5 rounded-full text-white">
                <Cherry className="w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold text-gray-800 font-zen tracking-wider">サクラアップ</h1>
           </div>

           {/* User Menu */}
           <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-full px-2 py-1 flex items-center">
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-sm font-bold text-gray-700 hidden sm:block">@{currentUser.username}</span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                    title="ログアウト"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors font-bold text-sm"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>ログイン</span>
                </button>
              )}
           </div>
        </div>
      </header>

      {/* Main Map Area */}
      <main className="flex-1 relative z-0">
        <SakuraMap 
          locations={locations} 
          onLocationSelect={handleLocationSelect}
          selectedLocationId={selectedLocationId}
          onLocationsFetched={handleLocationsFetched}
        />
      </main>

      {/* Detail Panel */}
      <DetailPanel 
        location={selectedLocation} 
        isOpen={!!selectedLocation} 
        currentUser={currentUser}
        onClose={handleClosePanel}
        onAddPhoto={handleAddPhoto}
        onRequireAuth={() => setIsAuthModalOpen(true)}
        onLikePhoto={handleLikePhoto}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={setCurrentUser}
      />

    </div>
  );
}