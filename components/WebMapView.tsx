import { useEffect, useRef } from 'react';
import { Court } from '../lib/types';
import { getCourtMarkerColor } from '../lib/courts';

interface WebMapViewProps {
  courts: Court[];
  onCourtPress: (court: Court) => void;
}

const BADALONA_CENTER: [number, number] = [41.4418, 2.2318];

export default function WebMapView({ courts, onCourtPress }: WebMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
        await new Promise<void>((resolve) => { script.onload = () => resolve(); });
      }

      const L = (window as any).L;
      const map = L.map(mapRef.current, {
        center: BADALONA_CENTER,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      courts.forEach((court) => {
        const color = getCourtMarkerColor(court.access_type);
        const icon = L.divIcon({
          className: 'court-marker',
          html: `<div style="
            width: 24px; height: 24px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([court.lat, court.lng], { icon }).addTo(map);
        marker.on('click', () => onCourtPress(court));
      });

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [courts, onCourtPress]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    />
  );
}
