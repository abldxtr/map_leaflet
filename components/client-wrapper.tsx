"use client";

import { useState } from "react";
// import type { Location } from "../types";
import Map, { Location } from "./map";
// import SearchBox from "./search-box";
// import PriceEstimate from "./price-estimate";
import { Card } from "@/components/ui/card";

export default function ClientWrapper() {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  const handleLocationSelect = (
    location: Location,
    type: "pickup" | "dropoff"
  ) => {
    if (type === "pickup") {
      setPickup(location);
    } else {
      setDropoff(location);
    }
  };

  return (
    <div className="h-screen w-full relative">
      <Map
        pickup={pickup}
        dropoff={dropoff}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}
