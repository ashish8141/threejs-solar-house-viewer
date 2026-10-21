"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface HouseModelProps {
  wireframe?: boolean;
  solarHighlight?: boolean;
  timeOfDay?: "day" | "sunset" | "night";
}

export function HouseModel({
  wireframe = false,
  solarHighlight = false,
  timeOfDay = "day",
}: HouseModelProps) {
  const solarGroupRef = useRef<THREE.Group>(null);
  const lightsGroupRef = useRef<THREE.Group>(null);

  // Solar panel pulsing animation when highlighted
  useFrame(({ clock }) => {
    if (solarGroupRef.current && solarHighlight) {
      const t = clock.getElapsedTime();
      const intensity = 0.5 + Math.sin(t * 3) * 0.3;
      solarGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.isSolarPanel) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.emissive = new THREE.Color(0x00f0ff);
            mat.emissiveIntensity = intensity;
          }
        }
      });
    } else if (solarGroupRef.current) {
      solarGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.userData.isSolarPanel) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.emissive = new THREE.Color(0x021024);
            mat.emissiveIntensity = 0.15;
          }
        }
      });
    }
  });

  // Procedural Materials
  const materials = useMemo(() => {
    // Stucco Wall Material
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.85,
      metalness: 0.05,
      wireframe,
    });

    const wallTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.1,
      wireframe,
    });

    // Dark Shingle Roof Material
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x272e3d,
      roughness: 0.75,
      metalness: 0.15,
      wireframe,
      flatShading: true,
    });

    // Solar Panel Photovoltaic Material
    const solarGlassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.12,
      metalness: 0.85,
      emissive: new THREE.Color(0x021024),
      emissiveIntensity: 0.2,
      wireframe,
    });

    const solarFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.9,
      wireframe,
    });

    // Window Glass Material
    const isNight = timeOfDay === "night";
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: isNight ? 0xffea9f : 0xa5c9eb,
      emissive: isNight ? new THREE.Color(0xffaa22) : new THREE.Color(0x000000),
      emissiveIntensity: isNight ? 0.9 : 0.0,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
      wireframe,
    });

    const windowFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      wireframe,
    });

    // Concrete Foundation & Driveway
    const concreteMaterial = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.9,
      wireframe,
    });

    // Patio Stone Tile Material
    const patioFloorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.65,
      metalness: 0.05,
      wireframe,
    });

    // Lawn / Grass Material
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.95,
      wireframe,
    });

    // Asphalt Street Material
    const streetMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      wireframe,
    });

    // Neighboring Buildings Material
    const neighborMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfd6e0,
      roughness: 0.8,
      wireframe,
    });

    const neighborRoofMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.7,
      wireframe,
    });

    return {
      wallMaterial,
      wallTrimMaterial,
      roofMaterial,
      solarGlassMaterial,
      solarFrameMaterial,
      glassMaterial,
      windowFrameMaterial,
      concreteMaterial,
      patioFloorMaterial,
      grassMaterial,
      streetMaterial,
      neighborMaterial,
      neighborRoofMaterial,
    };
  }, [wireframe, timeOfDay]);

  // Main Hip Roof Geometry
  // In the reference image, the house has a hip roof with 4 sloping planes meeting at a top ridge.
  const mainRoofGeometry = useMemo(() => {
    // Custom geometry for hip roof:
    // Base rectangle: width: 9m, length: 11m, height: 3.2m
    // Ridge: length 3m along the Z-axis, centered at peak
    const geom = new THREE.BufferGeometry();
    const w = 4.8; // half width
    const l = 5.8; // half length
    const h = 3.2; // roof height
    const rw = 0;   // ridge half width
    const rl = 1.6; // ridge half length along Z

    // Vertices:
    // 0: front-left eave (-w, 0, -l)
    // 1: front-right eave (w, 0, -l)
    // 2: back-right eave (w, 0, l)
    // 3: back-left eave (-w, 0, l)
    // 4: front ridge point (0, h, -rl)
    // 5: back ridge point (0, h, rl)

    const vertices = new Float32Array([
      // Front slope (triangle: 0, 1, 4)
      -w, 0, -l,
       w, 0, -l,
       0, h, -rl,

      // Right slope (trapezoid: 1, 2, 5, 4 -> 2 triangles)
       w, 0, -l,
       w, 0,  l,
       0, h,  rl,

       w, 0, -l,
       0, h,  rl,
       0, h, -rl,

      // Back slope (triangle: 2, 3, 5)
       w, 0,  l,
      -w, 0,  l,
       0, h,  rl,

      // Left slope (trapezoid: 3, 0, 4, 5 -> 2 triangles)
      -w, 0,  l,
      -w, 0, -l,
       0, h, -rl,

      -w, 0,  l,
       0, h, -rl,
       0, h,  rl,

      // Bottom ceiling (2 triangles)
      -w, 0, -l,
       w, 0,  l,
       w, 0, -l,

      -w, 0, -l,
      -w, 0,  l,
       w, 0,  l,
    ]);

    geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Forward Hip Extension Roof (Visible in the satellite image as a lower stepped hip section)
  const frontHipRoofGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const w = 3.6;
    const l = 3.2;
    const h = 2.4;
    const rl = 0.8;

    const vertices = new Float32Array([
      // Front slope
      -w, 0, -l,
       w, 0, -l,
       0, h, -rl,

      // Right slope
       w, 0, -l,
       w, 0,  l,
       0, h,  rl,

       w, 0, -l,
       0, h,  rl,
       0, h, -rl,

      // Back slope
       w, 0,  l,
      -w, 0,  l,
       0, h,  rl,

      // Left slope
      -w, 0,  l,
      -w, 0, -l,
       0, h, -rl,

      -w, 0,  l,
       0, h, -rl,
       0, h,  rl,
    ]);

    geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Solar Panel Module Component
  const SolarPanel = ({
    position,
    rotation,
  }: {
    position: [number, number, number];
    rotation: [number, number, number];
  }) => {
    return (
      <group position={position} rotation={rotation}>
        {/* Frame / Backplate */}
        <mesh
          castShadow
          receiveShadow
          material={materials.solarFrameMaterial}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[1.3, 0.05, 1.9]} />
        </mesh>
        {/* Photovoltaic Glass Surface */}
        <mesh
          castShadow
          receiveShadow
          material={materials.solarGlassMaterial}
          position={[0, 0.03, 0]}
          userData={{ isSolarPanel: true }}
        >
          <boxGeometry args={[1.22, 0.02, 1.82]} />
        </mesh>
        {/* Subtle Busbar Lines */}
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[1.2, 0.005, 0.02]} />
          <meshBasicMaterial color={0x94a3b8} />
        </mesh>
        <mesh position={[0, 0.045, 0.45]}>
          <boxGeometry args={[1.2, 0.005, 0.02]} />
          <meshBasicMaterial color={0x94a3b8} />
        </mesh>
        <mesh position={[0, 0.045, -0.45]}>
          <boxGeometry args={[1.2, 0.005, 0.02]} />
          <meshBasicMaterial color={0x94a3b8} />
        </mesh>
      </group>
    );
  };

  // Window helper
  const WindowUnit = ({
    position,
    rotation = [0, 0, 0],
    size = [1.4, 1.8],
  }: {
    position: [number, number, number];
    rotation?: [number, number, number];
    size?: [number, number];
  }) => {
    const [w, h] = size;
    return (
      <group position={position} rotation={rotation}>
        {/* Outer Frame */}
        <mesh castShadow receiveShadow material={materials.windowFrameMaterial}>
          <boxGeometry args={[w, h, 0.12]} />
        </mesh>
        {/* Glass Pane */}
        <mesh material={materials.glassMaterial} position={[0, 0, 0.02]}>
          <boxGeometry args={[w - 0.15, h - 0.15, 0.05]} />
        </mesh>
        {/* Window Mullions */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.04, h - 0.15, 0.06]} />
          <meshStandardMaterial color={0x1e293b} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[w - 0.15, 0.04, 0.06]} />
          <meshStandardMaterial color={0x1e293b} />
        </mesh>
      </group>
    );
  };

  return (
    <group position={[0, 0, 0]}>
      {/* ---------------- GROUND & SITE CONTEXT ---------------- */}
      {/* Surrounding Property Ground (Grass) */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        material={materials.grassMaterial}
      >
        <planeGeometry args={[45, 45]} />
      </mesh>

      {/* Street & Sidewalk */}
      <group position={[0, 0, 15]}>
        {/* Street Roadway */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 5]}
          material={materials.streetMaterial}
        >
          <planeGeometry args={[45, 10]} />
        </mesh>
        {/* Curb */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 0.05, 0]}
          material={materials.concreteMaterial}
        >
          <boxGeometry args={[45, 0.2, 0.4]} />
        </mesh>
        {/* Sidewalk */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, -1.5]}
          material={materials.concreteMaterial}
        >
          <planeGeometry args={[45, 2.5]} />
        </mesh>
      </group>

      {/* Front Concrete Driveway */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-3.5, -0.04, 9]}
        material={materials.concreteMaterial}
      >
        <planeGeometry args={[4.5, 9.5]} />
      </mesh>

      {/* Walkway to Entrance */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.8, -0.04, 7.5]}
        material={materials.concreteMaterial}
      >
        <planeGeometry args={[2.0, 7]} />
      </mesh>

      {/* ---------------- MAIN HOUSE STRUCTURE ---------------- */}
      <group position={[-2, 0, -1]}>
        {/* Concrete Foundation Plinth */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 0.25, 0]}
          material={materials.concreteMaterial}
        >
          <boxGeometry args={[9.2, 0.5, 11.2]} />
        </mesh>

        {/* 1st Floor Wall Volume */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 1.8, 0]}
          material={materials.wallMaterial}
        >
          <boxGeometry args={[9, 2.6, 11]} />
        </mesh>

        {/* Architectural Mid-Story Belt Trim */}
        <mesh
          castShadow
          position={[0, 3.15, 0]}
          material={materials.wallTrimMaterial}
        >
          <boxGeometry args={[9.15, 0.15, 11.15]} />
        </mesh>

        {/* 2nd Floor Wall Volume */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 4.45, 0]}
          material={materials.wallMaterial}
        >
          <boxGeometry args={[9, 2.5, 11]} />
        </mesh>

        {/* Roof Fascia & Eaves Trim */}
        <mesh
          castShadow
          position={[0, 5.75, 0]}
          material={materials.wallTrimMaterial}
        >
          <boxGeometry args={[9.8, 0.25, 11.8]} />
        </mesh>

        {/* Gutters along eaves */}
        <mesh position={[0, 5.8, 5.95]}>
          <boxGeometry args={[9.9, 0.12, 0.1]} />
          <meshStandardMaterial color={0x94a3b8} metalness={0.7} />
        </mesh>
        <mesh position={[0, 5.8, -5.95]}>
          <boxGeometry args={[9.9, 0.12, 0.1]} />
          <meshStandardMaterial color={0x94a3b8} metalness={0.7} />
        </mesh>
        <mesh position={[4.95, 5.8, 0]}>
          <boxGeometry args={[0.1, 0.12, 11.9]} />
          <meshStandardMaterial color={0x94a3b8} metalness={0.7} />
        </mesh>
        <mesh position={[-4.95, 5.8, 0]}>
          <boxGeometry args={[0.1, 0.12, 11.9]} />
          <meshStandardMaterial color={0x94a3b8} metalness={0.7} />
        </mesh>

        {/* Main Upper Hip Roof */}
        <mesh
          castShadow
          receiveShadow
          geometry={mainRoofGeometry}
          material={materials.roofMaterial}
          position={[0, 5.8, 0]}
        />

        {/* Roof Ridge Cap */}
        <mesh position={[0, 9.02, 0]}>
          <boxGeometry args={[0.2, 0.08, 3.4]} />
          <meshStandardMaterial color={0x1e293b} />
        </mesh>

        {/* Chimney / Attic Flue Pipe */}
        <mesh
          castShadow
          position={[-1.8, 8.4, -0.6]}
          material={materials.solarFrameMaterial}
        >
          <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
        </mesh>

        {/* Lower Front Hip Projection (matches satellite layout) */}
        <group position={[1.4, 2.5, 4.2]}>
          <mesh
            castShadow
            receiveShadow
            position={[0, 1.3, 0]}
            material={materials.wallMaterial}
          >
            <boxGeometry args={[4.2, 2.6, 3.4]} />
          </mesh>
          <mesh
            castShadow
            geometry={frontHipRoofGeometry}
            material={materials.roofMaterial}
            position={[0, 2.6, 0]}
            scale={[0.65, 0.7, 0.6]}
          />
        </group>

        {/* Front Porch Entrance & Stairs */}
        <group position={[1.6, 0.1, 6.2]}>
          {/* Porch Platform */}
          <mesh
            castShadow
            receiveShadow
            position={[0, 0.35, 0]}
            material={materials.concreteMaterial}
          >
            <boxGeometry args={[2.4, 0.7, 1.8]} />
          </mesh>
          {/* Step 1 */}
          <mesh
            castShadow
            receiveShadow
            position={[0, 0.15, 1.1]}
            material={materials.concreteMaterial}
          >
            <boxGeometry args={[2.4, 0.3, 0.4]} />
          </mesh>
          {/* Front Entrance Door */}
          <mesh position={[0, 1.5, -0.75]}>
            <boxGeometry args={[1.2, 2.3, 0.1]} />
            <meshStandardMaterial color={0x334155} roughness={0.4} />
          </mesh>
          {/* Door Handle */}
          <mesh position={[0.45, 1.45, -0.68]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={0xfacc15} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Windows on Facades (Positioned matching satellite photo orientation) */}
        {/* Front Windows (Z+) */}
        <WindowUnit position={[-2.2, 1.8, 5.56]} size={[2.2, 1.6]} />
        <WindowUnit position={[-2.2, 4.5, 5.56]} size={[2.0, 1.5]} />
        <WindowUnit position={[2.2, 4.5, 5.56]} size={[1.8, 1.4]} />

        {/* Right Side Windows (X+) facing patio */}
        <WindowUnit
          position={[4.56, 4.5, -1.8]}
          rotation={[0, Math.PI / 2, 0]}
          size={[1.6, 1.4]}
        />
        <WindowUnit
          position={[4.56, 1.8, -1.8]}
          rotation={[0, Math.PI / 2, 0]}
          size={[1.8, 1.5]}
        />
        <WindowUnit
          position={[4.56, 4.5, 2.5]}
          rotation={[0, Math.PI / 2, 0]}
          size={[1.4, 1.4]}
        />

        {/* Left Side Windows (X-) facing driveway */}
        <WindowUnit
          position={[-4.56, 4.5, 0.5]}
          rotation={[0, -Math.PI / 2, 0]}
          size={[1.6, 1.4]}
        />
        <WindowUnit
          position={[-4.56, 1.8, 1.5]}
          rotation={[0, -Math.PI / 2, 0]}
          size={[1.8, 1.4]}
        />
        <WindowUnit
          position={[-4.56, 4.5, -3.2]}
          rotation={[0, -Math.PI / 2, 0]}
          size={[1.5, 1.3]}
        />

        {/* Back Windows (Z-) */}
        <WindowUnit
          position={[-1.5, 4.5, -5.56]}
          rotation={[0, Math.PI, 0]}
          size={[1.8, 1.4]}
        />
        <WindowUnit
          position={[1.8, 4.5, -5.56]}
          rotation={[0, Math.PI, 0]}
          size={[1.8, 1.4]}
        />
        <WindowUnit
          position={[0, 1.8, -5.56]}
          rotation={[0, Math.PI, 0]}
          size={[2.4, 1.8]}
        />

        {/* ---------------- ROOFTOP SOLAR ARRAY ---------------- */}
        {/* As visible in the satellite reference image: prominent dark photovoltaic modules on the slopes */}
        <group ref={solarGroupRef}>
          {/* Front Roof Slope Solar Panels (Tilt ~ 32 deg pitch) */}
          {/* Row 1 Lower Front */}
          <SolarPanel
            position={[-2.4, 6.75, 2.9]}
            rotation={[-0.52, 0, 0]}
          />
          <SolarPanel
            position={[-0.9, 6.75, 2.9]}
            rotation={[-0.52, 0, 0]}
          />
          <SolarPanel
            position={[0.6, 6.75, 2.9]}
            rotation={[-0.52, 0, 0]}
          />
          <SolarPanel
            position={[2.1, 6.75, 2.9]}
            rotation={[-0.52, 0, 0]}
          />

          {/* Row 2 Upper Front */}
          <SolarPanel
            position={[-1.8, 7.6, 1.6]}
            rotation={[-0.52, 0, 0]}
          />
          <SolarPanel
            position={[-0.3, 7.6, 1.6]}
            rotation={[-0.52, 0, 0]}
          />
          <SolarPanel
            position={[1.2, 7.6, 1.6]}
            rotation={[-0.52, 0, 0]}
          />

          {/* Right Slope Solar Panels (Tilt ~ 34 deg pitch facing East/Right) */}
          <SolarPanel
            position={[2.8, 6.9, -1.8]}
            rotation={[0, 0, -0.56]}
          />
          <SolarPanel
            position={[2.8, 6.9, 0.2]}
            rotation={[0, 0, -0.56]}
          />
          <SolarPanel
            position={[1.7, 7.8, -0.8]}
            rotation={[0, 0, -0.56]}
          />
          <SolarPanel
            position={[1.7, 7.8, 1.0]}
            rotation={[0, 0, -0.56]}
          />

          {/* Left Slope Solar Panels (Facing Driveway/West) */}
          <SolarPanel
            position={[-2.8, 6.9, -1.8]}
            rotation={[0, 0, 0.56]}
          />
          <SolarPanel
            position={[-2.8, 6.9, 0.2]}
            rotation={[0, 0, 0.56]}
          />
        </group>
      </group>

      {/* ---------------- ADJACENT WALLED PATIO / COURTYARD ---------------- */}
      {/* High white privacy perimeter wall and expansive flat patio floor on the right side */}
      <group position={[6.5, 0, -1]}>
        {/* Patio Concrete Floor Slab */}
        <mesh
          receiveShadow
          position={[0, 0.15, 0]}
          material={materials.patioFloorMaterial}
        >
          <boxGeometry args={[7.8, 0.3, 10.6]} />
        </mesh>

        {/* High White Enclosure Walls */}
        {/* North Wall (Back) */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 1.6, -5.2]}
          material={materials.wallMaterial}
        >
          <boxGeometry args={[7.8, 2.8, 0.25]} />
        </mesh>
        {/* East Wall (Right Outer Boundary) */}
        <mesh
          castShadow
          receiveShadow
          position={[3.8, 1.6, 0]}
          material={materials.wallMaterial}
        >
          <boxGeometry args={[0.25, 2.8, 10.6]} />
        </mesh>
        {/* South Wall (Front Facing Curb) */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 1.6, 5.2]}
          material={materials.wallMaterial}
        >
          <boxGeometry args={[7.8, 2.8, 0.25]} />
        </mesh>

        {/* Patio Wall Coping Caps */}
        <mesh position={[0, 3.05, -5.2]}>
          <boxGeometry args={[8.0, 0.1, 0.35]} />
          <meshStandardMaterial color={0xe2e8f0} />
        </mesh>
        <mesh position={[3.8, 3.05, 0]}>
          <boxGeometry args={[0.35, 0.1, 10.8]} />
          <meshStandardMaterial color={0xe2e8f0} />
        </mesh>
        <mesh position={[0, 3.05, 5.2]}>
          <boxGeometry args={[8.0, 0.1, 0.35]} />
          <meshStandardMaterial color={0xe2e8f0} />
        </mesh>

        {/* Modern Outdoor Patio Lounge Accents */}
        <group position={[0.5, 0.3, 0]}>
          {/* Lounge Table */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.6, 0.45, 1.2]} />
            <meshStandardMaterial color={0x1e293b} roughness={0.3} />
          </mesh>
          {/* Seating benches */}
          <mesh position={[0, 0.25, -1.2]} castShadow>
            <boxGeometry args={[1.8, 0.4, 0.6]} />
            <meshStandardMaterial color={0x64748b} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.25, 1.2]} castShadow>
            <boxGeometry args={[1.8, 0.4, 0.6]} />
            <meshStandardMaterial color={0x64748b} roughness={0.8} />
          </mesh>
          {/* Planter Box */}
          <mesh position={[2.6, 0.5, -3.2]} castShadow>
            <boxGeometry args={[1.2, 0.9, 1.2]} />
            <meshStandardMaterial color={0x334155} />
          </mesh>
          <mesh position={[2.6, 1.1, -3.2]} castShadow>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color={0x15803d} roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ---------------- NEIGHBORHOOD CONTEXT (HINTS OF ADJACENT BUILDINGS) ---------------- */}
      {/* Neighbor to the Right (East) */}
      <group position={[15, 0, -2]}>
        <mesh
          castShadow
          receiveShadow
          position={[0, 2.5, 0]}
          material={materials.neighborMaterial}
        >
          <boxGeometry args={[7, 5, 10]} />
        </mesh>
        {/* Hip Roof with Terra-cotta / Brown shingles */}
        <mesh
          castShadow
          position={[0, 6.2, 0]}
          material={materials.neighborRoofMaterial}
        >
          <coneGeometry args={[5.8, 2.8, 4]} />
        </mesh>
      </group>

      {/* Neighbor to the Left (West) */}
      <group position={[-15, 0, -1]}>
        <mesh
          castShadow
          receiveShadow
          position={[0, 2.2, 0]}
          material={materials.neighborMaterial}
        >
          <boxGeometry args={[8, 4.4, 11]} />
        </mesh>
        <mesh
          castShadow
          position={[0, 5.4, 0]}
          material={materials.neighborRoofMaterial}
        >
          <coneGeometry args={[6.2, 2.6, 4]} />
        </mesh>
      </group>

      {/* Decorative Garden Plants / Low Shrubs */}
      <mesh castShadow position={[-5.8, 0.4, 5.2]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color={0x166534} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-5.8, 0.45, 3.8]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial color={0x15803d} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-5.8, 0.35, 2.4]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={0x166534} roughness={0.9} />
      </mesh>
    </group>
  );
}
