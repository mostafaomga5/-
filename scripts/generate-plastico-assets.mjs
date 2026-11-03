import fs from 'node:fs';
import path from 'node:path';

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

ensureDir('public/assets/plastico/roles');
ensureDir('public/assets/plastico/machinery');
ensureDir('public/assets/plastico/materials');
ensureDir('public/assets/plastico/exhibitions');

// ============================================================================
// 1. 7 TRANSPARENT-BACKGROUND MACHINERY & POLYMER CUTOUTS (GREEN SCREEN REMOVED)
// ============================================================================

const transparentMachinery = {
  'public/assets/plastico/machinery/injection-450t-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" fill="none">
  <defs>
    <linearGradient id="navyBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E2D5C"/>
      <stop offset="55%" stop-color="#071A33"/>
      <stop offset="100%" stop-color="#051124"/>
    </linearGradient>
    <linearGradient id="blueAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1769E8"/>
      <stop offset="100%" stop-color="#27BED6"/>
    </linearGradient>
    <linearGradient id="steelBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="45%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
    <filter id="dropShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.38"/>
    </filter>
  </defs>
  <g filter="url(#dropShadow)">
    <!-- Base Frame -->
    <rect x="64" y="305" width="496" height="118" rx="10" fill="url(#navyBody)" stroke="#1E3A5F" stroke-width="2"/>
    <rect x="64" y="294" width="496" height="16" rx="5" fill="#13386E"/>
    <rect x="74" y="300" width="476" height="4" rx="2" fill="url(#blueAccent)"/>
    <!-- Legs -->
    <rect x="86" y="418" width="44" height="30" rx="4" fill="#051124"/>
    <rect x="494" y="418" width="44" height="30" rx="4" fill="#051124"/>
    <!-- Ventilation Grille & Panel -->
    <rect x="135" y="335" width="115" height="65" rx="6" fill="#051226" stroke="#1E3A5F"/>
    <line x1="148" y1="350" x2="236" y2="350" stroke="#1E3A5F" stroke-width="3"/>
    <line x1="148" y1="362" x2="236" y2="362" stroke="#1E3A5F" stroke-width="3"/>
    <line x1="148" y1="374" x2="236" y2="374" stroke="#1E3A5F" stroke-width="3"/>
    <line x1="148" y1="386" x2="236" y2="386" stroke="#1E3A5F" stroke-width="3"/>
    <!-- Digital Control Readout Box -->
    <rect x="392" y="322" width="84" height="62" rx="6" fill="#0B2244" stroke="#27BED6" stroke-width="1.5"/>
    <rect x="400" y="330" width="68" height="24" rx="3" fill="#041022"/>
    <text x="434" y="345" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="7.5" font-weight="bold">READY • 220°C</text>
    <circle cx="410" cy="368" r="4" fill="#FF8A2A"/>
    <circle cx="425" cy="368" r="4" fill="#1769E8"/>
    <circle cx="440" cy="368" r="4" fill="#10B981"/>
    <circle cx="455" cy="368" r="4" fill="#FF8A2A"/>
    <!-- Injection Unit Housing (Left) -->
    <rect x="52" y="182" width="188" height="114" rx="8" fill="url(#navyBody)" stroke="#1769E8" stroke-width="1.5"/>
    <rect x="52" y="198" width="188" height="4" fill="url(#blueAccent)"/>
    <rect x="92" y="232" width="108" height="22" rx="4" fill="#041022" stroke="#1E3A5F"/>
    <text x="146" y="246" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="9" font-weight="bold">INJECTION UNIT • 450T</text>
    <!-- Hopper & Granules -->
    <path d="M84 56 H220 L184 146 H120 Z" fill="url(#navyBody)" stroke="#27BED6" stroke-width="1.5"/>
    <path d="M110 112 H194 L182 144 H122 Z" fill="#FF8A2A" opacity="0.88"/>
    <ellipse cx="152" cy="56" rx="68" ry="12" fill="#13386E" stroke="#27BED6" stroke-width="1.5"/>
    <rect x="132" y="144" width="40" height="20" fill="#0B2244"/>
    <!-- Screw Barrel & Orange Nozzle -->
    <rect x="104" y="146" width="398" height="32" rx="6" fill="url(#navyBody)" stroke="#1E3A5F" stroke-width="1.5"/>
    <line x1="112" y1="162" x2="494" y2="162" stroke="#27BED6" stroke-width="2.5"/>
    <rect x="502" y="150" width="24" height="24" rx="3" fill="#FF8A2A"/>
    <polygon points="526,155 554,162 526,169" fill="#FF8A2A"/>
    <!-- Clamping Tie Bars & Platens (Right) -->
    <rect x="240" y="204" width="145" height="14" fill="url(#steelBar)"/>
    <rect x="240" y="264" width="145" height="14" fill="url(#steelBar)"/>
    <rect x="240" y="192" width="28" height="102" rx="4" fill="url(#steelBar)"/>
    <rect x="364" y="186" width="38" height="108" rx="5" fill="url(#navyBody)" stroke="#1769E8"/>
    <!-- Hydraulic Cylinders -->
    <rect x="402" y="196" width="118" height="22" rx="5" fill="#13386E" stroke="#27BED6" stroke-width="1"/>
    <rect x="402" y="230" width="118" height="24" rx="5" fill="#13386E" stroke="#27BED6" stroke-width="1"/>
    <rect x="402" y="264" width="118" height="22" rx="5" fill="#13386E" stroke="#27BED6" stroke-width="1"/>
    <rect x="520" y="186" width="24" height="108" rx="4" fill="url(#navyBody)" stroke="#1E3A5F"/>
  </g>
</svg>`,

  'public/assets/plastico/machinery/blow-molding-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 520" fill="none">
  <defs>
    <linearGradient id="bmNavy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#103166"/>
      <stop offset="100%" stop-color="#071A33"/>
    </linearGradient>
    <linearGradient id="bmSteel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="parisonGlow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF8A2A"/>
      <stop offset="50%" stop-color="#FFB067"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <filter id="bmShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.38"/>
    </filter>
  </defs>
  <g filter="url(#bmShadow)">
    <!-- Main Frame & Right Control Tower -->
    <rect x="130" y="96" width="290" height="360" rx="10" fill="none" stroke="#0B2548" stroke-width="26"/>
    <rect x="392" y="96" width="96" height="360" rx="8" fill="url(#bmNavy)" stroke="#1769E8" stroke-width="2"/>
    <!-- Gauges & Buttons on Tower -->
    <circle cx="422" cy="138" r="14" fill="#F8FAFC" stroke="#27BED6" stroke-width="2"/>
    <line x1="422" y1="138" x2="430" y2="130" stroke="#071A33" stroke-width="2"/>
    <circle cx="458" cy="138" r="14" fill="#F8FAFC" stroke="#FF8A2A" stroke-width="2"/>
    <line x1="458" y1="138" x2="466" y2="132" stroke="#DC2626" stroke-width="2"/>
    <text x="422" y="164" text-anchor="middle" fill="#27BED6" font-family="sans-serif" font-size="7" font-weight="bold">6.2 BAR</text>
    <text x="458" y="164" text-anchor="middle" fill="#FF8A2A" font-family="sans-serif" font-size="7" font-weight="bold">210°C</text>
    <circle cx="422" cy="184" r="7" fill="#FF8A2A"/>
    <circle cx="458" cy="184" r="7" fill="#1769E8"/>
    <circle cx="458" cy="208" r="8" fill="#EF4444"/>
    <!-- Top Extrusion Head -->
    <rect x="215" y="42" width="110" height="90" rx="8" fill="url(#bmNavy)" stroke="#27BED6" stroke-width="1.5"/>
    <rect x="246" y="132" width="48" height="22" rx="4" fill="url(#bmSteel)"/>
    <!-- Glowing Orange Parison Tube -->
    <rect x="256" y="154" width="28" height="92" rx="12" fill="url(#parisonGlow)"/>
    <!-- Left & Right Open Mold Halves -->
    <rect x="82" y="182" width="96" height="176" rx="6" fill="url(#bmSteel)" stroke="#334155" stroke-width="2"/>
    <rect x="112" y="210" width="54" height="120" rx="8" fill="#475569"/>
    <rect x="362" y="182" width="96" height="176" rx="6" fill="url(#bmSteel)" stroke="#334155" stroke-width="2"/>
    <rect x="374" y="210" width="54" height="120" rx="8" fill="#475569"/>
    <!-- Molded Blue Bottle in Center -->
    <rect x="260" y="294" width="20" height="14" rx="2" fill="#1769E8"/>
    <path d="M248 308 Q242 320 242 338 V396 Q242 406 254 406 H286 Q298 406 298 396 V338 Q298 320 292 308 Z" fill="#1769E8" stroke="#27BED6" stroke-width="1.5"/>
    <line x1="244" y1="342" x2="296" y2="342" stroke="#60A5FA" stroke-width="2"/>
    <line x1="244" y1="368" x2="296" y2="368" stroke="#60A5FA" stroke-width="2"/>
    <!-- Bottom Platen & Base -->
    <rect x="148" y="406" width="244" height="36" rx="5" fill="url(#bmSteel)"/>
    <rect x="122" y="442" width="336" height="34" rx="6" fill="url(#bmNavy)"/>
  </g>
</svg>`,

  'public/assets/plastico/machinery/rotomolding-3000-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" fill="none">
  <defs>
    <linearGradient id="rmNavy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12346B"/>
      <stop offset="100%" stop-color="#071A33"/>
    </linearGradient>
    <linearGradient id="rmSteel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="rmShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.38"/>
    </filter>
  </defs>
  <g filter="url(#rmShadow)">
    <!-- Main Oven Chamber -->
    <rect x="128" y="48" width="400" height="310" rx="12" fill="url(#rmNavy)" stroke="#FF8A2A" stroke-width="2"/>
    <rect x="156" y="76" width="320" height="252" rx="8" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
    <!-- Left HMI Touch Panel -->
    <rect x="34" y="148" width="96" height="114" rx="8" fill="url(#rmNavy)" stroke="#1769E8" stroke-width="2"/>
    <rect x="44" y="158" width="76" height="68" rx="4" fill="#041022" stroke="#27BED6"/>
    <text x="82" y="174" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="7" font-weight="bold">ROTOMOLDING 3000</text>
    <text x="82" y="188" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="7">TEMP: 220°C</text>
    <text x="82" y="200" text-anchor="middle" fill="#FF8A2A" font-family="monospace" font-size="6.5">BIAXIAL: 6 RPM</text>
    <text x="82" y="212" text-anchor="middle" fill="#10B981" font-family="monospace" font-size="6.5">CYCLE: ROTATING</text>
    <circle cx="54" cy="242" r="5" fill="#EF4444"/>
    <circle cx="72" cy="242" r="5" fill="#1769E8"/>
    <circle cx="90" cy="242" r="5" fill="#FF8A2A"/>
    <circle cx="108" cy="242" r="6" fill="#FACC15"/>
    <!-- Biaxial Rotating Drum with Orange Polymer Granules Inside -->
    <ellipse cx="316" cy="202" rx="92" ry="76" fill="url(#rmSteel)" stroke="#475569" stroke-width="3"/>
    <ellipse cx="352" cy="202" rx="54" ry="62" fill="#0F172A" stroke="#CBD5E1" stroke-width="4"/>
    <path d="M312 222 Q352 195 396 226 Q384 258 352 260 Q320 258 312 222 Z" fill="#FF8A2A"/>
    <!-- Biaxial Arms -->
    <rect x="174" y="246" width="110" height="24" rx="6" fill="#1769E8" stroke="#FF8A2A" stroke-width="2"/>
    <rect x="318" y="246" width="110" height="24" rx="6" fill="#1769E8" stroke="#FF8A2A" stroke-width="2"/>
    <!-- Lower Drive Base & Orange Motor -->
    <rect x="138" y="358" width="380" height="82" rx="8" fill="url(#rmNavy)" stroke="#1769E8" stroke-width="1.5"/>
    <rect x="380" y="372" width="96" height="44" rx="10" fill="#FF8A2A" stroke="#EA580C" stroke-width="2"/>
    <rect x="210" y="414" width="236" height="18" rx="4" fill="#041022"/>
    <text x="328" y="426" text-anchor="middle" fill="#CBD5E1" font-family="sans-serif" font-size="7.5" font-weight="bold">MODEL: RM-B200 • ROTATIONAL MOLDING MACHINE • 380V</text>
  </g>
</svg>`,

  'public/assets/plastico/machinery/extruder-cutaway-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 460" fill="none">
  <defs>
    <linearGradient id="exNavy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12356E"/>
      <stop offset="100%" stop-color="#071A33"/>
    </linearGradient>
    <linearGradient id="exSteel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="exShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.38"/>
    </filter>
  </defs>
  <g filter="url(#exShadow)">
    <!-- Top Hopper -->
    <polygon points="48,54 244,54 202,168 90,168" fill="url(#exNavy)" stroke="#1769E8" stroke-width="2"/>
    <rect x="48" y="68" width="196" height="8" fill="#1769E8"/>
    <!-- Main Extruder Barrel with Cutaway Screw Window -->
    <rect x="64" y="168" width="396" height="110" rx="16" fill="url(#exNavy)" stroke="#1E3A5F" stroke-width="2"/>
    <rect x="64" y="214" width="396" height="14" fill="#1769E8"/>
    <!-- Cutaway Window Revealing Rotating Screw -->
    <rect x="184" y="188" width="210" height="68" rx="6" fill="#0F172A" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="196" y="206" width="186" height="32" rx="4" fill="url(#exSteel)"/>
    <path d="M208 206 L226 238 M236 206 L254 238 M264 206 L282 238 M292 206 L310 238 M320 206 L338 238 M348 206 L366 238" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
    <!-- Orange Die Head & Extruded Pipe -->
    <rect x="460" y="180" width="54" height="86" rx="8" fill="#FF8A2A" stroke="#EA580C" stroke-width="2"/>
    <rect x="514" y="198" width="110" height="50" rx="6" fill="#FF8A2A"/>
    <!-- Control Console & Base -->
    <rect x="142" y="278" width="276" height="134" rx="10" fill="url(#exNavy)" stroke="#1769E8" stroke-width="1.5"/>
    <rect x="206" y="264" width="128" height="92" rx="8" fill="#0D2852" stroke="#27BED6" stroke-width="1.5"/>
    <rect x="220" y="278" width="100" height="34" rx="4" fill="#041022"/>
    <text x="270" y="293" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="8.5" font-weight="bold">TEMP 210°C</text>
    <text x="270" y="305" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="8" font-weight="bold">SPEED 45 RPM</text>
    <circle cx="270" cy="334" r="10" fill="#1E293B" stroke="#94A3B8" stroke-width="2"/>
  </g>
</svg>`,

  'public/assets/plastico/machinery/blown-film-tower-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 540" fill="none">
  <defs>
    <linearGradient id="bfNavy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#11346A"/>
      <stop offset="100%" stop-color="#071A33"/>
    </linearGradient>
    <linearGradient id="filmBubble" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.75"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="bfShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.38"/>
    </filter>
  </defs>
  <g filter="url(#bfShadow)">
    <!-- Vertical Tower Frame -->
    <rect x="136" y="38" width="22" height="390" rx="4" fill="url(#bfNavy)" stroke="#1769E8"/>
    <rect x="356" y="38" width="22" height="390" rx="4" fill="url(#bfNavy)" stroke="#1769E8"/>
    <rect x="136" y="42" width="242" height="24" rx="4" fill="#1769E8"/>
    <rect x="164" y="72" width="186" height="16" rx="6" fill="#94A3B8"/>
    <!-- Web Pulling Diagonal Film Sheet -->
    <polygon points="248,68 292,68 418,288 352,288" fill="url(#filmBubble)"/>
    <!-- Blown Film Bubble -->
    <path d="M222 364 C188 330 192 162 216 142 H298 C322 162 326 330 292 364 Z" fill="url(#filmBubble)" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="202" y="134" width="110" height="14" rx="5" fill="#1769E8"/>
    <!-- Circular Die Head with Glowing Melt Ring -->
    <rect x="218" y="364" width="78" height="44" rx="6" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
    <ellipse cx="257" cy="364" rx="28" ry="6" fill="#FF8A2A"/>
    <!-- Bottom Extruder & Right Film Roll Winder -->
    <rect x="86" y="416" width="268" height="68" rx="14" fill="url(#bfNavy)" stroke="#FF8A2A" stroke-width="2"/>
    <ellipse cx="398" cy="316" rx="54" ry="46" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="3"/>
    <circle cx="418" cy="316" r="14" fill="#FF8A2A"/>
    <rect x="336" y="316" width="136" height="148" rx="8" fill="url(#bfNavy)" stroke="#1769E8" stroke-width="2"/>
    <text x="404" y="424" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="7.5" font-weight="bold">WINDER • 42 m/min</text>
  </g>
</svg>`,

  'public/assets/plastico/machinery/thermoforming-3000-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" fill="none">
  <defs>
    <linearGradient id="tfNavy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12366E"/>
      <stop offset="100%" stop-color="#071A33"/>
    </linearGradient>
    <linearGradient id="heaterGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF8A2A"/>
      <stop offset="50%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="tfShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.38"/>
    </filter>
  </defs>
  <g filter="url(#tfShadow)">
    <!-- Top Infrared Heating Hood -->
    <rect x="96" y="44" width="340" height="96" rx="12" fill="url(#tfNavy)" stroke="#27BED6" stroke-width="2.5"/>
    <text x="266" y="84" text-anchor="middle" fill="#CBD5E1" font-family="sans-serif" font-size="12" font-weight="bold">HEATING STATION</text>
    <!-- Glowing Infrared Ceramic Heater Matrix -->
    <rect x="132" y="116" width="268" height="44" rx="6" fill="url(#heaterGlow)" stroke="#FDE047" stroke-width="2"/>
    <!-- Vertical Guide Pillars -->
    <rect x="168" y="160" width="18" height="156" fill="#CBD5E1"/>
    <rect x="412" y="160" width="18" height="156" fill="#CBD5E1"/>
    <!-- Clear Plastic Film Draping Over Trays -->
    <polygon points="196,160 368,160 338,306 164,306" fill="#E2E8F0" fill-opacity="0.45" stroke="#94A3B8"/>
    <!-- Molded Clear Packaging Trays -->
    <rect x="128" y="294" width="84" height="32" rx="6" fill="#CBD5E1" fill-opacity="0.7" stroke="#F8FAFC" stroke-width="2"/>
    <rect x="220" y="294" width="84" height="32" rx="6" fill="#CBD5E1" fill-opacity="0.7" stroke="#F8FAFC" stroke-width="2"/>
    <rect x="312" y="294" width="84" height="32" rx="6" fill="#CBD5E1" fill-opacity="0.7" stroke="#F8FAFC" stroke-width="2"/>
    <!-- Lower Vacuum Base & Right Control Tower -->
    <rect x="86" y="326" width="332" height="118" rx="10" fill="url(#tfNavy)" stroke="#27BED6" stroke-width="2"/>
    <text x="252" y="382" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="13" font-weight="bold">THERMOFORM-3000</text>
    <text x="252" y="398" text-anchor="middle" fill="#27BED6" font-family="sans-serif" font-size="8" font-weight="bold">AUTOMATION • VACUUM FORMING</text>
    <rect x="418" y="246" width="116" height="198" rx="10" fill="url(#tfNavy)" stroke="#1769E8" stroke-width="2"/>
    <circle cx="444" cy="284" r="8" fill="#FF8A2A"/>
    <circle cx="472" cy="284" r="8" fill="#FF8A2A"/>
    <circle cx="502" cy="284" r="10" fill="#EF4444"/>
    <rect x="436" y="322" width="80" height="34" rx="4" fill="#041022" stroke="#27BED6"/>
    <text x="476" y="337" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="7.5" font-weight="bold">TEMP: 165°C</text>
    <text x="476" y="349" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="7.5" font-weight="bold">PRESS: 6.2 BAR</text>
  </g>
</svg>`,

  'public/assets/plastico/materials/polymer-pellets-cutout.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 480" fill="none">
  <defs>
    <linearGradient id="sackWhite" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="65%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <filter id="pelletShadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#071A33" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#pelletShadow)">
    <!-- White 25KG Polymer Resin Woven Sack -->
    <path d="M68 112 Q60 72 178 72 Q296 72 288 112 L310 386 Q312 406 284 406 H64 Q44 406 48 386 Z" fill="url(#sackWhite)" stroke="#94A3B8" stroke-width="2"/>
    <!-- Blue Granules Inside Open Top of Sack -->
    <ellipse cx="178" cy="114" rx="92" ry="32" fill="#1769E8"/>
    <ellipse cx="178" cy="110" rx="76" ry="22" fill="#0B4BB8"/>
    <!-- Label on Sack -->
    <rect x="102" y="218" width="168" height="92" rx="6" fill="#071A33"/>
    <text x="186" y="256" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="900">POLYMER</text>
    <text x="186" y="276" text-anchor="middle" fill="#27BED6" font-family="sans-serif" font-size="8.5" font-weight="bold">RAW MATERIAL • PLASTIC PELLETS</text>
    <text x="186" y="294" text-anchor="middle" fill="#CBD5E1" font-family="monospace" font-size="8">GRADE: PP/PE • BATCH: RM-1024 • 25KG</text>
    <!-- Glass Masterbatch & Polymer Jar on Right -->
    <rect x="352" y="114" width="144" height="32" rx="8" fill="#071A33" stroke="#1769E8" stroke-width="2"/>
    <rect x="332" y="146" width="184" height="258" rx="28" fill="#F8FAFC" fill-opacity="0.92" stroke="#CBD5E1" stroke-width="3"/>
    <!-- Half Blue / Half Orange Granules Inside Jar -->
    <path d="M342 184 H424 V392 H360 Q342 392 342 372 Z" fill="#1769E8"/>
    <path d="M424 184 H506 V372 Q506 392 488 392 H424 Z" fill="#FF8A2A"/>
    <!-- Spilled Blue Pellets in Foreground -->
    <ellipse cx="224" cy="414" rx="116" ry="22" fill="#1769E8"/>
    <circle cx="96" cy="422" r="6" fill="#1769E8"/>
    <circle cx="118" cy="432" r="6" fill="#1769E8"/>
    <circle cx="268" cy="434" r="6" fill="#1769E8"/>
    <circle cx="358" cy="426" r="6" fill="#FF8A2A"/>
  </g>
</svg>`,
};

for (const [filePath, svg] of Object.entries(transparentMachinery)) {
  fs.writeFileSync(filePath, svg, 'utf8');
}

// ============================================================================
// 2. 8 ROLE REGISTRATION CARDS (MATCHING UPLOADED PERSONAS)
// ============================================================================

const makeRoleCardSvg = ({
  bgGradStart,
  bgGradEnd,
  accentColor,
  badgeText,
  shirtColor,
  collarColor,
  accessoryType,
  backdropLabel,
}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 480" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgGradStart}"/>
      <stop offset="100%" stop-color="${bgGradEnd}"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F2C29B"/>
      <stop offset="100%" stop-color="#D99B72"/>
    </linearGradient>
    <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${shirtColor}"/>
      <stop offset="100%" stop-color="${collarColor}"/>
    </linearGradient>
  </defs>
  <!-- Industrial Environment Backdrop -->
  <rect width="420" height="480" rx="28" fill="url(#bg)"/>
  <circle cx="350" cy="80" r="120" fill="${accentColor}" opacity="0.16"/>
  <rect x="24" y="24" width="175" height="34" rx="10" fill="#071A33" fill-opacity="0.78" stroke="${accentColor}" stroke-width="1.5"/>
  <text x="111" y="45" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">${backdropLabel}</text>

  <!-- Industrial Background Silhouettes -->
  <rect x="28" y="160" width="95" height="190" rx="10" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12"/>
  <rect x="300" y="130" width="95" height="220" rx="10" fill="#FFFFFF" fill-opacity="0.06" stroke="${accentColor}" stroke-opacity="0.28"/>
  <line x1="315" y1="165" x2="380" y2="165" stroke="${accentColor}" stroke-width="3" stroke-opacity="0.5"/>
  <line x1="315" y1="185" x2="365" y2="185" stroke="#27BED6" stroke-width="2" stroke-opacity="0.4"/>

  <!-- Character Shoulders & Torso -->
  <path d="M78 480 C78 355 128 312 210 312 C292 312 342 355 342 480 Z" fill="url(#suit)" stroke="${accentColor}" stroke-width="2"/>
  <!-- PLASTICO Chest Badge -->
  <rect x="238" y="368" width="66" height="20" rx="5" fill="#071A33" stroke="${accentColor}" stroke-width="1.2"/>
  <text x="271" y="381" text-anchor="middle" fill="${accentColor}" font-family="sans-serif" font-size="9" font-weight="bold">${badgeText}</text>

  <!-- Neck & Head -->
  <rect x="184" y="258" width="52" height="66" rx="20" fill="url(#skin)"/>
  <rect x="148" y="118" width="124" height="154" rx="56" fill="url(#skin)"/>

  <!-- Hair / Safety Gear -->
  ${
    accessoryType === 'hairnet'
      ? `<path d="M140 165 C140 100 280 100 280 165 Z" fill="#BAE6FD" fill-opacity="0.88" stroke="#38BDF8" stroke-width="2"/>`
      : `<path d="M146 168 C142 104 278 104 274 168 C260 138 160 138 146 168 Z" fill="#1E293B"/>`
  }

  <!-- Safety Glasses if Engineer / Technician / Worker -->
  ${
    accessoryType === 'goggles' || accessoryType === 'hairnet'
      ? `<rect x="160" y="172" width="44" height="24" rx="6" fill="#38BDF8" fill-opacity="0.25" stroke="#1769E8" stroke-width="2.5"/>
         <rect x="216" y="172" width="44" height="24" rx="6" fill="#38BDF8" fill-opacity="0.25" stroke="#1769E8" stroke-width="2.5"/>
         <line x1="204" y1="182" x2="216" y2="182" stroke="#1769E8" stroke-width="2.5"/>`
      : ''
  }

  <!-- Eyes, Eyebrows, Beard & Smile -->
  <rect x="168" y="164" width="28" height="5" rx="2.5" fill="#1E293B"/>
  <rect x="224" y="164" width="28" height="5" rx="2.5" fill="#1E293B"/>
  <circle cx="182" cy="184" r="6" fill="#0F172A"/>
  <circle cx="238" cy="184" r="6" fill="#0F172A"/>
  <path d="M154 218 C158 258 262 258 266 218 C256 238 164 238 154 218 Z" fill="#1E293B" opacity="0.82"/>
  <path d="M192 232 Q210 244 228 232" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>

  <!-- Role-Specific Foreground Prop -->
  ${
    accessoryType === 'tablet'
      ? `<rect x="118" y="388" width="120" height="76" rx="10" fill="#0F172A" stroke="#27BED6" stroke-width="2.5"/>
         <text x="178" y="416" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="10" font-weight="bold">YIELD 92.4%</text>
         <rect x="138" y="428" width="16" height="22" fill="#1769E8"/>
         <rect x="162" y="420" width="16" height="30" fill="#FF8A2A"/>
         <rect x="186" y="412" width="16" height="38" fill="#27BED6"/>`
      : accessoryType === 'pellets'
      ? `<rect x="116" y="376" width="86" height="92" rx="14" fill="#F8FAFC" fill-opacity="0.9" stroke="#CBD5E1" stroke-width="2.5"/>
         <rect x="124" y="396" width="70" height="64" rx="8" fill="#1769E8"/>
         <text x="159" y="432" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="9" font-weight="bold">PP / PE</text>`
      : accessoryType === 'specboard'
      ? `<rect x="114" y="374" width="116" height="94" rx="8" fill="#FFFFFF" stroke="#071A33" stroke-width="3"/>
         <text x="172" y="398" text-anchor="middle" fill="#071A33" font-family="sans-serif" font-size="9" font-weight="bold">SPECIFICATIONS</text>
         <text x="172" y="416" text-anchor="middle" fill="#1769E8" font-family="monospace" font-size="8.5" font-weight="bold">MODEL: IM-2400 400T</text>
         <text x="172" y="434" text-anchor="middle" fill="#FF8A2A" font-family="monospace" font-size="8" font-weight="bold">210°C • 180 BAR</text>`
      : accessoryType === 'goggles'
      ? `<rect x="118" y="402" width="136" height="64" rx="8" fill="#94A3B8" stroke="#475569" stroke-width="2.5"/>
         <text x="186" y="438" text-anchor="middle" fill="#071A33" font-family="sans-serif" font-size="10" font-weight="bold">CNC MOLD CAVITY</text>`
      : ''
  }
</svg>`;

const roleCards = {
  'public/assets/plastico/roles/factory-owner.svg': makeRoleCardSvg({
    bgGradStart: '#071A33',
    bgGradEnd: '#123466',
    accentColor: '#FF8A2A',
    badgeText: 'PLASTICO',
    shirtColor: '#0F294D',
    collarColor: '#071A33',
    accessoryType: 'executive',
    backdropLabel: 'PLASTICO • PLANT DIRECTOR',
  }),
  'public/assets/plastico/roles/engineer.svg': makeRoleCardSvg({
    bgGradStart: '#092247',
    bgGradEnd: '#1769E8',
    accentColor: '#27BED6',
    badgeText: 'ENG • QC',
    shirtColor: '#CBD5E1',
    collarColor: '#94A3B8',
    accessoryType: 'tablet',
    backdropLabel: 'PROCESS • CAD • YIELD 92.4%',
  }),
  'public/assets/plastico/roles/technician.svg': makeRoleCardSvg({
    bgGradStart: '#0B2342',
    bgGradEnd: '#1E3A5F',
    accentColor: '#FF8A2A',
    badgeText: 'TECH-03',
    shirtColor: '#1E3A5F',
    collarColor: '#0F2544',
    accessoryType: 'goggles',
    backdropLabel: 'TECH-MECH 03 • MOLD CARE',
  }),
  'public/assets/plastico/roles/production-worker.svg': makeRoleCardSvg({
    bgGradStart: '#0D2B54',
    bgGradEnd: '#1769E8',
    accentColor: '#27BED6',
    badgeText: 'PLASTICO',
    shirtColor: '#60A5FA',
    collarColor: '#2563EB',
    accessoryType: 'hairnet',
    backdropLabel: 'PLASTICO • PRODUCTION QC',
  }),
  'public/assets/plastico/roles/supplier.svg': makeRoleCardSvg({
    bgGradStart: '#071A33',
    bgGradEnd: '#153E75',
    accentColor: '#1769E8',
    badgeText: 'RESIN PRO',
    shirtColor: '#1E293B',
    collarColor: '#0F172A',
    accessoryType: 'pellets',
    backdropLabel: 'POLYMER RESIN • PP / PE',
  }),
  'public/assets/plastico/roles/machinery-trader.svg': makeRoleCardSvg({
    bgGradStart: '#081E3D',
    bgGradEnd: '#17468A',
    accentColor: '#FF8A2A',
    badgeText: 'IM-2400',
    shirtColor: '#173A6E',
    collarColor: '#0B2144',
    accessoryType: 'specboard',
    backdropLabel: 'MACHINERY • 400T SPECS',
  }),
  'public/assets/plastico/roles/manufacturer-operator.svg': makeRoleCardSvg({
    bgGradStart: '#0A2140',
    bgGradEnd: '#1E3A5F',
    accentColor: '#27BED6',
    badgeText: 'OEM LINE',
    shirtColor: '#334155',
    collarColor: '#1E293B',
    accessoryType: 'operator',
    backdropLabel: 'CONTRACT MANUFACTURING',
  }),
  'public/assets/plastico/roles/student-trainee.svg': makeRoleCardSvg({
    bgGradStart: '#0B274D',
    bgGradEnd: '#1769E8',
    accentColor: '#FF8A2A',
    badgeText: 'ACADEMY',
    shirtColor: '#1769E8',
    collarColor: '#104BA8',
    accessoryType: 'student',
    backdropLabel: 'PLASTICO • TRAINING LAB',
  }),
};

for (const [filePath, svg] of Object.entries(roleCards)) {
  fs.writeFileSync(filePath, svg, 'utf8');
}

// ============================================================================
// 3. 4 REALISTIC VIRTUAL EXHIBITION & FACTORY SHOWROOM SCENES (PHASE 5)
// ============================================================================

const makeShowroomSvg = ({ title, subtitle, accent, machineLabel, metrics }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
  <defs>
    <linearGradient id="hallBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071A33"/>
      <stop offset="55%" stop-color="#0E2B56"/>
      <stop offset="100%" stop-color="#071A33"/>
    </linearGradient>
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#102A52"/>
      <stop offset="100%" stop-color="#051226"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#hallBg)"/>
  <!-- Architectural Ceiling Trusses & Spotlights -->
  <line x1="0" y1="52" x2="800" y2="52" stroke="#1E3A5F" stroke-width="4"/>
  <line x1="0" y1="78" x2="800" y2="78" stroke="${accent}" stroke-width="2" stroke-opacity="0.7"/>
  <circle cx="160" cy="52" r="8" fill="#27BED6"/>
  <circle cx="400" cy="52" r="8" fill="#FF8A2A"/>
  <circle cx="640" cy="52" r="8" fill="#27BED6"/>

  <!-- Showroom Floor -->
  <polygon points="0,330 800,330 800,450 0,450" fill="url(#floorGrad)"/>
  <line x1="0" y1="330" x2="800" y2="330" stroke="${accent}" stroke-width="2.5"/>

  <!-- Main Industrial Pavilion Arch -->
  <rect x="64" y="96" width="672" height="234" rx="14" fill="#0B2244" stroke="#1769E8" stroke-width="2"/>
  <rect x="64" y="96" width="672" height="48" rx="12" fill="#071A33" stroke="${accent}" stroke-width="1.5"/>
  <text x="400" y="126" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold">${title}</text>

  <!-- Left Machinery Display Bay -->
  <rect x="96" y="168" width="280" height="142" rx="10" fill="#071A33" stroke="#27BED6" stroke-width="1.5"/>
  <rect x="118" y="204" width="140" height="76" rx="6" fill="#1769E8"/>
  <rect x="258" y="218" width="90" height="62" rx="6" fill="#94A3B8"/>
  <circle cx="148" cy="238" r="12" fill="#FF8A2A"/>
  <text x="236" y="192" text-anchor="middle" fill="#27BED6" font-family="monospace" font-size="11" font-weight="bold">${machineLabel}</text>

  <!-- Right Technical Specification & Product Showcase Wall -->
  <rect x="408" y="168" width="296" height="142" rx="10" fill="#071A33" stroke="#1E3A5F" stroke-width="1.5"/>
  <text x="556" y="200" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold">${subtitle}</text>
  <rect x="436" y="220" width="240" height="32" rx="6" fill="#0E2B56" stroke="${accent}"/>
  <text x="556" y="241" text-anchor="middle" fill="${accent}" font-family="monospace" font-size="11" font-weight="bold">${metrics}</text>
  <rect x="436" y="264" width="72" height="28" rx="5" fill="#1769E8"/>
  <rect x="520" y="264" width="72" height="28" rx="5" fill="#27BED6"/>
  <rect x="604" y="264" width="72" height="28" rx="5" fill="#FF8A2A"/>
</svg>`;

const showrooms = {
  'public/assets/plastico/exhibitions/booth-machinery-showroom.svg': makeShowroomSvg({
    title: 'PLASTICO INDUSTRIAL MACHINERY PAVILION',
    subtitle: 'Operating Injection, Blow Molding &amp; Extrusion Lines',
    accent: '#FF8A2A',
    machineLabel: 'SERVO INJECTION 450T • LIVE DEMO',
    metrics: 'TEMP: 210°C • CLAMP: 450T • CYCLE: 14.2s',
  }),
  'public/assets/plastico/exhibitions/booth-polymers-masterbatch.svg': makeShowroomSvg({
    title: 'POLYMERS, COMPOUNDS &amp; MASTERBATCH HALL',
    subtitle: 'Virgin PP, HDPE, LDPE, PET &amp; Color Masterbatch Silos',
    accent: '#27BED6',
    machineLabel: 'GRADE: PP/HDPE • MFI LAB TESTED',
    metrics: 'BATCH: RM-1024 • 25KG SACKS &amp; BULK SILOS',
  }),
  'public/assets/plastico/exhibitions/booth-molds-tooling.svg': makeShowroomSvg({
    title: 'PRECISION CNC MOLDS &amp; HOT-RUNNER TOOLING',
    subtitle: 'Multi-Cavity Preform, Cap &amp; Thin-Wall Packaging Molds',
    accent: '#1769E8',
    machineLabel: 'H13 / S136 HARDENED STEEL MOLDS',
    metrics: '32-CAVITY HOT RUNNER • 0.005mm TOLERANCE',
  }),
  'public/assets/plastico/exhibitions/booth-packaging-factory.svg': makeShowroomSvg({
    title: 'PACKAGING, THERMOFORMING &amp; BLOWN FILM PLANT',
    subtitle: 'High-Speed Food &amp; Medical Packaging Production Lines',
    accent: '#FF8A2A',
    machineLabel: 'THERMOFORM-3000 &amp; FILM TOWER',
    metrics: 'OUTPUT: 42 m/min • ISO 9001 QC CERTIFIED',
  }),
};

for (const [filePath, svg] of Object.entries(showrooms)) {
  fs.writeFileSync(filePath, svg, 'utf8');
}

console.log('Generated all 19 PLASTICO visual assets successfully.');
