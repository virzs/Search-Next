import { FC, useEffect, useState } from "react";
import { Spin } from "antd";
import { AnimatePresence, motion } from "framer-motion";

export interface LoadingOverlayProps {
  open: boolean;
  text?: string;
  delayMs?: number;
  spinSize?: "small" | "default" | "large";
  className?: string;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({
  open,
  text = "正在加载…",
  delayMs = 150,
  spinSize = "large",
  className,
}) => {
  const cloudTextureDataUrl =
    "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%271280%27%20height%3D%271280%27%3E%3Cfilter%20id%3D%27t%27%20x%3D%270%27%20y%3D%270%27%20width%3D%27100%25%27%20height%3D%27100%25%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.010%27%20numOctaves%3D%275%27%20seed%3D%278%27%20stitchTiles%3D%27noStitch%27/%3E%3CfeColorMatrix%20type%3D%27matrix%27%20values%3D%271%200%200%200%200%200%201%200%200%200%200%200%201%200%200%200%200%200%200.22%200%27/%3E%3C/filter%3E%3Crect%20width%3D%271280%27%20height%3D%271280%27%20filter%3D%27url(%23t)%27/%3E%3C/svg%3E";
  const grainTextureDataUrl =
    "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%271024%27%20height%3D%271024%27%3E%3Cfilter%20id%3D%27g%27%20x%3D%270%27%20y%3D%270%27%20width%3D%27100%25%27%20height%3D%27100%25%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.65%27%20numOctaves%3D%273%27%20seed%3D%2711%27%20stitchTiles%3D%27noStitch%27/%3E%3CfeColorMatrix%20type%3D%27matrix%27%20values%3D%270%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200.16%200%27/%3E%3C/filter%3E%3Crect%20width%3D%271024%27%20height%3D%271024%27%20filter%3D%27url(%23g)%27/%3E%3C/svg%3E";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, open]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={
            className ??
            "fixed inset-0 z-50 flex items-center justify-center overflow-hidden backdrop-blur-3xl"
          }
          style={{
            backgroundImage:
              "radial-gradient(140% 120% at 18% 12%, rgba(99, 102, 241, 0.22) 0%, rgba(15, 23, 42, 0.92) 55%), radial-gradient(120% 120% at 84% 86%, rgba(14, 165, 233, 0.16) 0%, rgba(15, 23, 42, 0.88) 62%)",
            backgroundColor: "rgba(15, 23, 42, 0.90)",
          }}
          role="status"
          aria-live="polite"
          aria-busy="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(120% 90% at 22% 16%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 62%), radial-gradient(120% 120% at 80% 84%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%), conic-gradient(from 200deg at 50% 50%, rgba(56, 189, 248, 0.14), rgba(99, 102, 241, 0.14), rgba(56, 189, 248, 0.14))",
              backgroundBlendMode: "screen, multiply, overlay",
              filter: "contrast(1.18) saturate(1.18)",
              opacity: 1,
            }}
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: 1.06, rotate: 2 }}
            transition={{
              duration: 9,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          <motion.div
            aria-hidden
            className="absolute -inset-[18%]"
            style={{
              backgroundImage: `url("${cloudTextureDataUrl}")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "blur(28px) contrast(1.25) saturate(1.1)",
              mixBlendMode: "soft-light",
              opacity: 0.55,
              willChange: "transform, opacity",
            }}
            initial={{ rotate: -1.2, scale: 1.04, opacity: 0.42 }}
            animate={{ rotate: 1.2, scale: 1.08, opacity: 0.6 }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          <motion.div
            aria-hidden
            className="absolute -inset-[10%]"
            style={{
              backgroundImage: `url("${grainTextureDataUrl}")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              mixBlendMode: "overlay",
              opacity: 0.28,
              willChange: "transform, opacity",
            }}
            initial={{ rotate: 0.4, scale: 1.02, opacity: 0.18 }}
            animate={{ rotate: -0.4, scale: 1.04, opacity: 0.32 }}
            transition={{
              duration: 7,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          <motion.div
            className="relative z-[1] flex flex-col items-center gap-3 px-6 py-5"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Spin size={spinSize} />
            <div className="text-white/85 text-sm tracking-wide animate-pulse">
              {text}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
