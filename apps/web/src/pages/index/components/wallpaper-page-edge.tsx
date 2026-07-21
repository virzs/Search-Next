import { useRef, useState, type PointerEvent } from "react";

export interface WallpaperPageEdgeProps {
  side: "left" | "right";
  onCommit: () => void;
}

const WallpaperPageEdge = ({ side, onCommit }: WallpaperPageEdgeProps) => {
  const startRef = useRef<{ x: number; time: number } | null>(null);
  const [active, setActive] = useState(false);

  const finish = (event: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    startRef.current = null;
    setActive(false);
    if (!start) return;
    const distance = event.clientX - start.x;
    const elapsed = Math.max(1, performance.now() - start.time);
    const velocity = distance / elapsed;
    const directedDistance = side === "left" ? distance : -distance;
    const directedVelocity = side === "left" ? velocity : -velocity;
    if (directedDistance >= 50 || directedVelocity >= 0.3) onCommit();
  };

  return (
    <div
      aria-hidden="true"
      data-wallpaper-page-edge={side}
      className={`absolute inset-y-0 z-50 w-6 touch-none ${
        side === "left" ? "left-0" : "right-0"
      }`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        startRef.current = { x: event.clientX, time: performance.now() };
        setActive(true);
      }}
      onPointerUp={finish}
      onPointerCancel={() => {
        startRef.current = null;
        setActive(false);
      }}
      style={{
        background:
          side === "left"
            ? "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)"
            : "linear-gradient(270deg, rgba(255,255,255,0.12), transparent)",
        opacity: active ? 1 : 0,
        transition: "opacity 120ms ease-out",
      }}
    />
  );
};

export default WallpaperPageEdge;
