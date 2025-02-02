"use client";

import VaulDrawer from "@/components/vaul-drawer";
import { useState } from "react";
import dynamic from "next/dynamic";

// لود داینامیک کامپوننت اصلی بدون SSR
const ClientWrapper = dynamic(() => import("@/components/client-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-muted">
      در حال بارگذاری...
    </div>
  ),
});

export default function Drawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className=" w-dwh h-dvh overflow-hidden isolate  ">
        <ClientWrapper />
      </div>
    </>
  );
}
