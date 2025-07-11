
import React, { useEffect, useRef } from 'react';

interface EventMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  venue?: string;
}

const EventMap: React.FC<EventMapProps> = ({ latitude, longitude, address, venue }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !(window as any).L) {
        // Charger le CSS de Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Charger le JS de Leaflet
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.body.appendChild(script);
      } else if ((window as any).L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;
      
      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = L.map(mapContainerRef.current).setView([latitude, longitude], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      const popupContent = `
        <div class="p-2">
          ${venue ? `<strong>${venue}</strong><br>` : ''}
          ${address || 'Localisation de l\'événement'}
        </div>
      `;

      markerRef.current = L.marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(popupContent)
        .openPopup();
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [latitude, longitude, address, venue]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-64 rounded-lg border border-border"
      style={{ minHeight: '256px' }}
    />
  );
};

export default EventMap;
