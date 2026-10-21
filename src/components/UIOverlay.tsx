"use client";

import React, { useState } from "react";
import {
  Camera,
  Sun,
  Moon,
  Sunset,
  Zap,
  Grid3X3,
  RotateCw,
  Home,
  Info,
  Maximize2,
  Layers,
  ChevronDown,
  Compass,
} from "lucide-react";
import { CameraPreset, TimeOfDay } from "./HouseScene";

interface UIOverlayProps {
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  wireframe: boolean;
  setWireframe: (v: boolean | ((prev: boolean) => boolean)) => void;
  solarHighlight: boolean;
  setSolarHighlight: (v: boolean | ((prev: boolean) => boolean)) => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export function UIOverlay({
  cameraPreset,
  setCameraPreset,
  timeOfDay,
  setTimeOfDay,
  wireframe,
  setWireframe,
  solarHighlight,
  setSolarHighlight,
  autoRotate,
  setAutoRotate,
}: UIOverlayProps) {
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10 select-none">
      {/* Top Header & Quick Stats */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 pointer-events-auto">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-white">
                Residential 3D Architectural Viewer
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Next.js + Three.js
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Matched to aerial satellite reference &bull; Procedural PBR materials
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTechInfo(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900/85 hover:bg-slate-800 text-sky-300 border border-sky-500/30 rounded-lg shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            <Info className="w-4 h-4" />
            <span>How it Works in Next.js</span>
          </button>
          <button
            onClick={() => setShowArchInfo(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Building Specs</span>
          </button>
        </div>
      </header>

      {/* Solar Analytics Floating Card (When solar inspection is on) */}
      {solarHighlight && (
        <div className="pointer-events-auto self-start mt-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-xl p-4 shadow-2xl text-xs max-w-xs animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              Photovoltaic Array Inspector
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ACTIVE
            </span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Installed Modules:</span>
              <span className="font-mono font-medium text-white">13 x 400W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">System Capacity:</span>
              <span className="font-mono font-medium text-emerald-400">5.20 kW DC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Roof Slope Pitch:</span>
              <span className="font-mono font-medium text-white">32° (7:12)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Annual Yield:</span>
              <span className="font-mono font-medium text-amber-400">7,280 kWh/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Azimuth Orientation:</span>
              <span className="font-mono font-medium text-white">195° (SSW)</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <footer className="pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
        {/* Camera Views Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl overflow-x-auto max-w-full">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
            Views
          </span>
          {(
            [
              { id: "satellite", label: "Satellite Aerial" },
              { id: "front", label: "Front Facade" },
              { id: "solar", label: "Solar Roof" },
              { id: "patio", label: "Walled Patio" },
              { id: "isometric", label: "Isometric BIM" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setCameraPreset(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                cameraPreset === item.id
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Feature Switches & Lighting controls */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl">
          {/* Time of Day Switcher */}
          <div className="flex items-center gap-1 border-r border-slate-800 pr-2 mr-1">
            <button
              title="Day Sunlight"
              onClick={() => setTimeOfDay("day")}
              className={`p-2 rounded-lg transition-colors ${
                timeOfDay === "day"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              title="Sunset Golden Hour"
              onClick={() => setTimeOfDay("sunset")}
              className={`p-2 rounded-lg transition-colors ${
                timeOfDay === "sunset"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              title="Night Illumination"
              onClick={() => setTimeOfDay("night")}
              className={`p-2 rounded-lg transition-colors ${
                timeOfDay === "night"
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Solar Highlight Toggle */}
          <button
            onClick={() => setSolarHighlight((prev) => !prev)}
            title="Inspect Rooftop Solar Panels"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              solarHighlight
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Solar</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframe((prev) => !prev)}
            title="Toggle Wireframe Mode"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              wireframe
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            title="Toggle Auto Rotation"
            className={`p-2 rounded-lg transition-colors ${
              autoRotate
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} />
          </button>
        </div>
      </footer>

      {/* MODAL: Next.js + Three.js Technical Architecture Explanation */}
      {showTechInfo && (
        <div className="fixed inset-0 pointer-events-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                What Goes Into Creating a 3D House in Next.js?
              </h2>
              <button
                onClick={() => setShowTechInfo(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-300">
              <section>
                <h3 className="text-sm font-semibold text-sky-400 mb-1">
                  1. Client-Side Rendering vs SSR in Next.js
                </h3>
                <p>
                  Three.js requires access to browser-only WebGL APIs (`window`, `HTMLCanvasElement`, and WebGL context).
                  In Next.js App Router, you must mark 3D scene files with <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">&quot;use client&quot;</code> and dynamically import the Canvas with <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">ssr: false</code> to eliminate hydration mismatches.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-sky-400 mb-1">
                  2. React Three Fiber (R3F) Declarative Scene Graph
                </h3>
                <p>
                  Rather than managing imperative animation loops and canvas resize listeners by hand, <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">@react-three/fiber</code> converts Three.js primitives into declarative JSX components. Hooks like <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">useFrame</code> sync updates cleanly with the 60/120 FPS render loop.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-sky-400 mb-1">
                  3. Architectural Geometry Modeling
                </h3>
                <p>
                  In this viewer, the multi-pitch hip roof, eaves, facade trims, and rooftop photovoltaic solar modules are custom procedural Three.js buffer geometries with computed vertex normals. For production architectures, architects typically export glTF/GLB models from Blender, Revit, SketchUp, or Rhino and load them with <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">useGLTF</code> from <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">@react-three/drei</code>.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-sky-400 mb-1">
                  4. Physically Based Rendering (PBR) Materials & Lighting
                </h3>
                <p>
                  Using <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">MeshStandardMaterial</code>, we configure realistic physical parameters:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li><strong>Solar Panels:</strong> High metalness (0.85), low roughness (0.12), emissive glow.</li>
                  <li><strong>Stucco Walls:</strong> High roughness (0.85), low metalness (0.05).</li>
                  <li><strong>Roof Shingles:</strong> Roughness 0.75 with directional cascade shadows.</li>
                  <li><strong>Lighting:</strong> ACESFilmicToneMapping with cascaded shadow maps and procedural atmospheric Sky.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-sky-400 mb-1">
                  5. Performance & Asset Optimization
                </h3>
                <p>
                  To achieve smooth 60fps on mobile devices and laptops, use geometry instancing (`InstancedMesh`) for repeated elements like solar panels, enable frustum culling, limit shadow map resolutions (e.g. 2048x2048 with soft PCF filters), and dispose unused textures and geometries on unmount.
                </p>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTechInfo(false)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-xs transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Building Architectural Specifications */}
      {showArchInfo && (
        <div className="fixed inset-0 pointer-events-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Architectural Breakdown
              </h2>
              <button
                onClick={() => setShowArchInfo(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1">
                <h4 className="font-semibold text-white">Main Dwelling</h4>
                <p className="text-slate-400">
                  Two-story contemporary residence with white stucco exterior, dark composite framing, and architectural belt molding.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1">
                <h4 className="font-semibold text-white">Roof Architecture</h4>
                <p className="text-slate-400">
                  Multi-faceted hip roof system with asphalt shingles, ridge ventilation cap, lower front hip dormer extension, and gutters.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1">
                <h4 className="font-semibold text-white">Rooftop Solar Array</h4>
                <p className="text-slate-400">
                  13 monocrystalline PV panels mounted across South-facing and East-facing roof slopes for optimal solar irradiance.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1">
                <h4 className="font-semibold text-white">Enclosed Courtyard / Patio</h4>
                <p className="text-slate-400">
                  Adjacent private outdoor courtyard enclosed with 2.8m privacy walls, stone concrete paving, and outdoor seating.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowArchInfo(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
