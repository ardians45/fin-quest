'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Fortress3DProps {
  level?: number;
  hp?: number;
  className?: string;
  showEffects?: boolean;
  activeDecorations?: string[];
}

export const Fortress3D: React.FC<Fortress3DProps> = ({ 
  level = 1, 
  hp = 100, 
  className = '', 
  showEffects = true,
  activeDecorations = [],
}) => {
  // --- STATE LOGIC ---
  const isHealthy = hp > 60;
  const isCritical = hp <= 25;
  const isDestroyed = hp <= 0;

  // Helper to check if a decoration is active
  const hasDecor = (id: string) => activeDecorations.includes(id);

  // Dynamic Colors (Pastel Palette)
  const colors = {
    grass: isCritical ? '#57534e' : '#86efac',
    grassSide: isCritical ? '#44403c' : '#4ade80',
    dirt: isCritical ? '#292524' : '#d6d3d1',
    sky: isCritical ? '#450a0a' : '#dbeafe',
    water: isCritical ? '#ef4444' : '#60a5fa',
    wall: isCritical ? '#57534e' : '#e5e7eb',
    roof: isCritical ? '#7f1d1d' : '#fcd34d',
    flame: '#fb923c',
    flameBlue: '#60a5fa',
  };

  // --- SVG COMPONENTS (Modular Assets) ---

  const BaseSite = () => (
    <g id="base-site">
      <path d="M50 140 Q150 180 250 140 V200 Q150 240 50 200 Z" fill={colors.dirt} />
      <path d="M50 140 Q150 180 250 140 V160 Q150 200 50 160 Z" fill="#a8a29e" />
      <ellipse cx="150" cy="140" rx="100" ry="40" fill={colors.grassSide} />
      <ellipse cx="150" cy="135" rx="100" ry="40" fill={colors.grass} />
      
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
      <ellipse cx="40" cy="55" rx="35" ry="10" fill="black" opacity="0.2" />
      <rect x="10" y="20" width="60" height="40" rx="5" fill="#fef3c7" />
      <rect x="10" y="20" width="10" height="40" fill="#fde68a" />
      <path d="M5 25 L40 0 L75 25 Z" fill={colors.roof} />
      <path d="M5 25 L40 0 L40 25 Z" fill="black" opacity="0.1" />
      <path d="M30 60 L30 40 Q40 30 50 40 L50 60 Z" fill="#78350f" />
      <circle cx="25" cy="35" r="4" fill="#3b0764" />
      <circle cx="55" cy="35" r="4" fill="#3b0764" />
    </g>
  );

  const WallSegment = ({ x = 0, scale = 1 }: { x?: number, scale?: number }) => (
    <g transform={`translate(${x}, 100) scale(${scale})`}>
      <rect x="0" y="0" width="40" height="30" rx="4" fill={colors.wall} />
      <rect x="0" y="0" width="8" height="30" fill="black" opacity="0.1" />
      <rect x="2" y="-5" width="8" height="5" fill={colors.wall} />
      <rect x="16" y="-5" width="8" height="5" fill={colors.wall} />
      <rect x="30" y="-5" width="8" height="5" fill={colors.wall} />
    </g>
  );

  const Tower = ({ x = 0, y = 0 }: { x?: number, y?: number }) => (
    <g transform={`translate(${x}, ${y})`}>
       <rect x="0" y="20" width="30" height="60" rx="4" fill={colors.wall} />
       <rect x="0" y="20" width="10" height="60" fill="black" opacity="0.1" />
       <path d="M-5 20 L15 -10 L35 20 Z" fill="#3b82f6" />
       <path d="M-5 20 L15 -10 L15 20 Z" fill="black" opacity="0.1" />
       <line x1="15" y1="-10" x2="15" y2="-25" stroke="#9ca3af" strokeWidth="2" />
       <path d="M15 -25 L30 -20 L15 -15 Z" fill="#ef4444">
          <animate attributeName="d" values="M15 -25 L30 -20 L15 -15 Z; M15 -25 L30 -22 L15 -15 Z; M15 -25 L30 -20 L15 -15 Z" dur="1s" repeatCount="indefinite" />
       </path>
    </g>
  );

  const Gate = () => (
    <g transform="translate(130, 110)">
       <path d="M-10 40 V0 Q20 -20 50 0 V40 H40 V10 Q20 0 0 10 V40 H-10 Z" fill={colors.wall} />
       <line x1="5" y1="10" x2="5" y2="40" stroke="#4b5563" strokeWidth="2" />
       <line x1="15" y1="5" x2="15" y2="40" stroke="#4b5563" strokeWidth="2" />
       <line x1="25" y1="5" x2="25" y2="40" stroke="#4b5563" strokeWidth="2" />
       <line x1="35" y1="10" x2="35" y2="40" stroke="#4b5563" strokeWidth="2" />
    </g>
  );

  // ===== DECORATION COMPONENTS =====

  const RedFlagDecor = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="0" x2="0" y2="40" stroke="#b45309" strokeWidth="2" />
      <path d="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" fill="#ef4444">
         <animate attributeName="d" values="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z; M0 0 C 10 -5, 20 5, 30 0 L 0 15 Z; M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" dur="2s" repeatCount="indefinite" />
      </path>
    </g>
  );

  const BlueFlagDecor = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="0" x2="0" y2="40" stroke="#6b7280" strokeWidth="2" />
      <path d="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" fill="#3b82f6">
         <animate attributeName="d" values="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z; M0 0 C 10 -5, 20 5, 30 0 L 0 15 Z; M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" dur="2.5s" repeatCount="indefinite" />
      </path>
    </g>
  );

  const GoldFlagDecor = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="0" x2="0" y2="40" stroke="#92400e" strokeWidth="2.5" />
      <path d="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" fill="#fbbf24">
         <animate attributeName="d" values="M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z; M0 0 C 10 -5, 20 5, 30 0 L 0 15 Z; M0 0 C 10 5, 20 -5, 30 0 L 0 15 Z" dur="1.8s" repeatCount="indefinite" />
      </path>
      {/* Gold shimmer dot */}
      <circle cx="15" cy="5" r="2" fill="#fef08a" opacity="0.8">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );

  const WallTorchDecor = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
       <path d="M0 0 L5 10 L-5 10 Z" fill="#4b5563" />
       <circle cx="0" cy="-5" r="4" fill={colors.flame}>
          <animate attributeName="r" values="3;5;3" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" />
       </circle>
    </g>
  );

  const BlueTorchDecor = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
       <path d="M0 0 L5 10 L-5 10 Z" fill="#6b7280" />
       <circle cx="0" cy="-5" r="4" fill={colors.flameBlue}>
          <animate attributeName="r" values="3;6;3" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.6s" repeatCount="indefinite" />
       </circle>
       {/* Glow */}
       <circle cx="0" cy="-5" r="8" fill={colors.flameBlue} opacity="0.15">
          <animate attributeName="r" values="6;10;6" dur="0.6s" repeatCount="indefinite" />
       </circle>
    </g>
  );

  const RoyalBannerDecor = () => (
    <g transform="translate(143, 65)">
      {/* Banner pole */}
      <line x1="7" y1="-5" x2="7" y2="30" stroke="#92400e" strokeWidth="2" />
      {/* Banner fabric */}
      <rect x="0" y="-5" width="14" height="20" rx="2" fill="#7c3aed" />
      {/* Gold trim */}
      <rect x="0" y="-5" width="14" height="3" rx="1" fill="#fbbf24" />
      <rect x="0" y="12" width="14" height="3" rx="1" fill="#fbbf24" />
      {/* Crown symbol */}
      <path d="M4 3 L7 0 L10 3 L9 7 L5 7 Z" fill="#fbbf24" />
      {/* Wave animation */}
      <animateTransform attributeName="transform" type="rotate" values="0 150 80;1 150 80;-1 150 80;0 150 80" dur="3s" repeatCount="indefinite" />
    </g>
  );

  const GardenDecor = () => (
    <g transform="translate(75, 125)">
      {/* Grass patch */}
      <ellipse cx="15" cy="12" rx="18" ry="6" fill="#4ade80" opacity="0.8" />
      {/* Flowers */}
      <circle cx="8" cy="8" r="3" fill="#f472b6" />
      <circle cx="8" cy="8" r="1.5" fill="#fbbf24" />
      <circle cx="20" cy="6" r="3" fill="#a78bfa" />
      <circle cx="20" cy="6" r="1.5" fill="#fef08a" />
      <circle cx="14" cy="10" r="2.5" fill="#fb923c" />
      <circle cx="14" cy="10" r="1" fill="#fef08a" />
      {/* Stems */}
      <line x1="8" y1="11" x2="8" y2="14" stroke="#22c55e" strokeWidth="1.5" />
      <line x1="20" y1="9" x2="20" y2="14" stroke="#22c55e" strokeWidth="1.5" />
      <line x1="14" y1="12" x2="14" y2="14" stroke="#22c55e" strokeWidth="1.5" />
    </g>
  );

  const FountainDecor = () => (
    <g transform="translate(195, 118)">
      {/* Basin */}
      <ellipse cx="15" cy="20" rx="18" ry="6" fill="#94a3b8" />
      <ellipse cx="15" cy="18" rx="14" ry="4" fill="#60a5fa" opacity="0.7">
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
      </ellipse>
      {/* Pillar */}
      <rect x="12" y="5" width="6" height="15" rx="2" fill="#d1d5db" />
      {/* Water spout top */}
      <circle cx="15" cy="5" r="4" fill="#d1d5db" />
      {/* Water drops */}
      <circle cx="10" cy="8" r="1.5" fill="#60a5fa" opacity="0.8">
        <animate attributeName="cy" values="5;15;5" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="8" r="1.5" fill="#60a5fa" opacity="0.8">
        <animate attributeName="cy" values="5;15;5" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
      </circle>
      <circle cx="15" cy="3" r="1" fill="#93c5fd" opacity="0.6">
        <animate attributeName="cy" values="0;12;0" dur="1s" repeatCount="indefinite" begin="0.2s" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1s" repeatCount="indefinite" begin="0.2s" />
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

        {/* === LAYER 2: DECORATIONS (Behind structures) === */}
        {hasDecor('garden') && <GardenDecor />}
        {hasDecor('fountain') && <FountainDecor />}

        {/* === LAYER 3: BACK STRUCTURES === */}
        {level >= 3 && <Tower x={70} y={50} />}
        {level >= 3 && <Tower x={200} y={50} />}
        {level >= 2 && <WallSegment x={90} scale={0.8} />}
        {level >= 2 && <WallSegment x={170} scale={0.8} />}

        {/* === LAYER 4: MAIN KEEP === */}
        <MainKeep />

        {/* === LAYER 5: FRONT DEFENSES === */}
        {level >= 2 && <WallSegment x={60} />}
        {level >= 2 && <WallSegment x={200} />}
        {level >= 4 && <Gate />}

        {/* === LAYER 6: DECORATIONS (On structures) === */}
        {/* Flags */}
        {hasDecor('red_flag') && (
          <>
            <RedFlagDecor x={115} y={80} />
            <RedFlagDecor x={185} y={80} />
          </>
        )}
        {hasDecor('blue_flag') && (
          <>
            <BlueFlagDecor x={100} y={85} />
            <BlueFlagDecor x={195} y={85} />
          </>
        )}
        {hasDecor('gold_flag') && (
          <>
            <GoldFlagDecor x={108} y={75} />
            <GoldFlagDecor x={190} y={75} />
          </>
        )}

        {/* Torches */}
        {hasDecor('wall_torch') && (
          <>
            <WallTorchDecor x={125} y={130} />
            <WallTorchDecor x={175} y={130} />
          </>
        )}
        {hasDecor('blue_torch') && (
          <>
            <BlueTorchDecor x={90} y={125} />
            <BlueTorchDecor x={210} y={125} />
          </>
        )}

        {/* Banner */}
        {hasDecor('royal_banner') && <RoyalBannerDecor />}

        {/* === LAYER 7: WEATHER / EFFECTS (HP Based) === */}
        {isHealthy && showEffects && (
           <>
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
             <g stroke="white" strokeWidth="1" opacity="0.4">
                <line x1="50" y1="0" x2="40" y2="20"><animate attributeName="y1" from="0" to="200" dur="1s" repeatCount="indefinite" /><animate attributeName="y2" from="20" to="220" dur="1s" repeatCount="indefinite" /></line>
                <line x1="150" y1="0" x2="140" y2="20"><animate attributeName="y1" from="-50" to="150" dur="1s" repeatCount="indefinite" /><animate attributeName="y2" from="-30" to="170" dur="1s" repeatCount="indefinite" /></line>
                <line x1="250" y1="0" x2="240" y2="20"><animate attributeName="y1" from="-100" to="100" dur="1s" repeatCount="indefinite" /><animate attributeName="y2" from="-80" to="120" dur="1s" repeatCount="indefinite" /></line>
             </g>
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
