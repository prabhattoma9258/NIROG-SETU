// Running woman animation only (transparent background, zoomed on the runner).
// Place it on the right side of the hero card, the card's own gradient shows behind it.
export const HERO_HTML = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  svg { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<svg height="100%" width="100%" viewBox="238 24 116 136" preserveAspectRatio="xMaxYMid meet" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="softTrackGrad" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"></stop>
<stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.6"></stop>
<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1"></stop>
</linearGradient>
<radialGradient cx="50%" cy="50%" id="softGlowRadial" r="50%">
<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"></stop>
<stop offset="50%" stop-color="#FCE7F3" stop-opacity="0.45"></stop>
<stop offset="100%" stop-color="#F472B6" stop-opacity="0"></stop>
</radialGradient>
<filter height="140%" id="gentleGlow" width="140%" x="-20%" y="-20%">
<feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
<feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
</filter>
</defs>
<style>
    @keyframes runnerBounce {
      0% { transform: translateY(0px) rotate(-1deg); }
      25% { transform: translateY(-6px) rotate(1deg); }
      50% { transform: translateY(0px) rotate(-1deg); }
      75% { transform: translateY(-5px) rotate(2deg); }
      100% { transform: translateY(0px) rotate(-1deg); }
    }
    @keyframes ponytailFlow {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(-18deg) translateY(-2px); }
      100% { transform: rotate(0deg); }
    }
    @keyframes legStrideLeft {
      0% { transform: rotate(26deg); }
      25% { transform: rotate(-30deg); }
      50% { transform: rotate(-14deg); }
      75% { transform: rotate(32deg); }
      100% { transform: rotate(26deg); }
    }
    @keyframes calfStrideLeft {
      0% { transform: rotate(-8deg); }
      25% { transform: rotate(40deg); }
      50% { transform: rotate(-20deg); }
      75% { transform: rotate(-8deg); }
      100% { transform: rotate(-8deg); }
    }
    @keyframes legStrideRight {
      0% { transform: rotate(-28deg); }
      25% { transform: rotate(24deg); }
      50% { transform: rotate(30deg); }
      75% { transform: rotate(-32deg); }
      100% { transform: rotate(-28deg); }
    }
    @keyframes calfStrideRight {
      0% { transform: rotate(38deg); }
      25% { transform: rotate(-12deg); }
      50% { transform: rotate(-5deg); }
      75% { transform: rotate(45deg); }
      100% { transform: rotate(38deg); }
    }
    @keyframes armSwingL {
      0% { transform: rotate(-32deg); }
      50% { transform: rotate(35deg); }
      100% { transform: rotate(-32deg); }
    }
    @keyframes armSwingR {
      0% { transform: rotate(32deg); }
      50% { transform: rotate(-35deg); }
      100% { transform: rotate(32deg); }
    }
    @keyframes windStream {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -72; }
    }
    @keyframes petalDance1 {
      0% { transform: translate(350px, 120px) rotate(0deg) scale(0.7); opacity: 0; }
      20% { opacity: 0.9; }
      80% { opacity: 0.8; }
      100% { transform: translate(250px, 40px) rotate(180deg) scale(1.1); opacity: 0; }
    }
    @keyframes petalDance2 {
      0% { transform: translate(352px, 70px) rotate(0deg) scale(0.6); opacity: 0; }
      25% { opacity: 0.85; }
      85% { opacity: 0.7; }
      100% { transform: translate(255px, 135px) rotate(-150deg) scale(1.0); opacity: 0; }
    }
    @keyframes gentlePulseAura {
      0% { transform: scale(0.92); opacity: 0.5; }
      50% { transform: scale(1.06); opacity: 0.85; }
      100% { transform: scale(0.92); opacity: 0.5; }
    }

    .soft-runner { animation: runnerBounce 0.75s ease-in-out infinite; transform-origin: 290px 105px; }
    .soft-ponytail { animation: ponytailFlow 0.75s ease-in-out infinite; transform-origin: 284px 44px; }
    .soft-left-thigh { animation: legStrideLeft 0.75s ease-in-out infinite; transform-origin: 290px 100px; }
    .soft-left-calf { animation: calfStrideLeft 0.75s ease-in-out infinite; transform-origin: 292px 122px; }
    .soft-right-thigh { animation: legStrideRight 0.75s ease-in-out infinite; transform-origin: 295px 100px; }
    .soft-right-calf { animation: calfStrideRight 0.75s ease-in-out infinite; transform-origin: 296px 122px; }
    .soft-arm-l { animation: armSwingL 0.75s ease-in-out infinite; transform-origin: 292px 68px; }
    .soft-arm-r { animation: armSwingR 0.75s ease-in-out infinite; transform-origin: 296px 68px; }
    .wind-dash { stroke-dasharray: 10 8; animation: windStream 1.2s linear infinite; }
    .petal-sakura-1 { animation: petalDance1 3s linear infinite; }
    .petal-sakura-2 { animation: petalDance2 3.5s linear infinite 1s; }
    .soft-aura { transform-origin: 295px 92px; animation: gentlePulseAura 2.2s ease-in-out infinite; }
