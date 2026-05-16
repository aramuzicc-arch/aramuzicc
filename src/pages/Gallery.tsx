import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '@/types';
import CrimsonVoid from '@/components/CrimsonVoid';
import { apiFetch } from '@/lib/api';
import { useResponsiveCarousel } from '@/hooks/useResponsiveCarousel';

type GalleryApiRow = Omit<GalleryItem, 'id'> & { _id: string };

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = items.length;
  const layout = useResponsiveCarousel('gallery');
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    apiFetch<GalleryApiRow[]>('/gallery')
      .then((data) => setItems(data.map((item) => ({ ...item, id: item._id }))))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    setCurrent((c) => (total > 0 ? Math.min(c, total - 1) : 0));
  }, [total]);

  const next = useCallback(() => {
    if (total < 1) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total < 1) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total < 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, total]);

  const getIdx = (offset: number) => {
    if (total < 1) return 0;
    const idx = current + offset;
    if (idx < 0) return idx + total;
    if (idx >= total) return idx - total;
    return idx;
  };

  const renderMedia = (item: GalleryItem, isCenter: boolean) => {
    const className = 'w-full h-full object-cover';
    if (item.type === 'video') {
      return (
        <video
          src={item.url}
          poster={item.thumbnail}
          className={className}
          playsInline
          muted={!isCenter}
          loop={!isCenter}
          autoPlay={!isCenter}
          controls={isCenter}
        />
      );
    }
    return <img src={item.url} alt={item.title} className={className} loading="lazy" />;
  };

  return (
    <main className="relative min-h-[100dvh] bg-obsidian overflow-hidden">
      <CrimsonVoid />
      <div
        className="relative z-10 min-h-[100dvh] touch-pan-y"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx < -48) next();
          else if (dx > 48) prev();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 z-30 text-center sm:text-left px-4 max-w-[100vw]"
        >
          <p className="text-[12px] sm:text-[13px] font-body font-medium tracking-[0.15em] text-champagne/70">ARA MUZICC</p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-champagne/30 mt-0.5">Gallery</p>
        </motion.div>

        {total < 1 ? (
          <div className="absolute inset-0 flex items-center justify-center z-20 px-6 sm:px-8 text-center pt-16">
            <p className="text-champagne/50 text-sm max-w-md font-body leading-relaxed">
              No gallery items yet.{' '}
              <Link to="/admin/gallery?new=1" className="text-champagne underline underline-offset-4 hover:text-olive-light">
                Upload in admin
              </Link>{' '}
              (photos or Cloudinary videos); they appear here automatically.
            </p>
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center pt-16 pb-28 sm:pb-24"
            style={{ perspective: layout.centerW < 360 ? '900px' : '1400px' }}
          >
            <div
              className="relative flex items-center justify-center max-w-[100vw]"
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {layout.offsets.map((offset) => {
                  const item = items[getIdx(offset)];
                  if (!item) return null;
                  const absOffset = Math.abs(offset);
                  const zTranslate = offset === 0 ? 0 : -layout.zStep * absOffset;
                  const xTranslate = offset * layout.xStep;
                  const rotateY = offset * -layout.rotateYPer;
                  const scale = 1 - absOffset * 0.1;
                  const brightness = 1 - absOffset * 0.35;
                  const isCenter = offset === 0;
                  const w = isCenter ? layout.centerW : layout.sideW;
                  const h = isCenter ? layout.centerH : layout.sideH;

                  return (
                    <motion.div
                      key={`${item.id}-${offset}`}
                      initial={{
                        x: xTranslate + direction * layout.animSlide,
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
                        x: xTranslate - direction * layout.animSlide,
                        z: zTranslate,
                        rotateY,
                        scale,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute max-w-[calc(100vw-1rem)]"
                      style={{
                        transformStyle: 'preserve-3d',
                        width: w,
                        height: h,
                        filter: `brightness(${brightness})`,
                      }}
                    >
                      <div
                        className="absolute -top-6 sm:-top-10 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-7 sm:h-10"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(245,230,211,0.12) 0%, transparent 70%)',
                          boxShadow: '0 0 50px 15px rgba(245,230,211,0.04)',
                        }}
                      />

                      <div className="relative w-full h-full p-[4px] sm:p-[5px] bg-[#1a1508] rounded-sm shadow-2xl">
                        <div className="relative w-full h-full overflow-hidden bg-[#1a1508] p-0.5">
                          {renderMedia(item, isCenter)}
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%)',
                            }}
                          />
                        </div>
                        <div
                          className="absolute inset-0 pointer-events-none rounded-sm"
                          style={{
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.6)',
                          }}
                        />
                      </div>

                      <div
                        className="absolute -bottom-3 sm:-bottom-5 left-[10%] right-[10%] h-5 sm:h-6"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)' }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {total > 0 && (
          <motion.div
            key={`caption-${current}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-8 left-1/2 -translate-x-1/2 text-center z-30 px-4 max-w-[min(100vw-2rem,28rem)]"
          >
            <p className="font-script text-xl sm:text-2xl text-olive-light leading-tight break-words">{items[current]?.title}</p>
            <p className="text-[10px] sm:text-[11px] tracking-[0.15em] text-champagne/30 uppercase mt-1">
              {current + 1} / {total}
            </p>
          </motion.div>
        )}

        {total > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={prev}
              className="absolute left-2 sm:left-6 top-[42%] sm:top-1/2 -translate-y-1/2 z-30 min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0 sm:w-12 sm:h-12 rounded-full border border-champagne/15 flex items-center justify-center text-champagne/50 hover:text-champagne hover:border-champagne/40 transition-all duration-300 bg-obsidian/40 backdrop-blur-sm touch-manipulation"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={next}
              className="absolute right-2 sm:right-6 top-[42%] sm:top-1/2 -translate-y-1/2 z-30 min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0 sm:w-12 sm:h-12 rounded-full border border-champagne/15 flex items-center justify-center text-champagne/50 hover:text-champagne hover:border-champagne/40 transition-all duration-300 bg-obsidian/40 backdrop-blur-sm touch-manipulation"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5" />
            </motion.button>
          </>
        )}

        <div className="absolute bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 translate-y-6 sm:translate-y-4 z-30 px-4 text-center">
          <p className="text-[8px] tracking-[0.15em] text-champagne/15">2026 ARA MUZICC All Rights Reserved</p>
        </div>
      </div>
    </main>
  );
}
