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

const NAVY = '#0E233C';
const NAVY_DEEP = '#0D223A';
const TEAL = '#2D7D82';
const TEAL_LIGHT = '#8CC0C2';

export const HOTSPOT_NODES: HotspotNode[] = [
  {
    id: 'skeletal',
    x: 170,
    y: 372,
    label: 'Skeletal System / Bone Density',
    label_ar: 'الجهاز العظمي / كثافة العظم',
  },
  {
    id: 'dna',
    x: 200,
    y: 214,
    label: 'Cellular DNA & Oxidative Repair',
    label_ar: 'الحمض النووي والإصلاح التأكسدي',
  },
  {
    id: 'exposure',
    x: 200,
    y: 76,
    label: 'Mission Radiation & Microgravity Exposure',
    label_ar: 'التعرض للإشعاع وانعدام الجاذبية',
  },
];

const Wire = ({
  points,
  opacity = 0.75,
  width = 1.6,
  dash,
}: {
  points: string;
  opacity?: number;
  width?: number;
  dash?: string;
}) => (
  <polyline
    points={points}
    fill="none"
    stroke={TEAL}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    strokeDasharray={dash}
  />
);

const Joint = ({ cx, cy, r = 4 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill={NAVY_DEEP} stroke={TEAL} strokeWidth={1.4} opacity={0.95} />
);

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
        role="img"
        aria-label={
          lang === 'ar'
            ? 'صورة ظلية هولوغرافية لرائد فضاء مع نقاط-hotspot تفاعلية مرتبطة ببيانات ناسا OSDR'
            : 'Holographic astronaut wireframe with interactive hotspots bound to NASA OSDR data'
        }
      >
        <defs>
          <radialGradient id="twin-bg" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#174A55" stopOpacity="0.55" />
            <stop offset="55%" stopColor={NAVY} stopOpacity="0.85" />
            <stop offset="100%" stopColor={NAVY_DEEP} stopOpacity="1" />
          </radialGradient>
          <linearGradient id="twin-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={TEAL_LIGHT} stopOpacity="0.30" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0.08" />
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
          <linearGradient id="twin-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={TEAL_LIGHT} stopOpacity="0" />
            <stop offset="50%" stopColor={TEAL_LIGHT} stopOpacity="0.9" />
            <stop offset="100%" stopColor={TEAL_LIGHT} stopOpacity="0" />
          </linearGradient>
          <clipPath id="twin-frame">
            <rect x="0" y="0" width="400" height="560" rx="18" />
          </clipPath>
        </defs>

        {/* Holographic chamber backdrop */}
        <g clipPath="url(#twin-frame)">
          <rect x="0" y="0" width="400" height="560" fill="url(#twin-bg)" />

          {/* Volumetric grid floor */}
          <g opacity="0.35">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={452 + i * 18}
                x2="400"
                y2={452 + i * 18}
                stroke={TEAL}
                strokeWidth="0.6"
                opacity={0.5 - i * 0.06}
              />
            ))}
            {[40, 100, 160, 220, 280, 340].map((x) => (
              <line
                key={`v-${x}`}
                x1={x}
                y1="452"
                x2={200 + (x - 200) * 0.42}
                y2="560"
                stroke={TEAL}
                strokeWidth="0.6"
                opacity="0.35"
              />
            ))}
          </g>

          {/* Scanning beam */}
          <rect x="0" y="40" width="400" height="2" fill="url(#twin-beam)" className="twin-scan" />

          {/* Rotating containment rings */}
          <g className="animate-spin-slow" style={{ transformOrigin: '200px 520px' }}>
            <ellipse cx="200" cy="520" rx="118" ry="26" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.45" />
            <ellipse cx="200" cy="520" rx="88" ry="17" fill="none" stroke={TEAL_LIGHT} strokeWidth="0.8" opacity="0.35" strokeDasharray="4 6" />
          </g>
          <ellipse cx="200" cy="520" rx="132" ry="30" fill="none" stroke={TEAL} strokeWidth="0.7" opacity="0.28" />
          <ellipse cx="200" cy="520" rx="66" ry="13" fill={TEAL} opacity="0.18" />

          {/* Backpack (behind torso) */}
          <rect x="250" y="158" width="30" height="120" rx="12" fill="url(#twin-body)" stroke={TEAL} strokeWidth="1.4" opacity="0.8" />
          <line x1="258" y1="176" x2="272" y2="176" stroke={TEAL} strokeWidth="1" opacity="0.6" />
          <line x1="258" y1="192" x2="272" y2="192" stroke={TEAL} strokeWidth="1" opacity="0.6" />
          <line x1="258" y1="208" x2="272" y2="208" stroke={TEAL} strokeWidth="1" opacity="0.6" />

          {/* Helmet shell */}
          <ellipse cx="200" cy="80" rx="54" ry="58" fill="url(#twin-body)" stroke={TEAL} strokeWidth="1.8" opacity="0.9" />
          <ellipse cx="200" cy="80" rx="45" ry="49" fill="none" stroke={TEAL_LIGHT} strokeWidth="0.7" opacity="0.45" strokeDasharray="3 5" />
          {/* Visor */}
          <path
            d="M156,66 Q200,44 244,66 Q238,108 200,114 Q162,108 156,66 Z"
            fill={NAVY}
            fillOpacity="0.75"
            stroke={TEAL_LIGHT}
            strokeWidth="1.2"
            opacity="0.92"
          />
          <path d="M168,74 Q196,58 224,68" fill="none" stroke={TEAL_LIGHT} strokeWidth="1" opacity="0.65" />
          {/* Helmet crest + comms */}
          <path d="M200,22 L200,34" stroke={TEAL} strokeWidth="1.4" opacity="0.7" />
          <circle cx="200" cy="20" r="3" fill={TEAL} opacity="0.9" filter="url(#twin-soft-glow)" />
          <path d="M146,60 Q146,38 168,28" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.5" />
          <path d="M254,60 Q254,38 232,28" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.5" />

          {/* Neck ring */}
          <rect x="180" y="130" width="40" height="14" rx="7" fill={NAVY_DEEP} stroke={TEAL} strokeWidth="1.4" opacity="0.9" />
          <line x1="188" y1="137" x2="212" y2="137" stroke={TEAL_LIGHT} strokeWidth="1" opacity="0.6" />

          {/* Torso shell */}
          <path
            d="M146,156 Q146,143 159,141 L241,141 Q254,143 254,156 L250,200 Q248,232 246,258 L244,286 Q243,300 230,302 L170,302 Q157,300 156,286 L154,258 Q152,232 150,200 Z"
            fill="url(#twin-body)"
            stroke={TEAL}
            strokeWidth="1.8"
            opacity="0.9"
          />
          {/* Spine line */}
          <line x1="200" y1="146" x2="200" y2="300" stroke={TEAL_LIGHT} strokeWidth="0.9" opacity="0.5" strokeDasharray="4 6" />
          {/* Rib arcs */}
          <path d="M166,186 Q200,176 234,186" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.45" />
          <path d="M164,206 Q200,196 236,206" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.42" />
          <path d="M164,226 Q200,216 236,226" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.38" />
          {/* Chest control panel */}
          <rect x="170" y="160" width="60" height="46" rx="8" fill={NAVY_DEEP} stroke={TEAL} strokeWidth="1.3" opacity="0.9" />
          <circle cx="186" cy="176" r="4" fill={TEAL} opacity="0.9" />
          <circle cx="200" cy="176" r="4" fill={TEAL_LIGHT} opacity="0.75" />
          <circle cx="214" cy="176" r="4" fill={TEAL} opacity="0.55" />
          <line x1="180" y1="190" x2="220" y2="190" stroke={TEAL_LIGHT} strokeWidth="1" opacity="0.6" />
          <line x1="180" y1="198" x2="206" y2="198" stroke={TEAL_LIGHT} strokeWidth="1" opacity="0.4" />
          {/* Waist unit */}
          <rect x="172" y="258" width="56" height="28" rx="7" fill="none" stroke={TEAL} strokeWidth="1.1" opacity="0.6" />
          <line x1="182" y1="272" x2="218" y2="272" stroke={TEAL_LIGHT} strokeWidth="1" opacity="0.5" />

          {/* Shoulder joints */}
          <Joint cx={146} cy={166} r={6} />
          <Joint cx={254} cy={166} r={6} />

          {/* Arms */}
          <Wire points="146,166 104,240" opacity={0.85} width={1.8} />
          <Wire points="104,240 92,320" opacity={0.75} width={1.6} />
          <Joint cx={104} cy={240} r={4.5} />
          <Joint cx={92} cy={320} r={4} />
          <path d="M86,320 Q92,334 100,320" fill="none" stroke={TEAL} strokeWidth="1.6" opacity="0.8" />

          <Wire points="254,166 296,240" opacity={0.85} width={1.8} />
          <Wire points="296,240 308,320" opacity={0.75} width={1.6} />
          <Joint cx={296} cy={240} r={4.5} />
          <Joint cx={308} cy={320} r={4} />
          <path d="M300,320 Q308,334 316,320" fill="none" stroke={TEAL} strokeWidth="1.6" opacity="0.8" />

          {/* Pelvis */}
          <path
            d="M158,300 L242,300 L238,344 Q236,354 226,354 L174,354 Q164,354 162,344 Z"
            fill="url(#twin-body)"
            stroke={TEAL}
            strokeWidth="1.7"
            opacity="0.88"
          />
          <line x1="176" y1="326" x2="224" y2="326" stroke={TEAL_LIGHT} strokeWidth="1" opacity="0.45" />

          {/* Legs */}
          <Wire points="186,350 176,432" opacity={0.85} width={1.9} />
          <Wire points="176,432 172,494" opacity={0.72} width={1.6} />
          <Joint cx={176} cy={432} r={5} />
          <Joint cx={172} cy={494} r={4} />
          <path d="M158,494 Q172,506 186,494" fill="none" stroke={TEAL} strokeWidth="1.6" opacity="0.8" />

          <Wire points="214,350 224,432" opacity={0.85} width={1.9} />
          <Wire points="224,432 228,494" opacity={0.72} width={1.6} />
          <Joint cx={224} cy={432} r={5} />
          <Joint cx={228} cy={494} r={4} />
          <path d="M214,494 Q228,506 242,494" fill="none" stroke={TEAL} strokeWidth="1.6" opacity="0.8" />

          {/* Connector traces to hotspots */}
          {HOTSPOT_NODES.map((node) => {
            const isActive = activeHotspot === node.id;
            return (
              <g key={`link-${node.id}`} opacity={isActive ? 0.95 : 0.32}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={node.x}
                  y2={node.id === 'exposure' ? 138 : node.id === 'dna' ? 248 : 400}
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
