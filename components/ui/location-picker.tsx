"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationAddress {
  display_name: string;
  address: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export default function LocationPicker() {
  const mapRef = useRef<L.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [currentCenter, setCurrentCenter] = useState<L.LatLng | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(
    null
  );
  const [address, setAddress] = useState<LocationAddress | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const addressTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: false,
        attributionControl: false,
      }).setView([35.6892, 51.389], 13);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          minZoom: 5,
        }
      ).addTo(mapRef.current);

      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(mapRef.current);

      setCurrentCenter(mapRef.current.getCenter());

      mapRef.current.on("movestart", () => {
        setIsMoving(true);
        setAddress(null);
      });

      mapRef.current.on("moveend", () => {
        setIsMoving(false);
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          setCurrentCenter(center);
          fetchAddress(center.lat, center.lng);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, []);

  const fetchAddress = async (lat: number, lng: number) => {
    // لغو درخواست قبلی اگر هنوز در حال اجراست
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    // تاخیر 500ms برای جلوگیری از درخواست‌های مکرر
    addressTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoadingAddress(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=fa`
        );
        if (!response.ok) throw new Error("خطا در دریافت آدرس");
        const data = await response.json();
        setAddress(data);
      } catch (error) {
        console.error("خطا در دریافت آدرس:", error);
        toast.error("خطا در دریافت آدرس");
      } finally {
        setIsLoadingAddress(false);
      }
    }, 500);
  };

  console.log({ address });
  //   console.log(address?.address.city + " " + address?.address.neighbourhood+ " " + address?.address.road);

  const updateUserLocationOnMap = (position: GeolocationPosition) => {
    if (!mapRef.current) return;

    const { latitude, longitude, accuracy } = position.coords;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
    }

    accuracyCircleRef.current = L.circle([latitude, longitude], {
      radius: accuracy,
      color: "#4B5563",
      fillColor: "#4B5563",
      fillOpacity: 0.1,
      weight: 1,
    }).addTo(mapRef.current);

    userMarkerRef.current = L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: "relative",
        html: `
          <div class="absolute -translate-x-1/2 -translate-y-1/2">
            <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
          </div>
        `,
        iconSize: [20, 20],
      }),
    }).addTo(mapRef.current);

    setUserLocation(position);
  };

  const handleWatchLocation = () => {
    if (!isWatchingLocation) {
      if ("geolocation" in navigator) {
        setIsWatchingLocation(true);
        toast.info("در حال دریافت موقعیت شما...");

        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            updateUserLocationOnMap(position);
            toast.success("موقعیت شما به‌روزرسانی شد");
          },
          (error) => {
            console.error("خطا در دریافت موقعیت:", error);
            toast.error("خطا در دریافت موقعیت");
            setIsWatchingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        toast.error("مرورگر شما از قابلیت موقعیت‌یابی پشتیبانی نمی‌کند");
      }
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWatchingLocation(false);

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }

      setUserLocation(null);
      toast.info("پایش موقعیت متوقف شد");
    }
  };

  const handleConfirmLocation = () => {
    if (currentCenter) {
      console.log("موقعیت انتخاب شده:", {
        lat: currentCenter.lat.toFixed(6),
        lng: currentCenter.lng.toFixed(6),
        address: address?.display_name,
      });
    }
  };

  const handleMyLocation = () => {
    if (userLocation) {
      mapRef.current?.setView(
        [userLocation.coords.latitude, userLocation.coords.longitude],
        15
      );
    } else {
      toast.info("لطفاً ابتدا دکمه پایش موقعیت را فعال کنید");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 w-full max-w-4xl mx-auto">
      <div className="relative w-full">
        <div
          id="map"
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-md"
          aria-label="نقشه انتخاب موقعیت"
        />

        <div className="absolute top-1/2 left-1/2 transform z-[1000] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className={`transition-transform duration-200 ${
              isMoving ? "scale-75" : "scale-100"
            }`}
          >
            <MapPin className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </div>
        </div>

        <div className="absolute z-[1000] top-4 left-4 flex flex-col gap-2">
          <Button
            variant={isWatchingLocation ? "destructive" : "secondary"}
            size="sm"
            className="shadow-md"
            onClick={handleWatchLocation}
          >
            {isWatchingLocation ? "توقف پایش" : "پایش موقعیت"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="shadow-md"
            onClick={handleMyLocation}
            disabled={!userLocation}
          >
            <Navigation2 className="w-4 h-4 ml-2" />
            موقعیت من
          </Button>
        </div>
      </div>

      <Card className="w-full p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            {/* <div className="text-sm text-gray-600">
              {currentCenter && (
                <>
                  <span className="font-medium">موقعیت انتخاب شده:</span>{" "}
                  <span dir="ltr" className="inline-block">
                    {currentCenter.lat.toFixed(6)},{" "}
                    {currentCenter.lng.toFixed(6)}
                  </span>
                </>
              )}
            </div> */}
            <Button
              onClick={handleConfirmLocation}
              size="sm"
              disabled={!currentCenter}
            >
              تأیید موقعیت
            </Button>
          </div>

          {isLoadingAddress ? (
            <Skeleton className="h-4 w-full" />
          ) : address ? (
            <div className="text-sm text-gray-600">
              <span className="font-medium">آدرس:</span>{" "}
              {/* <span>{address.display_name}</span> */}
              <span>
                {address?.address.city +
                  " " +
                  address?.address.neighbourhood +
                  " " +
                  address?.address.road}
              </span>
              {/* address?.address.city + " " + address?.address.neighbourhood+ " " + address?.address.road */}
            </div>
          ) : null}
        </div>
      </Card>

      <p className="text-sm text-gray-500 text-center">
        نقشه را حرکت دهید تا موقعیت مورد نظر در مرکز نقشه قرار گیرد
      </p>
    </div>
  );
}
