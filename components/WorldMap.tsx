import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

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

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      // Add OpenStreetMap tiles with a CSS class for dark mode inversion
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'dark-map-tiles' // Defined in index.html style
      }).addTo(map);

      // Add Zoom control to bottom right
      window.L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Handle map clicks
      map.on('click', (e: any) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
    }

    // Update view and marker when coordinates change
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 10);

      // Remove old marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      const customIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      markerRef.current = window.L.marker([lat, lon], { icon: customIcon }).addTo(mapInstanceRef.current);
    }

    // Cleanup
    return () => {
      // We typically don't destroy the map in React 18 strict mode immediately to avoid visual jitter,
      // but strictly speaking, we should. For simplicity in this setup, we rely on the ref check.
    };
  }, [lat, lon, onLocationSelect]);

  return (
    <div className="relative w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] bg-glass border border-glassBorder rounded-3xl overflow-hidden shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Overlay Label */}
      <div className="absolute top-4 left-4 z-[400] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-xs font-medium text-white">Interactive Map</span>
      </div>
      
      <div className="absolute bottom-4 left-4 z-[400] text-[10px] text-gray-500 pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};