</style>

<circle class="soft-aura" cx="295" cy="92" fill="url(#softGlowRadial)" r="54"></circle>
<path d="M 238 156 C 270 154, 310 157, 354 154" fill="none" stroke="url(#softTrackGrad)" stroke-linecap="round" stroke-width="3.5"></path>

<line class="wind-dash" stroke="#FFFFFF" stroke-linecap="round" stroke-opacity="0.6" stroke-width="2" x1="244" x2="274" y1="75" y2="75"></line>
<line class="wind-dash" stroke="#FFFFFF" stroke-linecap="round" stroke-opacity="0.5" stroke-width="1.8" x1="242" x2="270" y1="92" y2="92"></line>
<line class="wind-dash" stroke="#FFFFFF" stroke-linecap="round" stroke-opacity="0.65" stroke-width="2" x1="246" x2="272" y1="110" y2="110"></line>
<line class="wind-dash" stroke="#FFFFFF" stroke-linecap="round" stroke-opacity="0.45" stroke-width="1.5" x1="244" x2="268" y1="130" y2="130"></line>

<g class="petal-sakura-1">
<path d="M 0 0 C 4 -6, 12 -4, 14 2 C 12 8, 4 8, 0 0 Z" fill="#FFFFFF" fill-opacity="0.9" filter="url(#gentleGlow)"></path>
</g>
<g class="petal-sakura-2">
<path d="M 0 0 C -5 -5, -12 -3, -13 3 C -10 9, -2 8, 0 0 Z" fill="#FDF2F8" fill-opacity="0.85"></path>
</g>

<g class="soft-runner" id="animated-runner">
<g class="soft-arm-r">
<path d="M 296 68 Q 312 74 322 66" fill="none" stroke="#FCE7F3" stroke-linecap="round" stroke-width="5"></path>
<circle cx="323" cy="65" fill="#FCE7F3" r="3.5"></circle>
</g>
<g class="soft-left-thigh">
<path d="M 290 100 L 278 122" stroke="#DB2777" stroke-linecap="round" stroke-width="7"></path>
<g class="soft-left-calf">
<path d="M 278 122 L 268 145" stroke="#FCE7F3" stroke-linecap="round" stroke-width="5.5"></path>
<path d="M 268 145 L 260 148 L 272 150 Z" fill="#FFFFFF" filter="url(#gentleGlow)"></path>
</g>
</g>
<path d="M 288 64 C 293 63, 302 65, 304 74 L 298 94 C 294 96, 287 95, 285 91 Z" fill="#FFFFFF" filter="url(#gentleGlow)"></path>
<path d="M 286 91 L 297 94 L 295 100 L 286 99 Z" fill="#FCE7F3"></path>
<path d="M 285 98 C 290 97, 298 97, 301 100 L 298 107 L 284 105 Z" fill="#0D9488"></path>
<g class="soft-right-thigh">
<path d="M 295 100 L 312 118" stroke="#14B8A6" stroke-linecap="round" stroke-width="7"></path>
<g class="soft-right-calf">
<path d="M 312 118 L 328 138" stroke="#FCE7F3" stroke-linecap="round" stroke-width="5.5"></path>
<path d="M 328 138 L 338 143 L 332 147 L 324 141 Z" fill="#FFFFFF" filter="url(#gentleGlow)"></path>
</g>
</g>
<path d="M 293 63 L 295 56" stroke="#FCE7F3" stroke-linecap="round" stroke-width="4.5"></path>
<circle cx="297" cy="48" fill="#FCE7F3" r="10"></circle>
<path d="M 289 48 C 289 40, 298 39, 305 44 C 304 49, 299 55, 292 53 Z" fill="#3B0764"></path>
<g class="soft-ponytail">
<path d="M 288 44 C 275 40, 260 48, 252 56 C 262 58, 276 53, 286 48 Z" fill="#3B0764" filter="url(#gentleGlow)"></path>
<circle cx="288" cy="45" fill="#F472B6" r="2.8"></circle>
</g>
<g class="soft-arm-l">
<path d="M 292 68 Q 280 82 272 80" fill="none" stroke="#FCE7F3" stroke-linecap="round" stroke-width="5"></path>
<path d="M 272 80 L 264 68" stroke="#FCE7F3" stroke-linecap="round" stroke-width="4.5"></path>
<circle cx="264" cy="68" fill="#FCE7F3" r="3.2"></circle>
<rect fill="#FF6B4A" height="5" rx="1.5" width="3.5" x="268" y="73"></rect>
</g>
</g>
</svg>
</body>
</html>`;