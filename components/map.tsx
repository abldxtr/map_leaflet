"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useMap } from "@/hook/use-map";
import { useMediaQuery } from "usehooks-ts";
import VaulDrawer from "./vaul-drawer";
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Driver {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

// آیکون‌ها رو خارج از کامپوننت تعریف می‌کنیم تا در هر رندر مجدد ساخته نشوند
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [24, 24],
  });
};

const PICKUP_ICON = createCustomIcon("#22c55e");
const DROPOFF_ICON = createCustomIcon("#ef4444");
const CAR_ICON = L.divIcon({
  className: "custom-icon",
  html: `<div class="bg-primary text-primary-foreground p-2 rounded-full">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
});

// راننده‌ها رو خارج از کامپوننت تعریف می‌کنیم
const DRIVERS: Driver[] = [
  { id: "1", lat: 35.6892, lng: 51.389, name: "راننده ۱" },
  { id: "2", lat: 35.69, lng: 51.388, name: "راننده ۲" },
  { id: "3", lat: 35.688, lng: 51.387, name: "راننده ۳" },
];

interface MapProps {
  pickup: Location | null;
  dropoff: Location | null;
  onLocationSelect: (location: Location, type: "pickup" | "dropoff") => void;
}

export default function Map({ pickup, dropoff, onLocationSelect }: MapProps) {
  const { mapRef, map } = useMap();
  const [open, setOpen] = useState(true);
  const matches = useMediaQuery("(min-width: 768px)");
  const [selectingLocation, setSelectingLocation] = useState<
    "pickup" | "dropoff" | null
  >(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // دریافت مسیر از OSRM با استفاده از useCallback
  const fetchRoute = useCallback(async (start: Location, end: Location) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      return data.routes[0].geometry.coordinates;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  }, []);

  // نمایش مسیر با استفاده از useCallback
  const showRoute = useCallback(
    async (start: Location, end: Location) => {
      if (!map) return;

      // پاک کردن مسیر قبلی
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      const coordinates = await fetchRoute(start, end);
      if (coordinates) {
        const latLngs = coordinates.map((coord: number[]) => [
          coord[1],
          coord[0],
        ]);

        routeLayerRef.current = L.polyline(latLngs, {
          color: "#3b82f6",
          weight: 5,
          opacity: 1,
        }).addTo(map);

        // تنظیم محدوده نقشه با تأخیر برای جلوگیری از فازی شدن
        setTimeout(() => {
          if (routeLayerRef.current) {
            map.fitBounds(routeLayerRef.current.getBounds(), {
              padding: [50, 50],
              duration: 0.5, // زمان انیمیشن را کاهش می‌دهیم
            });
          }
        }, 100);
      }
    },
    [map, fetchRoute]
  );

  // مدیریت کلیک روی نقشه
  useEffect(() => {
    if (map === null) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!selectingLocation) return;

      const newLocation: Location = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        address: `مکان انتخابی (${e.latlng.lat.toFixed(
          4
        )}, ${e.latlng.lng.toFixed(4)})`,
      };

      onLocationSelect(newLocation, selectingLocation);
      setSelectingLocation(null);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, selectingLocation, onLocationSelect]);

  //   useEffect(() => {
  //     if (map === null) return

  //     const handleMapClick = (e: L.LeafletMouseEvent) => {
  //       if (!selectingLocation) return

  //       const newLocation: Location = {
  //         lat: e.latlng.lat,
  //         lng: e.latlng.lng,
  //         address: `مکان انتخابی (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
  //       }

  //       onLocationSelect(newLocation, selectingLocation)
  //       setSelectingLocation(null)
  //     }

  //     map.on("click", handleMapClick)

  //     // Return a cleanup function that doesn't return anything
  //     return () => {
  //       map.off("click", handleMapClick)
  //     }
  //   }, [map, selectingLocation, onLocationSelect])

  // مدیریت مارکرها و مسیر
  useEffect(() => {
    if (!map) return;

    // ایجاد لایه جدید برای مارکرها اگر وجود ندارد
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    // پاک کردن همه مارکرهای قبلی
    markersLayerRef.current.clearLayers();

    // نمایش مبدا
    if (pickup) {
      L.marker([pickup.lat, pickup.lng], { icon: PICKUP_ICON })
        .bindPopup(`مبدا: ${pickup.address}`)
        .addTo(markersLayerRef.current);
    }

    // نمایش مقصد
    if (dropoff) {
      L.marker([dropoff.lat, dropoff.lng], { icon: DROPOFF_ICON })
        .bindPopup(`مقصد: ${dropoff.address}`)
        .addTo(markersLayerRef.current);
    }

    // نمایش راننده‌ها
    // DRIVERS.forEach((driver) => {
    //   L.marker([driver.lat, driver.lng], { icon: CAR_ICON })
    //     .bindPopup(driver.name)
    //     .addTo(markersLayerRef.current);
    // });

    // نمایش مسیر اگر هم مبدا و هم مقصد انتخاب شده باشند
    if (pickup && dropoff) {
      showRoute(pickup, dropoff);
    }
  }, [map, pickup, dropoff, showRoute]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />
      {matches ? (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
          <div className="space-y-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                selectingLocation === "pickup"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectingLocation("pickup")}
            >
              <MapPin size={20} />
              انتخاب مبدا
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                selectingLocation === "dropoff"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectingLocation("dropoff")}
            >
              <MapPin size={20} />
              انتخاب مقصد
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className=" absolute z-[10000] bottom-0 w-full h-8 bg-green-300 rounded-md flex itmes-center justify-center text-white text-bold "
            onClick={() => setOpen((prev) => !prev)}
          >
            Open
          </div>
          <main className="flex min-h-screen flex-col items-center justify-center p-24 relative ">
            <VaulDrawer
              title="Custom Drawer Title"
              description="This is a custom drawer component built with Vaul and styled with Tailwind CSS."
              open={open}
              setOpen={setOpen}
            >
              <div className="space-y-2">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    selectingLocation === "pickup"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setSelectingLocation("pickup");
                    setOpen(false);
                  }}
                >
                  <MapPin size={20} />
                  انتخاب مبدا
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    selectingLocation === "dropoff"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setSelectingLocation("dropoff");
                    setOpen(false);
                  }}
                >
                  <MapPin size={20} />
                  انتخاب مقصد
                </button>
              </div>
            </VaulDrawer>
          </main>
        </>
      )}
    </>
  );
}
