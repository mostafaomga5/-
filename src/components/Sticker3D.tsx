import React from 'react';

export type Sticker3DId =
  | 'faults'
  | 'jobs'
  | 'market'
  | 'expo'
  | 'rfq'
  | 'training'
  | 'news'
  | 'visual_search'
  | 'injection_machine'
  | 'blow_bottles'
  | 'steel_mold'
  | 'resin_granules'
  | 'extrusion_pipe'
  | 'recycling_shredder'
  | 'servo_spares'
  | 'engineer_pro'
  | 'technician_pro'
  | 'factory_plant'
  | 'supplier_silo'
  | 'verified_shield';

export interface Sticker3DProps {
  id: Sticker3DId;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  floating?: boolean;
  dieCut?: boolean;
  alt?: string;
}

const SIZE_MAP: Record<NonNullable<Sticker3DProps['size']>, string> = {
  xs: 'w-9 h-9',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
  hero: 'w-40 h-40 sm:w-48 sm:h-48',
};

/**
 * High-definition 3D Isometric Industrial Stickers with 100% Transparent Background.
 * Each sticker uses multi-layered 3D isometric geometry, metallic & polymer gradients,
 * specular rim highlights, and a soft 3D drop shadow.
 */
export const Sticker3D: React.FC<Sticker3DProps> = ({
  id,
  size = 'md',
  className = '',
  floating = false,
  dieCut = true,
  alt,
}) => {
  const uid = React.useId().replace(/:/g, '');

  const renderArtwork = () => {
    switch (id) {
      case 'faults':
        // 3D Hydraulic Pressure Gauge + Chrome Wrench + Alert Gear
        return (
          <g>
            {/* Base 3D Isometric Platform */}
            <polygon
              points="100,172 36,136 100,100 164,136"
              fill={`url(#navyTop_${uid})`}
            />
            <polygon
              points="36,136 100,172 100,186 36,150"
              fill="#071D42"
            />
            <polygon
              points="164,136 100,172 100,186 164,150"
              fill="#0B2A5B"
            />
            {/* 3D Extruded Red/Orange Gear behind */}
            <circle cx="76" cy="96" r="36" fill="#991B1B" />
            <circle cx="72" cy="90" r="36" fill={`url(#crimson3d_${uid})`} stroke="#FCA5A5" strokeWidth="2" />
            <circle cx="72" cy="90" r="16" fill="#0B2A5B" stroke="#F8FAFC" strokeWidth="3" />
            {/* 3D Hydraulic Gauge Dial */}
            <ellipse cx="122" cy="86" rx="34" ry="34" fill="#0F172A" />
            <circle cx="118" cy="80" r="32" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="118" cy="80" r="24" fill="#F8FAFC" />
            {/* Gauge zones */}
            <path d="M 100 72 A 20 20 0 0 1 136 72" stroke="#10B981" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 136 72 A 20 20 0 0 1 138 92" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Needle */}
            <line x1="118" y1="84" x2="132" y2="66" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="118" cy="84" r="5" fill="#0B2A5B" />
            {/* 3D Chrome Spanner Wrench */}
            <path
              d="M 48 148 L 106 94 L 116 104 L 58 158 Z"
              fill={`url(#gold3d_${uid})`}
              stroke="#FEF3C7"
              strokeWidth="1.5"
            />
            <circle cx="52" cy="152" r="12" fill={`url(#gold3d_${uid})`} stroke="#FEF3C7" strokeWidth="2" />
            <circle cx="52" cy="152" r="5" fill="#0B2A5B" />
          </g>
        );

      case 'jobs':
        // 3D Industrial Engineer Safety Hardhat + Golden Star Badge + Blueprint
        return (
          <g>
            {/* 3D Isometric Pedestal */}
            <polygon points="100,174 34,138 100,102 166,138" fill={`url(#blueTop_${uid})`} />
            <polygon points="34,138 100,174 100,188 34,152" fill="#0B2A5B" />
            <polygon points="166,138 100,174 100,188 166,152" fill="#1D4ED8" />
            {/* 3D Engineering Portfolio Case */}
            <rect x="46" y="88" width="66" height="48" rx="10" fill="#071D42" />
            <rect x="42" y="82" width="66" height="48" rx="10" fill={`url(#navyTop_${uid})`} stroke="#93C5FD" strokeWidth="2" />
            <path d="M 62 82 V 72 C 62 67 88 67 88 72 V 82" stroke="#60A5FA" strokeWidth="4" fill="none" />
            {/* 3D Yellow/Amber Industrial Safety Hardhat */}
            <path
              d="M 76 112 C 76 68 156 68 156 112 Z"
              fill={`url(#gold3d_${uid})`}
              stroke="#FEF08A"
              strokeWidth="2.5"
            />
            {/* Hardhat 3D Center Ridge */}
            <path
              d="M 106 72 C 116 68 126 72 128 110 L 104 110 Z"
              fill="#F59E0B"
              opacity="0.65"
            />
            {/* Hardhat Visor Brim */}
            <path
              d="M 66 110 Q 116 126 166 110 Q 168 120 154 124 Q 116 136 74 124 Z"
              fill="#D97706"
              stroke="#FEF08A"
              strokeWidth="1.5"
            />
            {/* Front Shield Emblem on Hardhat */}
            <circle cx="116" cy="94" r="10" fill="#0B2A5B" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 112 94 L 115 97 L 121 91" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'market':
      case 'injection_machine':
        // 3D Isometric CNC Injection Molding Machine (Haitian/Engel style)
        return (
          <g>
            {/* 3D Isometric Factory Base Floor */}
            <polygon points="100,176 24,136 100,96 176,136" fill="#CBD5E1" />
            <polygon points="24,136 100,176 100,188 24,148" fill="#64748B" />
            <polygon points="176,136 100,176 100,188 176,148" fill="#475569" />
            {/* Left Clamping Unit 3D Cube */}
            <polygon points="40,126 40,70 76,52 76,108" fill={`url(#blueTop_${uid})`} />
            <polygon points="40,126 76,144 76,88 40,70" fill="#1E3A8A" />
            <polygon points="40,70 76,52 112,70 76,88" fill="#60A5FA" />
            {/* Chrome Tie Bars */}
            <line x1="76" y1="84" x2="128" y2="110" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
            <line x1="76" y1="108" x2="128" y2="134" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            {/* Steel Mold Platen in Middle */}
            <polygon points="94,128 94,78 114,68 114,118" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Glowing Molten Polymer Core */}
            <circle cx="104" cy="98" r="8" fill="#F97316" stroke="#FEF08A" strokeWidth="2" />
            {/* Right Injection Unit & Hopper */}
            <polygon points="116,142 158,120 158,86 116,108" fill={`url(#navyTop_${uid})`} />
            <polygon points="116,108 158,86 138,74 96,96" fill="#3B82F6" />
            {/* 3D Conical Material Hopper */}
            <polygon points="124,50 156,50 146,84 134,84" fill={`url(#gold3d_${uid})`} stroke="#FEF08A" strokeWidth="2" />
            <ellipse cx="140" cy="50" rx="16" ry="6" fill="#FDE047" />
          </g>
        );

      case 'expo':
        // 3D Isometric Virtual Exhibition Hall Booth with Glowing Arch & Podium
        return (
          <g>
            {/* Isometric Expo Floor */}
            <polygon points="100,178 26,138 100,98 174,138" fill={`url(#emerald3d_${uid})`} />
            <polygon points="26,138 100,178 100,190 26,150" fill="#065F46" />
            <polygon points="174,138 100,178 100,190 174,150" fill="#047857" />
            {/* Back 3D Booth Walls */}
            <polygon points="44,128 44,64 100,34 100,98" fill={`url(#navyTop_${uid})`} stroke="#38BDF8" strokeWidth="2" />
            <polygon points="100,98 100,34 156,64 156,128" fill="#0F2952" stroke="#60A5FA" strokeWidth="2" />
            {/* 3D Glowing Cyan/Blue Archway Roof */}
            <polygon points="38,64 100,30 162,64 100,94" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2.5" />
            {/* Center 3D Product Display Podium */}
            <polygon points="100,152 72,136 100,120 128,136" fill="#F8FAFC" />
            <polygon points="72,136 100,152 100,168 72,152" fill="#CBD5E1" />
            <polygon points="128,136 100,152 100,168 128,152" fill="#94A3B8" />
            {/* Floating 3D Golden Star / Trophy on Podium */}
            <circle cx="100" cy="112" r="18" fill={`url(#gold3d_${uid})`} stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M 93 112 L 98 117 L 108 106" stroke="#0B2A5B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'rfq':
      case 'steel_mold':
        // 3D Precision Multi-Cavity Steel Injection Mold Block with Hot Runner Channels
        return (
          <g>
            {/* Isometric Shadow Base */}
            <polygon points="100,178 30,140 100,102 170,140" fill="#1E293B" />
            <polygon points="30,140 100,178 100,190 30,152" fill="#0F172A" />
            <polygon points="170,140 100,178 100,190 170,152" fill="#334155" />
            {/* Lower Cavity Steel Block (3D Isometric Box) */}
            <polygon points="100,146 42,114 100,82 158,114" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="2" />
            <polygon points="42,114 100,146 100,172 42,140" fill="#64748B" stroke="#CBD5E1" strokeWidth="1.5" />
            <polygon points="158,114 100,146 100,172 158,140" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
            {/* 4 Glowing Blue 3D Mold Cavities */}
            <ellipse cx="82" cy="112" rx="11" ry="6" fill="#1D6BF3" stroke="#BAE6FD" strokeWidth="2" />
            <ellipse cx="118" cy="112" rx="11" ry="6" fill="#1D6BF3" stroke="#BAE6FD" strokeWidth="2" />
            <ellipse cx="100" cy="100" rx="11" ry="6" fill="#0284C7" stroke="#BAE6FD" strokeWidth="2" />
            <ellipse cx="100" cy="124" rx="11" ry="6" fill="#2563EB" stroke="#BAE6FD" strokeWidth="2" />
            {/* Guide Pillars (4 Chrome Pins) */}
            <rect x="48" y="64" width="10" height="46" rx="5" fill={`url(#steel3d_${uid})`} stroke="#F8FAFC" strokeWidth="1.5" />
            <rect x="142" y="64" width="10" height="46" rx="5" fill={`url(#steel3d_${uid})`} stroke="#F8FAFC" strokeWidth="1.5" />
            {/* Upper Core Block Floating Above */}
            <polygon points="100,86 50,58 100,30 150,58" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            <polygon points="50,58 100,86 100,100 50,72" fill="#1E3A8A" />
            <polygon points="150,58 100,86 100,100 150,72" fill="#0B2A5B" />
          </g>
        );

      case 'training':
        // 3D Isometric Golden Trophy Cup + Certified Engineering Diploma Scroll + Cap
        return (
          <g>
            {/* Isometric Base */}
            <polygon points="100,176 34,140 100,104 166,140" fill={`url(#navyTop_${uid})`} />
            <polygon points="34,140 100,176 100,188 34,152" fill="#071D42" />
            <polygon points="166,140 100,176 100,188 166,152" fill="#1E3A8A" />
            {/* 3D Certificate Tablet */}
            <rect x="42" y="66" width="76" height="58" rx="10" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="3" />
            <rect x="52" y="78" width="42" height="6" rx="3" fill="#0B2A5B" />
            <rect x="52" y="90" width="54" height="5" rx="2.5" fill="#64748B" />
            <rect x="52" y="100" width="36" height="5" rx="2.5" fill="#1D6BF3" />
            {/* 3D Golden Trophy & Medal */}
            <circle cx="132" cy="96" r="28" fill={`url(#gold3d_${uid})`} stroke="#FEF9C3" strokeWidth="3" />
            <circle cx="132" cy="96" r="20" fill="#B45309" />
            <polygon
              points="132,78 137,90 150,90 140,98 144,110 132,102 120,110 124,98 114,90 127,90"
              fill="#FDE047"
            />
            {/* Ribbons */}
            <polygon points="120,122 112,154 126,146 130,124" fill="#EF4444" />
            <polygon points="144,122 152,154 138,146 134,124" fill="#DC2626" />
          </g>
        );

      case 'news':
        // 3D Polymer Market Analytics Bars + Industrial Globe Sticker
        return (
          <g>
            <polygon points="100,176 32,140 100,104 168,140" fill="#0F172A" />
            <polygon points="32,140 100,176 100,188 32,152" fill="#1E293B" />
            <polygon points="168,140 100,176 100,188 168,152" fill="#334155" />
            {/* 3D Isometric Rising Columns */}
            <rect x="50" y="96" width="22" height="44" rx="5" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="1.5" />
            <rect x="82" y="74" width="22" height="66" rx="5" fill={`url(#emerald3d_${uid})`} stroke="#A7F3D0" strokeWidth="1.5" />
            <rect x="114" y="48" width="24" height="92" rx="5" fill={`url(#gold3d_${uid})`} stroke="#FEF08A" strokeWidth="2" />
            {/* 3D Rising Trend Arrow */}
            <path
              d="M 48 90 L 88 64 L 128 36"
              stroke="#38BDF8"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <polygon points="138,28 118,32 132,48" fill="#38BDF8" />
          </g>
        );

      case 'visual_search':
        // 3D Smart Camera Lens + Laser Scanning Grid over 3D Plastic Bottle
        return (
          <g>
            {/* Outer 3D Camera Body */}
            <rect x="34" y="54" width="132" height="106" rx="28" fill="#071D42" />
            <rect
              x="30"
              y="46"
              width="132"
              height="106"
              rx="28"
              fill={`url(#navyTop_${uid})`}
              stroke="#60A5FA"
              strokeWidth="3"
            />
            {/* Top Shutter & Flash */}
            <rect x="56" y="34" width="32" height="12" rx="6" fill={`url(#gold3d_${uid})`} />
            <circle cx="138" cy="68" r="7" fill="#38BDF8" />
            {/* 3D Concentric Camera Lens Rings */}
            <circle cx="96" cy="99" r="40" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="96" cy="99" r="31" fill="#06152D" stroke="#38BDF8" strokeWidth="2.5" />
            {/* 3D Bottle Inside Lens Being Scanned */}
            <rect x="86" y="73" width="20" height="8" rx="3" fill="#F59E0B" />
            <rect x="82" y="82" width="28" height="36" rx="8" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="1.5" />
            {/* Glowing Laser Scan Line */}
            <line x1="60" y1="98" x2="132" y2="98" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );

      case 'blow_bottles':
        // 3D Glossy HDPE & PET Bottles + Jerrycan + Precision Caps
        return (
          <g>
            <polygon points="100,178 30,142 100,106 170,142" fill="#E2E8F0" />
            <polygon points="30,142 100,178 100,188 30,152" fill="#94A3B8" />
            <polygon points="170,142 100,178 100,188 170,152" fill="#64748B" />
            {/* Left Industrial Jerrycan (Blue 3D) */}
            <rect x="44" y="68" width="48" height="72" rx="12" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            <rect x="54" y="54" width="18" height="14" rx="4" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
            <rect x="74" y="78" width="10" height="22" rx="5" fill="#0B2A5B" />
            {/* Center Tall Pharma HDPE Bottle (White/Pearl 3D) */}
            <rect x="82" y="56" width="44" height="92" rx="16" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="3" />
            <rect x="92" y="40" width="24" height="16" rx="5" fill={`url(#emerald3d_${uid})`} stroke="#A7F3D0" strokeWidth="2" />
            <rect x="88" y="84" width="32" height="34" rx="6" fill="#1D6BF3" />
            {/* Right PET Bottle (Amber/Gold 3D) */}
            <rect x="118" y="76" width="38" height="68" rx="14" fill={`url(#gold3d_${uid})`} stroke="#FEF08A" strokeWidth="2" />
            <rect x="127" y="62" width="20" height="14" rx="4" fill="#0B2A5B" />
          </g>
        );

      case 'resin_granules':
      case 'supplier_silo':
        // 3D Stainless Hopper & Silo Pouring Glossy Polymer Pellets
        return (
          <g>
            <polygon points="100,178 30,142 100,106 170,142" fill="#0B2A5B" />
            <polygon points="30,142 100,178 100,188 30,152" fill="#071D42" />
            <polygon points="170,142 100,178 100,188 170,152" fill="#1E3A8A" />
            {/* 3D Chrome Silo Cone */}
            <polygon
              points="58,36 142,36 122,92 78,92"
              fill={`url(#steel3d_${uid})`}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <ellipse cx="100" cy="36" rx="42" ry="10" fill="#CBD5E1" stroke="#FFFFFF" strokeWidth="2" />
            {/* 3D Glowing Polymer Granules Pile */}
            <circle cx="100" cy="136" r="14" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            <circle cx="76" cy="142" r="13" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            <circle cx="124" cy="142" r="13" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            <circle cx="88" cy="122" r="12" fill={`url(#emerald3d_${uid})`} stroke="#A7F3D0" strokeWidth="2" />
            <circle cx="112" cy="122" r="12" fill={`url(#gold3d_${uid})`} stroke="#FEF08A" strokeWidth="2" />
            <circle cx="100" cy="106" r="10" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        );

      case 'extrusion_pipe':
        // 3D Extruded HDPE Pipes with Blue Stripes & Film Roll
        return (
          <g>
            {/* 3D Isometric Pipe Bundle */}
            <path d="M 38 124 L 124 64 L 152 84 L 66 144 Z" fill={`url(#navyTop_${uid})`} stroke="#60A5FA" strokeWidth="2" />
            <ellipse cx="52" cy="134" rx="18" ry="22" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
            <ellipse cx="52" cy="134" rx="10" ry="13" fill="#0284C7" />
            {/* Second Pipe */}
            <path d="M 64 148 L 146 90 L 170 108 L 88 166 Z" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            <ellipse cx="76" cy="157" rx="16" ry="19" fill="#0F172A" stroke="#60A5FA" strokeWidth="3" />
            <ellipse cx="76" cy="157" rx="9" ry="11" fill="#38BDF8" />
            {/* Top Golden/Amber Film Roll */}
            <ellipse cx="96" cy="64" rx="28" ry="16" fill={`url(#gold3d_${uid})`} stroke="#FEF08A" strokeWidth="2" />
            <rect x="68" y="64" width="56" height="32" rx="6" fill={`url(#gold3d_${uid})`} />
            <ellipse cx="96" cy="64" rx="10" ry="6" fill="#0B2A5B" />
          </g>
        );

      case 'recycling_shredder':
      case 'servo_spares':
        // 3D Industrial Servo Motor & Recycling Turbine Rotor
        return (
          <g>
            <polygon points="100,176 32,140 100,104 168,140" fill="#064E3B" />
            <polygon points="32,140 100,176 100,188 32,152" fill="#022C22" />
            <polygon points="168,140 100,176 100,188 168,152" fill="#065F46" />
            {/* 3D Ribbed Servo Motor Housing */}
            <rect x="46" y="68" width="78" height="64" rx="14" fill={`url(#navyTop_${uid})`} stroke="#93C5FD" strokeWidth="2.5" />
            <line x1="60" y1="76" x2="60" y2="124" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <line x1="76" y1="76" x2="76" y2="124" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <line x1="92" y1="76" x2="92" y2="124" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            {/* 3D Chrome Rotor Shaft & Gear */}
            <circle cx="132" cy="100" r="32" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="132" cy="100" r="14" fill={`url(#emerald3d_${uid})`} stroke="#A7F3D0" strokeWidth="2.5" />
          </g>
        );

      case 'engineer_pro':
      case 'technician_pro':
        // 3D Isometric Industrial Engineer Character with Safety Hardhat & Digital Caliper
        return (
          <g>
            {/* 3D Circular Pedestal */}
            <ellipse cx="100" cy="156" rx="58" ry="22" fill="#0B2A5B" stroke="#60A5FA" strokeWidth="2.5" />
            {/* 3D Shoulders & Industrial Suit */}
            <path
              d="M 52 152 C 52 114 148 114 148 152 Z"
              fill={`url(#blueTop_${uid})`}
              stroke="#BAE6FD"
              strokeWidth="2.5"
            />
            {/* High-Vis Safety Vest Stripes */}
            <path d="M 76 122 L 70 152 L 82 152 L 86 122 Z" fill="#FDE047" />
            <path d="M 124 122 L 130 152 L 118 152 L 114 122 Z" fill="#FDE047" />
            {/* 3D Head */}
            <circle cx="100" cy="90" r="26" fill="#FDBA74" stroke="#FED7AA" strokeWidth="2" />
            {/* 3D Safety Hardhat (Gold for Engineer, Blue/Cyan for Technician) */}
            <path
              d="M 70 84 C 70 50 130 50 130 84 Z"
              fill={id === 'engineer_pro' ? `url(#gold3d_${uid})` : `url(#emerald3d_${uid})`}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <rect
              x="64"
              y="80"
              width="72"
              height="8"
              rx="4"
              fill={id === 'engineer_pro' ? '#D97706' : '#059669'}
            />
          </g>
        );

      case 'factory_plant':
        // 3D Isometric Smart Plastics Factory Complex with Silos & Roof Sawtooth
        return (
          <g>
            <polygon points="100,178 26,140 100,102 174,140" fill="#CBD5E1" />
            <polygon points="26,140 100,178 100,190 26,152" fill="#64748B" />
            <polygon points="174,140 100,178 100,190 174,152" fill="#475569" />
            {/* Main 3D Factory Hall */}
            <polygon points="44,136 44,78 104,48 104,106" fill={`url(#navyTop_${uid})`} stroke="#93C5FD" strokeWidth="2" />
            <polygon points="104,136 104,78 156,104 156,150" fill={`url(#blueTop_${uid})`} stroke="#BAE6FD" strokeWidth="2" />
            {/* Two Tall 3D Polymer Storage Silos */}
            <rect x="48" y="42" width="22" height="72" rx="11" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="2" />
            <rect x="74" y="34" width="22" height="80" rx="11" fill={`url(#steel3d_${uid})`} stroke="#FFFFFF" strokeWidth="2" />
            {/* Verified Check Emblem on Factory */}
            <circle cx="132" cy="96" r="18" fill={`url(#emerald3d_${uid})`} stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M 124 96 L 130 102 L 141 90" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'verified_shield':
      default:
        // 3D Isometric Emerald & Gold Verified Factory Shield Sticker
        return (
          <g>
            {/* 3D Extruded Back Shield Layer */}
            <path
              d="M 104 30 L 160 54 V 102 C 160 142 104 174 104 174 C 104 174 48 142 48 102 V 54 Z"
              fill="#064E3B"
            />
            {/* Front 3D Shield Layer */}
            <path
              d="M 98 24 L 154 48 V 96 C 154 136 98 168 98 168 C 98 168 42 136 42 96 V 48 Z"
              fill={`url(#emerald3d_${uid})`}
              stroke="#A7F3D0"
              strokeWidth="4"
            />
            {/* Inner Gold 3D Ring */}
            <circle cx="98" cy="94" r="34" fill={`url(#gold3d_${uid})`} stroke="#FEF9C3" strokeWidth="3" />
            {/* Crisp 3D Checkmark */}
            <path
              d="M 82 94 L 93 105 L 116 82"
              stroke="#0B2A5B"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        );
    }
  };

  return (
    <div
      data-testid={`sticker-3d-${id}`}
      aria-label={alt || id}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${SIZE_MAP[size]} ${
        floating ? 'sticker-3d-float' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-[0_10px_16px_rgba(11,42,91,0.22)] transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id={`navyTop_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#0B2A5B" />
            <stop offset="100%" stopColor="#06152D" />
          </linearGradient>
          <linearGradient id={`blueTop_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#1D6BF3" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id={`gold3d_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id={`emerald3d_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id={`crimson3d_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="55%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id={`steel3d_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <filter id={`diecut_${uid}`} x="-15%" y="-15%" width="130%" height="130%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="dilated" />
            <feFlood floodColor="#FFFFFF" floodOpacity="0.96" result="whiteStroke" />
            <feComposite in="whiteStroke" in2="dilated" operator="in" result="stickerBorder" />
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0B2A5B" floodOpacity="0.22" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="stickerBorder" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={dieCut ? `url(#diecut_${uid})` : undefined}>{renderArtwork()}</g>
      </svg>
    </div>
  );
};
