import React from 'react';
import { Language } from '../types';

export type TwinHotspotId = 'skeletal' | 'dna' | 'exposure';

interface HotspotNode {
  id: TwinHotspotId;
  x: number;
  y: number;
  label: string;
  label_ar: string;
}

interface HologramAstronautProps {
  lang: Language;
  activeHotspot: TwinHotspotId;
  onSelectHotspot: (id: TwinHotspotId) => void;
}

const NAVY = '#0D223A';
const NAVY_DEEP = '#081726';
const TEAL = '#2D7D82';
const TEAL_LIGHT = '#8CC0C2';

/** Radar instrument geometry (viewBox units). */
const CENTER_X = 200;
const CENTER_Y = 300;
const RADAR_R = 176;
const RING_RADII = [62, 98, 134, RADAR_R];

/** Vertical DNA double helix geometry. */
const HELIX_CX = 200;
const HELIX_TOP = 152;
const HELIX_BOTTOM = 448;
const HELIX_AMP = 42;
const HELIX_TURNS = 4;
const HELIX_SAMPLES = 220;
const RUNG_COUNT = 28;

export const HOTSPOT_NODES: HotspotNode[] = [
  {
    id: 'exposure',
    x: CENTER_X,
    y: CENTER_Y - RADAR_R,
    label: 'Mission Radiation & Microgravity Exposure',
    label_ar: 'التعرض للإشعاع وانعدام الجاذبية',
  },
  {
    id: 'dna',
    x: CENTER_X,
    y: CENTER_Y,
    label: 'Cellular DNA & Oxidative Repair',
    label_ar: 'الحمض النووي والإصلاح التأكسدي',
  },
  {
    id: 'skeletal',
    x: CENTER_X,
    y: CENTER_Y + RADAR_R,
    label: 'Skeletal System / Bone Density',
    label_ar: 'الجهاز العظمي / كثافة العظم',
  },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

interface HelixPoint {
  x: number;
  y: number;
  depth: number;
}

const helixPoint = (t: number, strand: 0 | 1): HelixPoint => {
  const y = HELIX_TOP + t * (HELIX_BOTTOM - HELIX_TOP);
  const phi = t * HELIX_TURNS * Math.PI * 2 - Math.PI / 2;
  const sinP = Math.sin(phi);
  const cosP = Math.cos(phi);
  return {
    x: HELIX_CX + (strand === 0 ? 1 : -1) * HELIX_AMP * sinP,
    y,
    depth: strand === 0 ? cosP : -cosP,
  };
};

/** Splits a backbone into front-facing (bright) and back-facing (dim) runs. */
const buildStrand = (strand: 0 | 1) => {
  const front: string[] = [];
  const back: string[] = [];
  let run: string[] = [];
  let runIsFront: boolean | null = null;

  for (let i = 0; i <= HELIX_SAMPLES; i++) {
    const point = helixPoint(i / HELIX_SAMPLES, strand);
    const isFront = point.depth >= 0;
    if (runIsFront === null || isFront !== runIsFront) {
      if (run.length > 1) (runIsFront ? front : back).push(run.join(' '));
      run = [];
      runIsFront = isFront;
    }
    run.push(`${point.x.toFixed(2)},${point.y.toFixed(2)}`);
  }
  if (run.length > 1) (runIsFront ? front : back).push(run.join(' '));

  return { front, back };
};

const STRAND_A = buildStrand(0);
const STRAND_B = buildStrand(1);

interface Rung {
  x1: number;
  x2: number;
  y: number;
  opacity: number;
}

const RUNGS: Rung[] = (() => {
  const rungs: Rung[] = [];
  for (let i = 0; i < RUNG_COUNT; i++) {
    const t = (i + 0.5) / RUNG_COUNT;
    const a = helixPoint(t, 0);
    const b = helixPoint(t, 1);
    const separation = Math.abs(b.x - a.x);
    if (separation < 5) continue;
    rungs.push({
      x1: a.x,
      x2: b.x,
      y: a.y,
      opacity: 0.2 + 0.5 * Math.min(1, separation / (2 * HELIX_AMP)),
    });
  }
  return rungs;
})();

/** Precision degree ticks around the outer radar ring. */
const TICKS: Array<{ x1: number; y1: number; x2: number; y2: number; major: boolean }> = (() => {
  const ticks: Array<{ x1: number; y1: number; x2: number; y2: number; major: boolean }> = [];
  for (let deg = 0; deg < 360; deg += 5) {
    const major = deg % 30 === 0;
    const outer = RADAR_R;
    const inner = RADAR_R - (major ? 11 : 5);
    const rad = toRad(deg);
    ticks.push({
      x1: CENTER_X + outer * Math.sin(rad),
      y1: CENTER_Y - outer * Math.cos(rad),
      x2: CENTER_X + inner * Math.sin(rad),
      y2: CENTER_Y - inner * Math.cos(rad),
      major,
    });
  }
  return ticks;
})();

/** Degree numerals, skipping the vertical axis where the nodes sit. */
const DEGREE_LABELS: Array<{ x: number; y: number; label: string }> = (() => {
  const labels: Array<{ x: number; y: number; label: string }> = [];
  for (let deg = 0; deg < 360; deg += 30) {
    if (deg === 90 || deg === 270) continue;
    const rad = toRad(deg);
    labels.push({
      x: CENTER_X + 192 * Math.sin(rad),
      y: CENTER_Y - 192 * Math.cos(rad),
      label: `${deg}`,
    });
  }
  return labels;
})();

/** Deterministic molecular sample points scattered across the scan disc. */
const MOLECULE_SAMPLES: Array<{ x: number; y: number; r: number; opacity: number }> = (() => {
  const points: Array<{ x: number; y: number; r: number; opacity: number }> = [];
  let seed = 20260113;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 30; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand()) * (RADAR_R - 22);
    points.push({
      x: CENTER_X + radius * Math.cos(angle),
      y: CENTER_Y + radius * Math.sin(angle),
      r: 0.8 + rand() * 1.5,
      opacity: 0.18 + rand() * 0.4,
    });
  }
  return points;
})();

