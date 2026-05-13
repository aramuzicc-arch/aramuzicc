import { useEffect, useState } from 'react';

export type CarouselMetrics = {
  /** Horizontal spacing between stack positions */
  xStep: number;
  centerW: number;
  centerH: number;
  sideW: number;
  sideH: number;
  zStep: number;
  rotateYPer: number;
  /** Initial / exit slide distance for AnimatePresence */
  animSlide: number;
  offsets: readonly number[];
};

function metricsForWidth(w: number, variant: 'catalog' | 'gallery'): CarouselMetrics {
  const portrait = variant === 'gallery';

  if (w < 480) {
    const cw = portrait ? Math.min(260, Math.max(200, w - 36)) : Math.min(300, Math.max(240, w - 40));
    const ch = portrait ? Math.round(cw * 1.28) : cw;
    const xBase = portrait ? cw * 0.34 : cw * 0.36;
    return {
      xStep: Math.min(100, Math.round(xBase)),
      centerW: cw,
      centerH: ch,
      sideW: Math.round(cw * 0.82),
      sideH: portrait ? Math.round(cw * 0.82 * 1.28) : Math.round(cw * 0.82),
      zStep: portrait ? 48 : 56,
      rotateYPer: 7,
      animSlide: Math.round(cw * 0.95),
      offsets: [-1, 0, 1],
    };
  }

  if (w < 640) {
    const cw = portrait ? Math.min(300, w - 40) : Math.min(340, w - 48);
    const ch = portrait ? Math.round(cw * 1.25) : cw;
    return {
      xStep: portrait ? 120 : 140,
      centerW: cw,
      centerH: ch,
      sideW: Math.round(cw * 0.88),
      sideH: portrait ? Math.round(cw * 0.88 * 1.25) : Math.round(cw * 0.88),
      zStep: portrait ? 72 : 90,
      rotateYPer: 8,
      animSlide: 300,
      offsets: [-1, 0, 1],
    };
  }

  if (w < 900) {
    const cw = 360;
    const ch = portrait ? 450 : cw;
    return {
      xStep: 300,
      centerW: cw,
      centerH: ch,
      sideW: 300,
      sideH: portrait ? 380 : 300,
      zStep: 120,
      rotateYPer: 9,
      animSlide: 340,
      offsets: [-2, -1, 0, 1, 2],
    };
  }

  if (variant === 'gallery') {
    return {
      xStep: 460,
      centerW: 400,
      centerH: 520,
      sideW: 320,
      sideH: 420,
      zStep: 160,
      rotateYPer: 10,
      animSlide: 360,
      offsets: [-2, -1, 0, 1, 2],
    };
  }

  return {
    xStep: 480,
    centerW: 420,
    centerH: 420,
    sideW: 340,
    sideH: 340,
    zStep: 160,
    rotateYPer: 8,
    animSlide: 380,
    offsets: [-2, -1, 0, 1, 2],
  };
}

export function useResponsiveCarousel(variant: 'catalog' | 'gallery'): CarouselMetrics {
  const [m, setM] = useState(() => metricsForWidth(typeof window !== 'undefined' ? window.innerWidth : 1024, variant));

  useEffect(() => {
    const ro = () => setM(metricsForWidth(window.innerWidth, variant));
    ro();
    window.addEventListener('resize', ro);
    return () => window.removeEventListener('resize', ro);
  }, [variant]);

  return m;
}
