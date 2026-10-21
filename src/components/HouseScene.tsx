"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sky,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { HouseModel } from "./HouseModel";

export type CameraPreset = "satellite" | "front" | "solar" | "patio" | "isometric";
export type TimeOfDay = "day" | "sunset" | "night";

interface HouseSceneProps {
  cameraPreset: CameraPreset;
  timeOfDay: TimeOfDay;
  wireframe: boolean;
  solarHighlight: boolean;
  autoRotate: boolean;
}

// Preset camera positions & targets
const PRESETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  // Matches the Google Earth satellite angle from user's image exactly
  satellite: {
    pos: [10, 22, 18],
    target: [0, 3, 0],
  },
  front: {
    pos: [0, 3.5, 18],
    target: [0, 3, 0],
  },
  solar: {
    pos: [3, 14, 8],
    target: [-1, 7, 0],
  },
  patio: {
    pos: [14, 5, 4],
    target: [6, 2, -1],
  },
  isometric: {
    pos: [20, 20, 20],
    target: [0, 2, 0],
  },
};

function CameraController({
  preset,
  autoRotate,
}: {
  preset: CameraPreset;
  autoRotate: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef(new THREE.Vector3(...PRESETS[preset].pos));
  const targetLook = useRef(new THREE.Vector3(...PRESETS[preset].target));

  useEffect(() => {
    const p = PRESETS[preset];
    targetPos.current.set(...p.pos);
    targetLook.current.set(...p.target);
  }, [preset]);

  useFrame(({ camera }) => {
    // Smooth camera interpolation towards preset
    camera.position.lerp(targetPos.current, 0.05);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.04} // Prevent camera going below ground
      minDistance={4}
      maxDistance={60}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
    />
  );
}

function LightingAndAtmosphere({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  // Lighting configurations by time of day
  const config = {
    day: {
      sunPos: [15, 25, 12] as [number, number, number],
      sunColor: "#fffbeb",
      sunIntensity: 2.2,
      ambientColor: "#e0f2fe",
      ambientIntensity: 0.6,
      hemiSky: "#bae6fd",
      hemiGround: "#334155",
      hemiIntensity: 0.5,
      turbidity: 4,
      rayleigh: 0.6,
      elevation: 45,
      azimuth: 140,
    },
    sunset: {
      sunPos: [25, 6, 8] as [number, number, number],
      sunColor: "#ff7733",
      sunIntensity: 2.8,
      ambientColor: "#fed7aa",
      ambientIntensity: 0.4,
      hemiSky: "#f97316",
      hemiGround: "#1e1b4b",
      hemiIntensity: 0.4,
      turbidity: 10,
      rayleigh: 3,
      elevation: 7,
      azimuth: 220,
    },
    night: {
      sunPos: [-10, 15, -10] as [number, number, number],
      sunColor: "#38bdf8",
      sunIntensity: 0.3,
      ambientColor: "#1e293b",
      ambientIntensity: 0.25,
      hemiSky: "#0f172a",
      hemiGround: "#020617",
      hemiIntensity: 0.2,
      turbidity: 2,
      rayleigh: 0.1,
      elevation: -5,
      azimuth: 0,
    },
  }[timeOfDay];

  return (
    <>
      <ambientLight color={config.ambientColor} intensity={config.ambientIntensity} />
      <hemisphereLight
        args={[config.hemiSky, config.hemiGround, config.hemiIntensity]}
      />
      <directionalLight
        ref={dirLightRef}
        position={config.sunPos}
        intensity={config.sunIntensity}
        color={config.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={65}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0002}
      />

      {/* Night Street & Porch Accent Point Lights */}
      {timeOfDay === "night" && (
        <>
          <pointLight
            position={[-0.4, 2.5, 6.4]}
            color="#ffbb44"
            intensity={4.5}
            distance={10}
            decay={2}
          />
          <pointLight
            position={[7, 2.2, 0]}
            color="#fed7aa"
            intensity={3.5}
            distance={12}
            decay={2}
          />
          <pointLight
            position={[-3.5, 4, 10]}
            color="#93c5fd"
            intensity={2}
            distance={12}
            decay={2}
          />
        </>
      )}

      {/* Atmospheric Procedural Sky */}
      <Sky
        distance={450000}
        sunPosition={config.sunPos}
        inclination={0}
        azimuth={0.25}
        turbidity={config.turbidity}
        rayleigh={config.rayleigh}
      />
    </>
  );
}

export default function HouseScene({
  cameraPreset,
  timeOfDay,
  wireframe,
  solarHighlight,
  autoRotate,
}: HouseSceneProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-slate-950">
      <Canvas
        shadows
        camera={{
          position: PRESETS.satellite.pos,
          fov: 42,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <CameraController preset={cameraPreset} autoRotate={autoRotate} />
        <LightingAndAtmosphere timeOfDay={timeOfDay} />

        <HouseModel
          wireframe={wireframe}
          solarHighlight={solarHighlight}
          timeOfDay={timeOfDay}
        />

        {/* Soft Contact Shadows on Ground */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.65}
          scale={35}
          blur={1.8}
          far={10}
          resolution={1024}
          color="#090d16"
        />
      </Canvas>
    </div>
  );
}
