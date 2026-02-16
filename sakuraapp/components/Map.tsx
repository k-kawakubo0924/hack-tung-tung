import React from 'react';
import { Location, BloomStatusLabel } from '../types';
import { STATUS_ICONS } from '../constants';

interface MapProps {
  locations: Location[];
  onLocationSelect: (id: string) => void;
  selectedLocationId: string | null;
}

export const Map: React.FC<MapProps> = ({ locations, onLocationSelect, selectedLocationId }) => {
  return (
    <div className="relative w-full h-full bg-[#fdf2f8] overflow-hidden select-none touch-none">
      {/* Abstract Fukuoka Map Background */}
      <div className="absolute inset-0 opacity-40">
        {/* Sea (Hakata Bay) - North */}
        <path d="M0,0 L100,0 L100,25 C80,30 60,20 40,30 C20,25 0,35 0,35 Z" fill="#aaccff" />
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Ocean at top */}
          <path d="M0,0 L100,0 L100,20 C80,25 60,15 30,25 C10,20 0,30 0,30 Z" fill="#dbeafe" />
          
          {/* Land */}
          <rect x="0" y="30" width="100" height="70" fill="#f0fdf4" />

          {/* Ohori Park Pond approximation */}
          <path d="M42,52 C42,48 48,48 48,52 C48,56 42,56 42,52 Z" fill="#bae6fd" />
          
          {/* Rivers (Naka River / Muromi River approx) */}
          <path d="M60,25 C65,40 62,60 65,100" fill="none" stroke="#e0f2fe" strokeWidth="4" />
          <path d="M25,30 C28,50 20,80 22,100" fill="none" stroke="#e0f2fe" strokeWidth="3" />

          {/* Major Roads (Abstract) */}
          <path d="M0,40 C30,38 70,42 100,40" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4,4" />
          <path d="M55,20 L55,100" fill="none" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>

      {/* Pins */}
      {locations.map((loc) => (
        <button
          key={loc.id}
          onClick={(e) => {
            e.stopPropagation();
            onLocationSelect(loc.id);
          }}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-300 ${
            selectedLocationId === loc.id ? 'z-50 scale-125' : 'z-10 hover:scale-110'
          }`}
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
        >
          <div className={`
            relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 
            ${selectedLocationId === loc.id ? 'bg-white border-pink-500' : 'bg-white/90 border-pink-300'}
          `}>
            {STATUS_ICONS[loc.currentStatus]}
            
            {/* Ripple effect for 'mankai' */}
            {loc.currentStatus === 'mankai' && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-20 animate-ping"></span>
            )}
          </div>
          
          <span className={`
            mt-1 px-2 py-0.5 text-xs font-bold rounded-full bg-white/90 shadow-sm whitespace-nowrap
            ${selectedLocationId === loc.id ? 'text-pink-600' : 'text-gray-600'}
          `}>
            {loc.name}
          </span>
        </button>
      ))}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-xl shadow-lg backdrop-blur-sm z-40 max-w-[150px]">
        <h3 className="text-xs font-bold text-gray-500 mb-2">開花状況</h3>
        <div className="space-y-2">
          {Object.entries(BloomStatusLabel).map(([key, label]) => (
            <div key={key} className="flex items-center text-xs text-gray-700">
              <div className="mr-2 flex items-center justify-center w-5">
                {STATUS_ICONS[key as keyof typeof BloomStatusLabel]}
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
