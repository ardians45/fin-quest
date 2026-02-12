'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Fortress3DProps {
  level?: number;
  hp?: number;
  className?: string;
  showEffects?: boolean;
}

export const Fortress3D: React.FC<Fortress3DProps> = ({ level = 1, hp = 100, className = '', showEffects = true }) => {
  // --- STATE LOGIC ---
  const isHealthy = hp > 60;
  const isCritical = hp <= 25;
  const isDestroyed = hp <= 0;

  // Dynamic Colors (Pastel Palette)
  const colors = {
    grass: isCritical ? '#57534e' : '#86efac', // Green-300 vs Stone-600
    grassSide: isCritical ? '#44403c' : '#4ade80', // Green-400 vs Stone-700
    dirt: isCritical ? '#292524' : '#d6d3d1', // Stone-300 vs WarmStone
    sky: isCritical ? '#450a0a' : '#dbeafe', // Red-950 vs Blue-100
    water: isCritical ? '#ef4444' : '#60a5fa', // Red-500 vs Blue-400
    wall: isCritical ? '#57534e' : '#e5e7eb', // Gray-200
    roof: isCritical ? '#7f1d1d' : '#fcd34d', // Yellow-300 vs Red-900
    flame: '#fb923c', // Orange-400
  };

  // --- SVG COMPONENTS (Modular Assets) ---

  const BaseSite = () => (
    <g id="base-site">
      {/* Floating Island Base */}
      <path d="M50 140 Q150 180 250 140 V200 Q150 240 50 200 Z" fill={colors.dirt} /> {/* Bottom Dirt */}
      <path d="M50 140 Q150 180 250 140 V160 Q150 200 50 160 Z" fill="#a8a29e" /> {/* Mid Dirt Layer */}
      <ellipse cx="150" cy="140" rx="100" ry="40" fill={colors.grassSide} /> {/* Grass Side */}
      <ellipse cx="150" cy="135" rx="100" ry="40" fill={colors.grass} /> {/* Grass Top */}
      
      {/* Water Moat (Level 3+) */}
      {level >= 3 && (
        <path d="M80 140 Q150 170 220 140 Q210 160 150 160 Q90 160 80 140" fill={colors.water} opacity="0.8">
           <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
        </path>
      )}
    </g>
  );

  const MainKeep = () => (
    <g id="main-keep" transform="translate(110, 80)">
      {/* Shadow */}
      <ellipse cx="40" cy="55" rx="35" ry="10" fill="black" opacity="0.2" />
      {/* Base Walls */}
      <rect x="10" y="20" width="60" height="40" rx="5" fill="#fef3c7" /> {/* Amber-100 */}
      <rect x="10" y="20" width="10" height="40" fill="#fde68a" /> {/* Shading Left */}
      {/* Roof */}
      <path d="M5 25 L40 0 L75 25 Z" fill={colors.roof} />
      <path d="M5 25 L40 0 L40 25 Z" fill="black" opacity="0.1" /> {/* Roof Shading */}
      {/* Door */}
      <path d="M30 60 L30 40 Q40 30 50 40 L50 60 Z" fill="#78350f" /> {/* Wood Door */}
      {/* Windows */}
      <circle cx="25" cy="35" r="4" fill="#3b0764" />
      <circle cx="55" cy="35" r="4" fill="#3b0764" />
    </g>
  );

  const WallSegment = ({ x = 0, scale = 1 }: { x?: number, scale?: number }) => (
    <g transform={`translate(${x}, 100) scale(${scale})`}>
      <rect x="0" y="0" width="40" height="30" rx="4" fill={colors.wall} />
      <rect x="0" y="0" width="8" height="30" fill="black" opacity="0.1" />
      {/* Battlements */}
      <rect x="2" y="-5" width="8" height="5" fill={colors.wall} />
      <rect x="16" y="-5" width="8" height="5" fill={colors.wall} />
      <rect x="30" y="-5" width="8" height="5" fill={colors.wall} />
    </g>
  );

  const Tower = ({ x = 0, y = 0 }: { x?: number, y?: number }) => (
    <g transform={`translate(${x}, ${y})`}>
       {/* Tower Body */}
       <rect x="0" y="20" width="30" height="60" rx="4" fill={colors.wall} />
       <rect x="0" y="20" width="10" height="60" fill="black" opacity="0.1" />
       {/* Tower Roof */}
       <path d="M-5 20 L15 -10 L35 20 Z" fill="#3b82f6" /> {/* Blue Roof for Towers */}
       <path d="M-5 20 L15 -10 L15 20 Z" fill="black" opacity="0.1" />
       {/* Flag on Top */}
       <line x1="15" y1="-10" x2="15" y2="-25" stroke="#9ca3af" strokeWidth="2" />
       <path d="M15 -25 L30 -20 L15 -15 Z" fill="#ef4444">
          <animate attributeName="d" values="M15 -25 L30 -20 L15 -15 Z; M15 -25 L30 -22 L15 -15 Z; M15 -25 L30 -20 L15 -15 Z" dur="1s" repeatCount="indefinite" />
       </path>
    </g>
  );

  const Gate = () => (
    <g transform="translate(130, 110)">
       {/* Stone Arch */}
       <path d="M-10 40 V0 Q20 -20 50 0 V40 H40 V10 Q20 0 0 10 V40 H-10 Z" fill={colors.wall} />
       {/* Portcullis / Bars */}
       <line x1="5" y1="10" x2="5" y2="40" stroke="#4b5563" strokeWidth="2" />
       <line x1="15" y1="5" x2="15" y2="40" stroke="#4b5563" strokeWidth="2" />
       <line x1="25" y1="5" x2="25" y2="40" stroke="#4b5563" strokeWidth="2" />
       <line x1="35" y1="10" x2="35" y2="40" stroke="#4b5563" strokeWidth="2" />
    </g>
  );

  const DecorFlag = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="0" x2="0" y2="40" stroke="#b45309" strokeWidth="2" />
      <path d="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" fill="#ef4444">
         <animate attributeName="d" values="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z; M0 0 C 10 -5, 20 5, 30 0 L 0 15 Z; M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" dur="2s" repeatCount="indefinite" />
      </path>
    </g>
  );

  const DecorTorch = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
       <path d="M0 0 L5 10 L-5 10 Z" fill="#4b5563" /> {/* Holder */}
       <circle cx="0" cy="-5" r="4" fill={colors.flame}>
          <animate attributeName="r" values="3;5;3" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" />
       </circle>
    </g>
  );

  return (
    <div className={`relative flex items-center justify-center ${className} ${isDestroyed ? 'grayscale opacity-70' : ''}`}>
      <motion.svg
        viewBox="0 0 300 250"
        className="w-full h-full drop-shadow-2xl"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* === LAYER 1: BASE === */}
        <BaseSite />

        {/* === LAYER 2: BACK STRUCTURES === */}
        {/* Level 3: Back Towers */}
        {level >= 3 && <Tower x={70} y={50} />}
        {level >= 3 && <Tower x={200} y={50} />}

        {/* Level 2: Back Walls */}
        {level >= 2 && <WallSegment x={90} scale={0.8} />}
        {level >= 2 && <WallSegment x={170} scale={0.8} />}

        {/* === LAYER 3: MAIN KEEP (Level 1) === */}
        <MainKeep />

        {/* === LAYER 4: FRONT DEFENSES === */}
        {/* Level 2: Front Walls */}
        {level >= 2 && <WallSegment x={60} />}
        {level >= 2 && <WallSegment x={200} />}

        {/* Level 4: Gate */}
        {level >= 4 && <Gate />}

        {/* === LAYER 5: DECORATIONS === */}
        {/* Level 5: Flags */}
        {level >= 5 && <DecorFlag x={115} y={80} />}
        {level >= 5 && <DecorFlag x={185} y={80} />}

        {/* Level 6: Torches */}
        {level >= 6 && <DecorTorch x={125} y={130} />}
        {level >= 6 && <DecorTorch x={175} y={130} />}

        {/* === LAYER 6: WEATHER / EFFECTS (HP Based) === */}
        {isHealthy && showEffects && (
           <>
             {/* Birds */}
             <path d="M20 50 Q30 40 40 50" fill="none" stroke="white" strokeWidth="2">
                <animateTransform attributeName="transform" type="translate" from="-50 0" to="350 0" dur="15s" repeatCount="indefinite" />
             </path>
             <path d="M20 60 Q30 50 40 60" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
                <animateTransform attributeName="transform" type="translate" from="-50 20" to="350 20" dur="20s" repeatCount="indefinite" />
             </path>
           </>
        )}
        
        {isCritical && showEffects && (
           <>
             {/* Rain */}
             <g stroke="white" strokeWidth="1" opacity="0.4">
                <line x1="50" y1="0" x2="40" y2="20"><animate attributeName="y1" from="0" to="200" dur="1s" repeatCount="indefinite" /><animate attributeName="y2" from="20" to="220" dur="1s" repeatCount="indefinite" /></line>
                <line x1="150" y1="0" x2="140" y2="20"><animate attributeName="y1" from="-50" to="150" dur="1s" repeatCount="indefinite" /><animate attributeName="y2" from="-30" to="170" dur="1s" repeatCount="indefinite" /></line>
                <line x1="250" y1="0" x2="240" y2="20"><animate attributeName="y1" from="-100" to="100" dur="1s" repeatCount="indefinite" /><animate attributeName="y2" from="-80" to="120" dur="1s" repeatCount="indefinite" /></line>
             </g>
             {/* Lightning */}
             <path d="M100 0 L80 50 L120 50 L100 100" stroke="#fef08a" strokeWidth="3" fill="none" opacity="0">
                <animate attributeName="opacity" values="0;1;0;0;0" dur="3s" repeatCount="indefinite" />
             </path>
           </>
        )}

      </motion.svg>
      {/* Level Badge Overlay */}
      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm border border-white/50">
        Lv. {level}
      </div>
    </div>
  );
};
