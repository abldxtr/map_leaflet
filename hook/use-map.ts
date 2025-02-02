"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export function useMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // ایجاد نقشه
    const mapInstance = L.map(mapRef.current).setView([35.6892, 51.389], 13);

    // اضافه کردن لایه OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Cleanup function
    return () => {
      mapInstance.remove();
    };
  }, []);

  return { mapRef, map };
}
