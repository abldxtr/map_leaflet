"use client";

// import LocationPicker from "@/components/location-picker";

import dynamic from "next/dynamic";
const LocationPicker = dynamic(() => import("@/components/location-picker"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <LocationPicker />
    </>
  );
}
