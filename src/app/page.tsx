"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { UIOverlay } from "@/components/UIOverlay";
import type { CameraPreset, TimeOfDay } from "@/components/HouseScene";
import { Loader2 } from "lucide-react";

// Dynamically import HouseScene with SSR disabled to prevent WebGL hydration mismatches
const HouseScene = dynamic(() => import("@/components/HouseScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
      <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      <span className="text-sm font-medium tracking-wide">
        Loading 3D Architectural Scene & Shaders...
      </span>
    </div>
  ),
});

export default function Home() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("satellite");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [solarHighlight, setSolarHighlight] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Viewport */}
      <HouseScene
        cameraPreset={cameraPreset}
        timeOfDay={timeOfDay}
        wireframe={wireframe}
        solarHighlight={solarHighlight}
        autoRotate={autoRotate}
      />

      {/* Floating 2D Controls & Info Overlay */}
      <UIOverlay
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        wireframe={wireframe}
        setWireframe={setWireframe}
        solarHighlight={solarHighlight}
        setSolarHighlight={setSolarHighlight}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
      />
    </main>
  );
}
