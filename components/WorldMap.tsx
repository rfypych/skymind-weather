import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

// Declare Leaflet on window since we are loading via CDN in index.html
declare global {
  interface Window {
    L: any;
  }
}

interface Props {
  lat: number;
  lon: number;
  onLocationSelect: (lat: number, lon: number) => void;
}

export const WorldMap: React.FC<Props> = ({ lat, lon, onLocationSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Refs to track previous props to prevent unwanted view resets during parent re-renders (e.g. clock updates)
  const prevCoordRef = useRef({ lat, lon });
  
  // Ref to hold the latest callback so the map listener always calls the fresh function
  const onSelectRef = useRef(onLocationSelect);

  // Update the callback ref whenever the prop changes
  useEffect(() => {
    onSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize Map (Runs once)
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 10,
        zoomControl: false, // We will add this manually or rely on custom controls if needed
        attributionControl: false
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'dark-map-tiles'
      }).addTo(map);

      // Add Zoom control
      window.L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Handle map clicks
      map.on('click', (e: any) => {
        // Call the latest callback from ref
        if (onSelectRef.current) {
          onSelectRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
      
      // Initial marker
      const customIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      markerRef.current = window.L.marker([lat, lon], { icon: customIcon }).addTo(map);
    }
    
    // Cleanup is handled by React usually, but for Leaflet single instance logic, we keep it alive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency to run init only once

  // Handle Updates (Marker & View)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // 1. Always update the marker position
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    const customIcon = window.L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    markerRef.current = window.L.marker([lat, lon], { icon: customIcon }).addTo(mapInstanceRef.current);

    // 2. Only update the MAP VIEW if the coordinates actually changed significantly.
    // This prevents the map from snapping back when the parent component re-renders (e.g. clock tick).
    const prev = prevCoordRef.current;
    const hasChanged = prev.lat !== lat || prev.lon !== lon;

    if (hasChanged) {
      mapInstanceRef.current.setView([lat, lon], 10);
      prevCoordRef.current = { lat, lon };
    }

  }, [lat, lon]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 10);
    }
  };

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] bg-glass border border-glassBorder rounded-3xl overflow-hidden shadow-2xl group">
      <div ref={mapContainerRef} className="w-full h-full z-0 outline-none focus:outline-none" />
      
      {/* Overlay Label */}
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-xs font-medium text-white">Interactive Map</span>
      </div>
      
      {/* Recenter Button */}
      <button 
        onClick={handleRecenter}
        className="absolute top-4 right-4 z-10 bg-slate-800/80 hover:bg-blue-600 backdrop-blur-md p-2 rounded-lg border border-white/10 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        title="Return to current location"
      >
        <Navigation className="w-4 h-4" />
      </button>
      
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-gray-500 pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};