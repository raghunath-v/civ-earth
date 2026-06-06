/**
 * Generates public/og-image.svg (the OG share image).
 * 1200×630px social card with: globe, wordmark, tagline, yield pills.
 *
 * SVG renders in browsers; for actual PNG upload to social previews
 * you can convert with: npx sharp-cli --input public/og-image.svg --output public/og-image.png
 * or any SVG→PNG tool. The og:image tag already points to /og-image.png — rename as needed.
 *
 * Run: npm run generate:og
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.svg');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1b2a"/>
      <stop offset="100%" style="stop-color:#1f4d6b"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.96"/>
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:0.96"/>
    </linearGradient>
  </defs>

  <!-- Ocean background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid dots -->
  <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
    <circle cx="20" cy="20" r="1" fill="white" opacity="0.06"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Left: wordmark area -->
  <text x="80" y="200" font-family="-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif"
        font-size="86" font-weight="700" fill="white" letter-spacing="-3">Civ</text>
  <text x="80" y="295" font-family="-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif"
        font-size="86" font-weight="700" fill="#d4a017" letter-spacing="-3">Earth</text>
  <text x="84" y="350" font-family="-apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,sans-serif"
        font-size="22" font-weight="400" fill="rgba(255,255,255,0.65)">The world as yields &amp; wonders</text>

  <!-- Yield pills row -->
  <g transform="translate(80, 400)">
    ${[
      ['🪙','Gold','#d4a017'],
      ['🧪','Science','#3aa6d0'],
      ['🎭','Culture','#a86bd1'],
      ['⚙️','Production','#b97a3a'],
      ['🌾','Food','#7cb342'],
      ['😊','Amenities','#e8b34d'],
      ['⚔️','Military','#c8423c'],
    ].map(([icon, label, color], i) => {
      const x = i * 144;
      return `
    <g transform="translate(${x},0)">
      <rect width="134" height="44" rx="12" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
      <text x="14" y="27" font-size="18">${icon}</text>
      <text x="38" y="28" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
            font-size="13" font-weight="600" fill="${color}">${label}</text>
    </g>`;
    }).join('')}
  </g>

  <!-- Right: sample stat card -->
  <rect x="640" y="60" width="490" height="510" rx="20" fill="url(#card)" opacity="0.97"/>

  <!-- Card header -->
  <text x="672" y="120" font-size="36">🇺🇸</text>
  <text x="720" y="115" font-family="-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif"
        font-size="26" font-weight="700" fill="#0f172a">United States</text>
  <text x="720" y="140" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="13" font-weight="400" fill="#64748b">Washington, D.C. · Americas</text>
  <rect x="720" y="152" width="110" height="22" rx="11" fill="#fff7dc" stroke="#d4a017" stroke-width="0.8" stroke-opacity="0.5"/>
  <text x="775" y="167" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="11" font-weight="600" fill="#0f172a">Atomic era</text>

  <!-- Civ Score -->
  <rect x="660" y="195" width="440" height="72" rx="14" fill="#fff7dc" stroke="#d4a017" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="692" y="222" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="11" font-weight="600" letter-spacing="0.06em" fill="#b88820" text-transform="uppercase">CIV SCORE</text>
  <text x="692" y="256" font-family="-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,sans-serif"
        font-size="44" font-weight="700" fill="#0f172a">997</text>
  <text x="755" y="256" font-family="Inter,sans-serif" font-size="16" font-weight="400" fill="#94a3b8">/1000</text>
  <text x="980" y="235" text-anchor="end" font-family="Inter,sans-serif" font-size="11" fill="#94a3b8">Composite of 8 yields,</text>
  <text x="980" y="252" text-anchor="end" font-family="Inter,sans-serif" font-size="11" fill="#94a3b8">z-score weighted</text>

  <!-- Mini yield grid -->
  ${[
    ['🪙','Gold','$28.8T','#d4a017',0,0],
    ['🧪','Science','3.45% R&D','#3aa6d0',220,0],
    ['🎭','Culture','25 WHS','#a86bd1',0,90],
    ['⚙️','Production','$2.50T mfg','#b97a3a',220,90],
    ['🌾','Food','174 Mt','#7cb342',0,180],
    ['😊','Amenities','6.73/10','#e8b34d',220,180],
  ].map(([icon, label, val, color, dx, dy]) => `
    <g transform="translate(${660 + Number(dx)},${285 + Number(dy)})">
      <rect width="206" height="76" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
      <text x="12" y="26" font-size="15">${icon}</text>
      <text x="32" y="27" font-family="Inter,sans-serif" font-size="10" font-weight="600"
            letter-spacing="0.05em" fill="${color}">${String(label).toUpperCase()}</text>
      <text x="12" y="52" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
            font-size="18" font-weight="600" fill="#0f172a">${val}</text>
    </g>
  `).join('')}

  <!-- Bottom tagline -->
  <text x="600" y="600" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="15" fill="rgba(255,255,255,0.45)">174 countries · real-world data · every figure cited · civ-world.app</text>
</svg>`;

writeFileSync(OUT, svg);
console.log(`Written: ${OUT}`);
console.log('To convert to PNG: npx sharp-cli --input public/og-image.svg --output public/og-image.png');
