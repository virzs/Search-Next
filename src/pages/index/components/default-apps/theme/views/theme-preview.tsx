import { cx } from "@emotion/css";
import { FC, useId, useRef, useState } from "react";
import type { ThemeConfigApiItem } from "@/services/desktop";

type BasePalette = {
  backgroundColor: string;
  borderColor: string;
  hoverColor: string;
  shadowColor: string;
  textColor: string;
};

const resolveThemeBasePalette = (
  config: any,
  fallback: BasePalette,
): BasePalette => {
  const base = config?.token?.base ?? {};
  const resolve = (key: keyof BasePalette) => {
    const value = base?.[key];
    return typeof value === "string" && value.trim() ? value : fallback[key];
  };
  return {
    backgroundColor: resolve("backgroundColor"),
    borderColor: resolve("borderColor"),
    hoverColor: resolve("hoverColor"),
    shadowColor: resolve("shadowColor"),
    textColor: resolve("textColor"),
  };
};

const ThemeDesktopPreviewSvg: FC<{
  palette: BasePalette;
  clipId?: string;
  filterId?: string;
}> = ({ palette, clipId, filterId }) => {
  const shadowFilter = filterId ? `url(#${filterId})` : undefined;

  return (
    <g clipPath={clipId ? `url(#${clipId})` : undefined}>
      <rect x="0" y="0" width="160" height="90" fill={palette.backgroundColor} />

      <g filter={shadowFilter}>
        <rect
          x="0"
          y="0"
          width="160"
          height="6"
          fill={palette.hoverColor}
          stroke={palette.borderColor}
          strokeWidth="1"
          opacity="0.92"
        />
      </g>
      <circle cx="10" cy="3" r="1.2" fill={palette.borderColor} opacity="0.95" />
      <circle cx="14.8" cy="3" r="1.2" fill={palette.borderColor} opacity="0.72" />
      <circle cx="19.6" cy="3" r="1.2" fill={palette.borderColor} opacity="0.55" />

      {Array.from({ length: 6 }).map((_, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 10 + col * 14;
        const y = 12 + row * 14;
        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width="8"
              height="8"
              rx="2.5"
              fill={palette.backgroundColor}
              opacity="0.68"
              stroke={palette.borderColor}
              strokeWidth="1"
            />
            <rect
              x={x + 0.5}
              y={y + 9.5}
              width="7"
              height="1.6"
              rx="0.8"
              fill={palette.textColor}
              opacity="0.28"
            />
          </g>
        );
      })}

      <g filter={shadowFilter}>
        <rect
          x="40"
          y="77"
          width="80"
          height="10"
          rx="4"
          fill={palette.hoverColor}
          stroke={palette.borderColor}
          strokeWidth="1"
          opacity="0.92"
        />
      </g>
      {Array.from({ length: 7 }).map((_, idx) => {
        const x = 45 + idx * 11;
        return (
          <rect
            key={idx}
            x={x}
            y="78.5"
            width="7"
            height="7"
            rx="2.5"
            fill={palette.backgroundColor}
            opacity={idx === 2 ? "0.9" : "0.75"}
            stroke={palette.borderColor}
            strokeWidth="1"
          />
        );
      })}

      <g filter={shadowFilter}>
        <rect
          x="126"
          y="24"
          width="26"
          height="24"
          rx="4"
          fill={palette.hoverColor}
          stroke={palette.borderColor}
          strokeWidth="1"
          opacity="0.95"
        />
      </g>
      {Array.from({ length: 4 }).map((_, idx) => (
        <rect
          key={idx}
          x="128.5"
          y={28 + idx * 4.5}
          width="21"
          height="2.2"
          rx="1.1"
          fill={palette.textColor}
          opacity={idx === 1 ? "0.26" : "0.18"}
        />
      ))}
    </g>
  );
};