export const HologramAstronaut: React.FC<HologramAstronautProps> = ({
  lang,
  activeHotspot,
  onSelectHotspot,
}) => {
  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 400 560"
        className="w-full h-auto select-none"
        shapeRendering="geometricPrecision"
        role="img"
        aria-label={
          lang === 'ar'
            ? 'رادار حيوي جزيئي هولوغرافي مع حلزون DNA مزدوج ونقاط-hotspot تفاعلية مرتبطة ببيانات ناسا OSDR'
            : 'Biometric molecular radar hologram with a DNA double helix and interactive hotspots bound to NASA OSDR data'
        }
      >
        <defs>
          <radialGradient id="twin-bg" cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor="#174A55" stopOpacity="0.55" />
            <stop offset="52%" stopColor={NAVY} stopOpacity="0.9" />
            <stop offset="100%" stopColor={NAVY_DEEP} stopOpacity="1" />
          </radialGradient>
          <linearGradient id="twin-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={TEAL_LIGHT} stopOpacity="0" />
            <stop offset="50%" stopColor={TEAL_LIGHT} stopOpacity="0.9" />
            <stop offset="100%" stopColor={TEAL_LIGHT} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="twin-sweep-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TEAL_LIGHT} stopOpacity="0" />
            <stop offset="55%" stopColor={TEAL_LIGHT} stopOpacity="0.12" />
            <stop offset="100%" stopColor={TEAL_LIGHT} stopOpacity="0.42" />
          </radialGradient>
          <radialGradient id="twin-disc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.22" />
            <stop offset="70%" stopColor={TEAL} stopOpacity="0.07" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="twin-helix" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={TEAL_LIGHT} stopOpacity="0.95" />
            <stop offset="50%" stopColor={TEAL} stopOpacity="1" />
            <stop offset="100%" stopColor={TEAL_LIGHT} stopOpacity="0.95" />
          </linearGradient>
          <filter id="twin-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="twin-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="twin-frame">
            <rect x="0" y="0" width="400" height="560" rx="18" />
          </clipPath>
        </defs>

        <g clipPath="url(#twin-frame)">
          {/* Dark navy scan chamber */}
          <rect x="0" y="0" width="400" height="560" fill={NAVY} />
          <rect x="0" y="0" width="400" height="560" fill="url(#twin-bg)" />

          {/* Instrument face */}
          <circle cx={CENTER_X} cy={CENTER_Y} r={RADAR_R} fill="url(#twin-disc)" />

          {/* Subtle orbital grid lines */}
          <g opacity="0.75">
            {[38, 74, 112].map((ry) => (
              <ellipse
                key={`orbit-${ry}`}
                cx={CENTER_X}
                cy={CENTER_Y}
                rx={RADAR_R}
                ry={ry}
                fill="none"
                stroke={TEAL}
                strokeWidth="0.7"
                opacity={0.3}
              />
            ))}
            {[0, 45, 90, 135].map((deg) => {
              const rad = toRad(deg);
              return (
                <line
                  key={`grid-${deg}`}
                  x1={CENTER_X - RADAR_R * Math.sin(rad)}
                  y1={CENTER_Y + RADAR_R * Math.cos(rad)}
                  x2={CENTER_X + RADAR_R * Math.sin(rad)}
                  y2={CENTER_Y - RADAR_R * Math.cos(rad)}
                  stroke={TEAL}
                  strokeWidth="0.6"
                  opacity="0.16"
                />
              );
            })}
            {[CENTER_Y - 150, CENTER_Y - 75, CENTER_Y + 75, CENTER_Y + 150].map((y) => (
              <line
                key={`hline-${y}`}
                x1={CENTER_X - RADAR_R}
                y1={y}
                x2={CENTER_X + RADAR_R}
                y2={y}
                stroke={TEAL}
                strokeWidth="0.6"
                opacity="0.14"
              />
            ))}
          </g>

          {/* Molecular sample points */}
          {MOLECULE_SAMPLES.map((sample, index) => (
            <circle
              key={`mol-${index}`}
              cx={sample.x}
              cy={sample.y}
              r={sample.r}
              fill={TEAL_LIGHT}
              opacity={sample.opacity}
            />
          ))}

          {/* Concentric radar rings */}
          {RING_RADII.map((radius, index) => (
            <circle
              key={`ring-${radius}`}
              cx={CENTER_X}
              cy={CENTER_Y}
              r={radius}
              fill="none"
              stroke={TEAL}
              strokeWidth={index === RING_RADII.length - 1 ? 1.6 : 1.1}
              opacity={index === RING_RADII.length - 1 ? 0.95 : 0.6}
              filter="url(#twin-soft-glow)"
            />
          ))}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={RADAR_R - 16}
            fill="none"
            stroke={TEAL_LIGHT}
            strokeWidth="0.7"
            opacity="0.45"
            strokeDasharray="2 7"
          />

          {/* Precision degree ticks */}
          <g>
            {TICKS.map((tick, index) => (
              <line
                key={`tick-${index}`}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.major ? TEAL_LIGHT : TEAL}
                strokeWidth={tick.major ? 1.3 : 0.7}
                opacity={tick.major ? 0.8 : 0.42}
              />
            ))}
          </g>

          {/* Degree numerals */}
          <g fill={TEAL_LIGHT} opacity="0.55" fontSize="7" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
            {DEGREE_LABELS.map((item) => (
              <text key={item.label} x={item.x} y={item.y}>
                {item.label}
              </text>
            ))}
          </g>

          {/* Radar sweep wedge */}
          <g className="animate-spin-slow twin-spin-center">
            <path
              d={`M ${CENTER_X} ${CENTER_Y} L ${CENTER_X + RADAR_R} ${CENTER_Y} A ${RADAR_R} ${RADAR_R} 0 0 0 ${CENTER_X + RADAR_R * Math.cos(toRad(-28))} ${
                CENTER_Y + RADAR_R * Math.sin(toRad(-28))
              } Z`}
              fill="url(#twin-sweep-radial)"
              opacity="0.85"
            />
            <line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={CENTER_X + RADAR_R}
              y2={CENTER_Y}
              stroke={TEAL_LIGHT}
              strokeWidth="1.2"
              opacity="0.75"
              filter="url(#twin-soft-glow)"
            />
          </g>

          {/* Radar core */}
          <circle cx={CENTER_X} cy={CENTER_Y} r="26" fill="none" stroke={TEAL} strokeWidth="0.8" opacity="0.4" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="9" fill={NAVY_DEEP} stroke={TEAL} strokeWidth="1.2" opacity="0.9" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="3" fill={TEAL_LIGHT} filter="url(#twin-soft-glow)" />

          {/* Vertical 3D-style DNA double helix */}
          <g>
            {/* Back-facing backbone runs */}
            {STRAND_A.back.map((points, index) => (
              <polyline
                key={`a-back-${index}`}
                points={points}
                fill="none"
                stroke={TEAL}
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.35"
              />
            ))}
            {STRAND_B.back.map((points, index) => (
              <polyline
                key={`b-back-${index}`}
                points={points}
                fill="none"
                stroke={TEAL}
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.35"
              />
            ))}

            {/* Base-pair rungs */}
            {RUNGS.map((rung, index) => (
              <g key={`rung-${index}`}>
                <line
                  x1={rung.x1}
                  y1={rung.y}
                  x2={rung.x2}
                  y2={rung.y}
                  stroke={TEAL_LIGHT}
                  strokeWidth="1.1"
                  opacity={rung.opacity}
                  strokeLinecap="round"
                />
                <circle cx={rung.x1} cy={rung.y} r="1.7" fill={TEAL_LIGHT} opacity={rung.opacity} />
                <circle cx={rung.x2} cy={rung.y} r="1.7" fill={TEAL_LIGHT} opacity={rung.opacity} />
              </g>
            ))}

            {/* Front-facing backbone runs */}
            {STRAND_A.front.map((points, index) => (
              <g key={`a-front-${index}`}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={TEAL_LIGHT}
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.16"
                  filter="url(#twin-glow)"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="url(#twin-helix)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  filter="url(#twin-soft-glow)"
                />
              </g>
            ))}
            {STRAND_B.front.map((points, index) => (
              <g key={`b-front-${index}`}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={TEAL_LIGHT}
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.16"
                  filter="url(#twin-glow)"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="url(#twin-helix)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  filter="url(#twin-soft-glow)"
                />
              </g>
            ))}
          </g>

          {/* Scanning beam */}
          <rect x="0" y="40" width="400" height="2" fill="url(#twin-beam)" className="twin-scan" />

          {/* Connector traces from each node toward the core */}
          {HOTSPOT_NODES.map((node) => {
            const isActive = activeHotspot === node.id;
            return (
              <g key={`link-${node.id}`} opacity={isActive ? 0.9 : 0.25}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={node.x}
                  y2={
                    node.id === 'exposure'
                      ? CENTER_Y - 62
                      : node.id === 'dna'
                        ? CENTER_Y
                        : CENTER_Y + 62
                  }
                  stroke={TEAL_LIGHT}
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
              </g>
            );
          })}

          {/* Interactive hotspot nodes */}
          {HOTSPOT_NODES.map((node) => {
            const isActive = activeHotspot === node.id;
            const label = lang === 'ar' ? node.label_ar : node.label;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={isActive}
                className="cursor-pointer"
                onClick={() => onSelectHotspot(node.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectHotspot(node.id);
                  }
                }}
              >
                <title>{label}</title>
                {isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="15"
                    fill="none"
                    stroke={TEAL_LIGHT}
                    strokeWidth="1.4"
                    opacity="0.9"
                    className="twin-pulse"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="8.5"
                  fill={isActive ? TEAL : NAVY_DEEP}
                  stroke={TEAL_LIGHT}
                  strokeWidth="1.8"
                  filter="url(#twin-soft-glow)"
                  opacity={isActive ? 1 : 0.85}
                />
                <circle cx={node.x} cy={node.y} r="3.2" fill={isActive ? NAVY_DEEP : TEAL_LIGHT} />
              </g>
            );
          })}
        </g>

        {/* Frame border */}
        <rect
          x="1"
          y="1"
          width="398"
          height="558"
          rx="18"
          fill="none"
          stroke={TEAL}
          strokeWidth="1.4"
          opacity="0.55"
        />
        <rect
          x="10"
          y="10"
          width="380"
          height="540"
          rx="13"
          fill="none"
          stroke={TEAL_LIGHT}
          strokeWidth="0.6"
          opacity="0.22"
        />
      </svg>
    </div>
  );
};
