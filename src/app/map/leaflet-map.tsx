'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPost {
  id: string;
  type: string;
  title: string;
  details: string | null;
  category: string;
  contact_name: string;
  created_at: string;
  status: string;
  location_label: string | null;
  location_crossstreet: string | null;
  location_fuzzed_lat: number;
  location_fuzzed_lng: number;
}

interface LeafletMapProps {
  posts: MapPost[];
  selected: MapPost | null;
  onSelect: (post: MapPost) => void;
}

// Default map centre — override via NEXT_PUBLIC_MAP_CENTER_LAT / LNG env vars
const MAP_CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LAT || '42.9849'),
  parseFloat(process.env.NEXT_PUBLIC_MAP_CENTER_LNG || '-81.2453'),
];
const DEFAULT_ZOOM = parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM || '13', 10);

function makeIcon(type: string, selected = false) {
  const color = type === 'need' ? '#d07040' : '#3a6a4a';
  const size = selected ? 36 : 28;
  const border = selected ? 3 : 2;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:${border}px solid ${selected ? '#f0ece0' : 'rgba(240,236,224,0.6)'};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export default function LeafletMap({ posts, selected, onSelect }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    posts.forEach((post) => {
      const isSelected = selected?.id === post.id;
      const marker = L.marker([post.location_fuzzed_lat, post.location_fuzzed_lng], {
        icon: makeIcon(post.type, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .addTo(map)
        .on('click', () => onSelect(post));

      markersRef.current.set(post.id, marker);
    });
  }, [posts, selected, onSelect]);

  // Pan to selected
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.panTo([selected.location_fuzzed_lat, selected.location_fuzzed_lng], { animate: true, duration: 0.5 });
    }
  }, [selected]);

  return (
    <>
      <style>{`
        .leaflet-container { background: #1a2a20; }
        .leaflet-control-zoom a {
          background: #f0ece0 !important;
          color: #1a2a20 !important;
          border-color: #3a5a40 !important;
        }
        .leaflet-control-attribution { background: rgba(26,42,32,0.8) !important; color: #5a7a60 !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: #5a7a60 !important; }
      `}</style>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </>
  );
}
