import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_ITEMS, type GalleryItem } from '@/types';
import CrimsonVoid from '@/components/CrimsonVoid';
import { apiFetch } from '@/lib/api';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = items.length || 1;

  useEffect(() => {
    apiFetch<(Omit<GalleryItem, 'id'> & { _id: string })[]>('/gallery')
      .then((data) => setItems(data.map((item) => ({ ...item, id: item._id }))))
      .catch(() => setItems(GALLERY_ITEMS));
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const getIdx = (offset: number) => {
    const idx = current + offset;
    if (idx < 0) return idx + total;
    if (idx >= total) return idx - total;
    return idx;
  };

  return (
    <main className="relative min-h-[100dvh] bg-obsidian overflow-hidden">
      <CrimsonVoid />
      <div className="relative z-10 min-h-[100dvh]">
        {/* Brand label - pushed below nav */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-20 left-8 z-30"
        >
          <p className="text-[13px] font-body font-medium tracking-[0.15em] text-champagne/70">ARA MUZICC</p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-champagne/30 mt-0.5">Gallery</p>
        </motion.div>

        {/* 3D Perspective Gallery */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1400px' }}>
          <div
            className="relative flex items-center justify-center"
            style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {[-2, -1, 0, 1, 2].map((offset) => {
                const item = items[getIdx(offset)];
                if (!item) return null;
                const absOffset = Math.abs(offset);
                const zTranslate = offset === 0 ? 0 : -160 * absOffset;
                const xTranslate = offset * 460;
                const rotateY = offset * -10;
                const scale = 1 - absOffset * 0.1;
                const brightness = 1 - absOffset * 0.35;
                const isCenter = offset === 0;

                return (
                  <motion.div
                    key={`${item.id}-${offset}`}
                    initial={{
                      x: xTranslate + direction * 360,
                      z: zTranslate,
                      rotateY,
                      scale,
                      opacity: 0,
                    }}
                    animate={{
                      x: xTranslate,
                      z: zTranslate,
                      rotateY,
                      scale,
                      opacity: absOffset > 1 ? 0.1 : 1 - absOffset * 0.25,
                    }}
                    exit={{
                      x: xTranslate - direction * 360,
                      z: zTranslate,
                      rotateY,
                      scale,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute"
                    style={{
                      transformStyle: 'preserve-3d',
                      width: isCenter ? '400px' : '320px',
                      height: isCenter ? '520px' : '420px',
                      filter: `brightness(${brightness})`,
                    }}
                  >
                    {/* Spotlight */}
                    <div
                      className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-10"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(245,230,211,0.12) 0%, transparent 70%)',
                        boxShadow: '0 0 50px 15px rgba(245,230,211,0.04)',
                      }}
                    />

                    {/* Frame */}
                    <div className="relative w-full h-full p-[5px] bg-[#1a1508] rounded-sm shadow-2xl">
                      <div className="relative w-full h-full overflow-hidden bg-[#1a1508] p-0.5">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%)' }}
                        />
                      </div>
                      <div
                        className="absolute inset-0 pointer-events-none rounded-sm"
                        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.6)' }}
                      />
                    </div>

                    {/* Shadow */}
                    <div
                      className="absolute -bottom-5 left-[10%] right-[10%] h-6"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)' }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Center caption */}
        <motion.div
          key={`caption-${current}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-30"
        >
          <p className="font-script text-2xl text-olive-light">
            {(items[current] || GALLERY_ITEMS[0]).title}
          </p>
          <p className="text-[11px] tracking-[0.15em] text-champagne/30 uppercase mt-1">
            {current + 1} / {total}
          </p>
        </motion.div>

        {/* Navigation arrows */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-champagne/15 flex items-center justify-center text-champagne/50 hover:text-champagne hover:border-champagne/40 transition-all duration-300 bg-obsidian/30 backdrop-blur-sm"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-champagne/15 flex items-center justify-center text-champagne/50 hover:text-champagne hover:border-champagne/40 transition-all duration-300 bg-obsidian/30 backdrop-blur-sm"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {/* Copyright */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-4 z-30">
          <p className="text-[8px] tracking-[0.15em] text-champagne/15">
            2025 ARA MUZICC All Rights Reserved
          </p>
        </div>
      </div>
    </main>
  );
}
