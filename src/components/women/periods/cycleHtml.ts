export const CYCLE_HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  svg { display: block; width: 100%; height: 100%; }

  /* Sab animate hone wale hisse card ke beech (200,105) ke around ghoomte hain */
  .anim { transform-box: view-box; transform-origin: 200px 105px; }

  @keyframes floatDrop {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-8px) scale(1.05); }
  }
  @keyframes orbitRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes waveFlow {
    0%, 100% { transform: translateX(0); }
    50%      { transform: translateX(-30px); }
  }
  @keyframes ripple {
    0%   { transform: scale(1);    opacity: 0.8; }
    100% { transform: scale(1.85); opacity: 0; }
  }
  @keyframes glowPulse {
    0%, 100% { transform: scale(1);    opacity: 0.9; }
    50%      { transform: scale(1.14); opacity: 1; }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.15; }
    50%      { opacity: 0.95; }
  }

  .main-drop { animation: floatDrop 3s ease-in-out infinite; }
  .orbit     { animation: orbitRotate 14s linear infinite; }
  .glow      { animation: glowPulse 3s ease-in-out infinite; }
  .ring      { animation: ripple 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite; }
  .ring2     { animation-delay: 1.2s; animation-fill-mode: backwards; }
  .wave      { animation: waveFlow 4s ease-in-out infinite; }
  .wave2     { animation-duration: 5s; animation-delay: -1.5s; }
  .spark     { animation: twinkle 2.6s ease-in-out infinite; }
  .spark2    { animation-delay: 0.9s; }
  .spark3    { animation-delay: 1.7s; }

  /* Jinhone phone mein "Reduce Motion" on kiya hai unke liye animation ruki rahe */
  @media (prefers-reduced-motion: reduce) {
    .anim, .wave, .spark { animation: none !important; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bgGrad" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF1F2"/>
      <stop offset="50%" stop-color="#FCE7F3"/>
      <stop offset="100%" stop-color="#E0F2FE"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" x2="100%" y1="0%" y2="0%">
      <stop offset="0%" stop-color="#F43F5E" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#EC4899" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F43F5E" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="#EC4899" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#EC4899" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="240" fill="url(#bgGrad)"/>

  <!-- Behti hui lehrein -->
  <path class="wave" d="M-20 180 Q60 140 160 175 T360 165 T440 185 L440 240 L-20 240 Z" fill="#38BDF8" fill-opacity="0.18"/>
  <path class="wave wave2" d="M-10 195 Q80 165 190 190 T380 180 T430 200 L430 240 L-10 240 Z" fill="#F43F5E" fill-opacity="0.15"/>

  <!-- Halka glow (filter ke bina, phone pe halka chalta hai) -->
  <circle class="anim glow" cx="200" cy="110" r="62" fill="url(#glowGrad)"/>

  <!-- Failte hue ripple -->
  <circle class="anim ring" cx="200" cy="105" r="35" fill="none" stroke="#FDA4AF" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
  <circle class="anim ring ring2" cx="200" cy="105" r="35" fill="none" stroke="#BAE6FD" stroke-width="2" vector-effect="non-scaling-stroke"/>

  <!-- Ghoomte hue dots -->
  <g class="anim orbit">
    <circle cx="200" cy="45"  r="5"   fill="#38BDF8"/>
    <circle cx="260" cy="105" r="4"   fill="#F43F5E"/>
    <circle cx="200" cy="165" r="4.5" fill="#EC4899"/>
    <circle cx="140" cy="105" r="3.5" fill="#0284C7"/>
  </g>

  <!-- Beech ki boond -->
  <g class="anim main-drop">
    <path d="M200 65 C200 65 168 112 168 126 A32 32 0 0 0 232 126 C232 112 200 65 200 65 Z" fill="url(#waveGrad)"/>
    <ellipse cx="188" cy="115" rx="5" ry="9" fill="#FFFFFF" fill-opacity="0.75" transform="rotate(-25 188 115)"/>
    <circle cx="208" cy="132" r="3.5" fill="#FFFFFF" fill-opacity="0.6"/>
    <path d="M197 114 H203 V126 H197 Z M191 118 H209 V122 H191 Z" fill="#FFFFFF" fill-opacity="0.95"/>
  </g>

  <!-- Chhote chamakte sitare -->
  <circle class="spark"        cx="120" cy="70"  r="2.5" fill="#FFFFFF"/>
  <circle class="spark spark2" cx="292" cy="82"  r="2"   fill="#FFFFFF"/>
  <circle class="spark spark3" cx="272" cy="150" r="2.2" fill="#FFFFFF"/>
</svg>
</body>
</html>`;