export const ThemeDesktopPreview: FC<{
  theme: ThemeConfigApiItem;
  className?: string;
  draggable?: boolean;
}> = ({ theme, className, draggable = false }) => {
  const uid = useId().replace(/[:]/g, "");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingPointerIdRef = useRef<number | null>(null);
  const [ratio, setRatio] = useState(0.5);

  const lightPalette = resolveThemeBasePalette(theme.lightConfig, {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(0,0,0,0.08)",
    hoverColor: "rgba(0,0,0,0.06)",
    shadowColor: "rgba(0,0,0,0.12)",
    textColor: "rgba(0,0,0,0.78)",
  });
  const darkPalette = theme.darkConfig
    ? resolveThemeBasePalette(theme.darkConfig, {
        backgroundColor: "rgba(20, 18, 32, 0.48)",
        borderColor: "rgba(255,255,255,0.14)",
        hoverColor: "rgba(255,255,255,0.08)",
        shadowColor: "rgba(0,0,0,0.40)",
        textColor: "rgba(255,255,255,0.82)",
      })
    : null;

  const filterLightId = `theme-preview-shadow-light-${uid}`;
  const filterDarkId = `theme-preview-shadow-dark-${uid}`;
  const clipLightId = `theme-preview-clip-light-${uid}`;
  const clipDarkId = `theme-preview-clip-dark-${uid}`;

  const isDraggable = Boolean(draggable && darkPalette);
  const splitX = isDraggable ? Math.max(0, Math.min(160, ratio * 160)) : 80;

  const updateFromClientX = (clientX: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const next = (clientX - rect.left) / rect.width;
    setRatio(Math.max(0, Math.min(1, next)));
  };

  const handleFill = "rgba(255,255,255,0.92)";
  const handleStroke = "rgba(0,0,0,0.20)";
  const handleGrip = "rgba(0,0,0,0.32)";
  const dividerStroke = "rgba(0,0,0,0.22)";

  return (
    <svg
      ref={svgRef}
      className={cx("block w-full h-full", className)}
      viewBox="0 0 160 90"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={isDraggable ? { touchAction: "none" } : undefined}
    >
      <defs>
        <filter
          id={filterLightId}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor={lightPalette.shadowColor}
            floodOpacity="1"
          />
        </filter>
        <filter
          id={filterDarkId}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor={(darkPalette ?? lightPalette).shadowColor}
            floodOpacity="1"
          />
        </filter>
        {darkPalette ? (
          <>
            <clipPath id={clipLightId}>
              <rect x="0" y="0" width={splitX} height="90" />
            </clipPath>
            <clipPath id={clipDarkId}>
              <rect x={splitX} y="0" width={160 - splitX} height="90" />
            </clipPath>
          </>
        ) : null}
      </defs>

      {darkPalette ? (
        <>
          <ThemeDesktopPreviewSvg
            palette={lightPalette}
            clipId={clipLightId}
            filterId={filterLightId}
          />
          <ThemeDesktopPreviewSvg
            palette={darkPalette}
            clipId={clipDarkId}
            filterId={filterDarkId}
          />
          <line
            x1={splitX}
            y1="0"
            x2={splitX}
            y2="90"
            stroke={dividerStroke}
            strokeWidth="1"
            opacity="1"
          />
          {isDraggable ? (
            <>
              <g transform={`translate(${splitX},45)`} pointerEvents="none">
                <rect
                  x="-7"
                  y="-12"
                  width="14"
                  height="24"
                  rx="7"
                  fill={handleFill}
                  stroke={handleStroke}
                  strokeWidth="1"
                  opacity="1"
                />
                <rect
                  x="-2.5"
                  y="-6"
                  width="1"
                  height="12"
                  rx="0.5"
                  fill={handleGrip}
                  opacity="1"
                />
                <rect
                  x="1.5"
                  y="-6"
                  width="1"
                  height="12"
                  rx="0.5"
                  fill={handleGrip}
                  opacity="1"
                />
              </g>

              <rect
                x="0"
                y="0"
                width="160"
                height="90"
                fill="transparent"
                style={{ cursor: "col-resize" }}
                onPointerDown={(e) => {
                  draggingPointerIdRef.current = e.pointerId;
                  (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                  updateFromClientX(e.clientX);
                }}
                onPointerMove={(e) => {
                  if (draggingPointerIdRef.current !== e.pointerId) return;
                  updateFromClientX(e.clientX);
                }}
                onPointerUp={(e) => {
                  if (draggingPointerIdRef.current !== e.pointerId) return;
                  draggingPointerIdRef.current = null;
                  (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
                }}
                onPointerCancel={(e) => {
                  if (draggingPointerIdRef.current !== e.pointerId) return;
                  draggingPointerIdRef.current = null;
                  (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
                }}
              />
            </>
          ) : null}
        </>
      ) : (
        <ThemeDesktopPreviewSvg palette={lightPalette} filterId={filterLightId} />
      )}
    </svg>
  );
};
