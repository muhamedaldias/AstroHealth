import type React from "react";
import type { Language } from "../types";

interface AstroLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "nav";
  showText?: boolean;
  lang?: Language;
  harmonized?: boolean;
}

export const AstroLogo: React.FC<AstroLogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  lang = "en",
  harmonized = false,
}) => {
  const sizeMap = {
    sm: { imgHeight: 38, title: "text-base", sub: "text-[10px]" },
    md: { imgHeight: 46, title: "text-lg", sub: "text-xs" },
    lg: { imgHeight: 60, title: "text-2xl", sub: "text-sm" },
    nav: { imgHeight: 56, title: "text-base", sub: "text-[10px]" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official AstroHealth AI Shield Emblem */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${
          harmonized ? "isolate" : ""
        }`}
      >
        {harmonized && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 scale-125 rounded-full blur-md"
            style={{
              background:
                "radial-gradient(circle at center, rgba(45, 125, 130, 0.30) 0%, rgba(13, 34, 58, 0.16) 55%, transparent 75%)",
            }}
          />
        )}
        <img
          src="/logo.png"
          alt="AstroHealth AI shield emblem"
          height={currentSize.imgHeight}
          className={harmonized ? "relative z-10" : undefined}
          style={{
            height: currentSize.imgHeight,
            width: "auto",
            display: "block",
            /* blend transparent PNG cleanly over white/light header background */
            mixBlendMode: "multiply",
            imageRendering: "auto",
            filter: harmonized ? "drop-shadow(0 2px 8px rgba(45, 125, 130, 0.35))" : undefined,
          }}
          draggable={false}
        />
        {harmonized && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-md bg-gradient-to-br from-[#2D7D82] to-[#174A55] opacity-[0.14] mix-blend-color"
            style={{
              WebkitMaskImage: "url(/logo.png)",
              maskImage: "url(/logo.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
        )}
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-bold tracking-tight ${currentSize.title} text-brand-700 font-sans`}
            >
              AstroHealth
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold italic tracking-wider text-brand-200 bg-brand-700 border border-brand-400/40 rounded-md shadow-sm">
              AI
            </span>
          </div>
          <span
            className={`text-slate-500 font-normal ${currentSize.sub} mt-0.5 flex items-center gap-1.5`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            {lang === "ar" ? "منصة الرصد الجيني والطب الفضائي" : "Space-Health & Bio-Nutrition"}
          </span>
        </div>
      )}
    </div>
  );
};
