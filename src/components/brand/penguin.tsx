"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

const BODY = "M256 70 C350 70 410 150 410 262 C410 380 350 452 256 452 C162 452 102 380 102 262 C102 150 162 70 256 70 Z";

/**
 * Mascota de Recapi. Con `animated` flota, parpadea y los ojos siguen al puntero.
 * Respeta «reducir movimiento» del sistema.
 */
export function Penguin({ size = 220, animated = true, className }: { size?: number; animated?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const live = animated && !reduce;
  const ref = useRef<SVGSVGElement>(null);

  // Posición del puntero respecto al centro de la mascota, en el rango −1…1.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 18 });
  const sy = useSpring(py, { stiffness: 140, damping: 18 });
  const eyeX = useTransform(sx, [-1, 1], [-9, 9]);
  const eyeY = useTransform(sy, [-1, 1], [-5, 7]);
  const bodyX = useTransform(sx, [-1, 1], [-4, 4]);

  useEffect(() => {
    if (!live) return;
    const move = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 240);
      const dy = (e.clientY - (r.top + r.height / 2)) / Math.max(r.height, 240);
      px.set(Math.max(-1, Math.min(1, dx)));
      py.set(Math.max(-1, Math.min(1, dy)));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [live, px, py]);

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={live ? { y: [0, -10, 0] } : undefined}
      transition={live ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <svg ref={ref} viewBox="0 0 512 512" width="100%" height="100%" role="img" aria-label="Recapi, el pingüino" overflow="visible">
        <defs>
          <linearGradient id="pBody" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#1c46b8" />
            <stop offset="1" stopColor="#0a2680" />
          </linearGradient>
          <linearGradient id="pBelly" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dbe9ff" />
          </linearGradient>
          <linearGradient id="pBeak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd896" />
            <stop offset="1" stopColor="#ffb866" />
          </linearGradient>
          <linearGradient id="pShine" x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="pClip">
            <path d={BODY} />
          </clipPath>
        </defs>

        <ellipse cx="256" cy="462" rx="104" ry="12" fill="#06236f" opacity="0.28" />
        <ellipse cx="206" cy="448" rx="34" ry="16" fill="url(#pBeak)" />
        <ellipse cx="306" cy="448" rx="34" ry="16" fill="url(#pBeak)" />

        {/* Aletas: la izquierda saluda de vez en cuando (gira desde el hombro) */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 8%" }}
          animate={live ? { rotate: [0, 24, 0, 18, 0] } : undefined}
          transition={live ? { duration: 2.4, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" } : undefined}
        >
          <ellipse cx="94" cy="300" rx="26" ry="62" transform="rotate(14 94 300)" fill="url(#pBody)" />
        </motion.g>
        <ellipse cx="418" cy="300" rx="26" ry="62" transform="rotate(-14 418 300)" fill="url(#pBody)" />

        <motion.g style={{ x: live ? bodyX : 0 }}>
          <path d={BODY} fill="url(#pBody)" />
          <g clipPath="url(#pClip)">
            <ellipse cx="256" cy="372" rx="108" ry="104" fill="url(#pBelly)" />
            <ellipse cx="176" cy="140" rx="104" ry="58" transform="rotate(-28 176 140)" fill="url(#pShine)" />
          </g>

          {/* Ojos altos: siguen al puntero y parpadean */}
          <motion.g style={{ x: live ? eyeX : 0, y: live ? eyeY : 0 }}>
            <motion.g
              style={{ originX: "256px", originY: "208px" }}
              animate={live ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
              transition={live ? { duration: 5, repeat: Infinity, times: [0, 0.9, 0.94, 0.98, 1] } : undefined}
            >
              <rect x="178" y="172" width="38" height="72" rx="19" transform="rotate(-7 197 208)" fill="#ffffff" />
              <rect x="296" y="172" width="38" height="72" rx="19" transform="rotate(7 315 208)" fill="#ffffff" />
              <rect x="190" y="184" width="11" height="30" rx="5.5" transform="rotate(-7 195 199)" fill="#8fb8ff" />
              <rect x="308" y="184" width="11" height="30" rx="5.5" transform="rotate(7 313 199)" fill="#8fb8ff" />
            </motion.g>
          </motion.g>

          <path d="M232 270 Q256 254 280 270 Q270 296 256 298 Q242 296 232 270 Z" fill="url(#pBeak)" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
