import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ExternalLink,
  Headphones,
} from "lucide-react";
import type { Album } from "@/types";
import CrimsonVoid from "@/components/CrimsonVoid";
import { apiFetch } from "@/lib/api";
import { useResponsiveCarousel } from "@/hooks/useResponsiveCarousel";

/* ============================================
   AUDIO PLAYER WITH STREAMING PLATFORM LINKS
   ============================================ */
function AudioPlayer({ album }: { album: Album }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const waveformRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  const duration = "3:45";
  const totalSeconds = 225;

  const bars = useRef<number[]>([]);
  if (bars.current.length === 0) {
    const seed = album.title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    let s = seed;
    const rnd = () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
    bars.current = Array.from({ length: 60 }, () => rnd() * 0.7 + 0.15);
  }

  const animate = useCallback(() => {
    progressRef.current += 0.04;
    if (progressRef.current > 100) progressRef.current = 0;
    setProgress(progressRef.current);
    const currentSeconds = Math.floor(
      (progressRef.current / 100) * totalSeconds
    );
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    setCurrentTime(`${mins}:${String(secs).padStart(2, "0")}`);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  const handleScrub = (clientX: number) => {
    const el = waveformRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;
    progressRef.current = pct;
    setProgress(pct);
    const currentSeconds = Math.floor((pct / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    setCurrentTime(`${mins}:${String(secs).padStart(2, "0")}`);
  };

  const activeBars = Math.floor((progress / 100) * bars.current.length);

  const streamingLinks = album.streamingLinks || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full glass rounded-lg p-3 sm:p-4 space-y-3 touch-manipulation"
    >
      {/* Play row */}
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          type="button"
          className="min-h-[44px] min-w-[44px] rounded-full bg-olive-light flex items-center justify-center text-obsidian hover:bg-olive-muted transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </motion.button>
        <div className="flex-1 min-w-0">
          <p className="text-champagne text-sm font-medium truncate">
            {album.title}
          </p>
          <p className="text-muted-warm text-[10px] font-mono">
            {currentTime} / {duration}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-warm hover:text-champagne transition-colors rounded-full"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Waveform scrubber */}
      <div
        ref={waveformRef}
        className="relative h-11 sm:h-10 cursor-pointer select-none"
        onPointerDown={e => {
          setIsDragging(true);
          handleScrub(e.clientX);
        }}
        onPointerMove={e => {
          if (!isDragging) return;
          handleScrub(e.clientX);
        }}
        onPointerUp={() => setIsDragging(false)}
      >
        <div className="absolute inset-0 flex items-center gap-[2px]">
          {bars.current.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors"
              style={{
                height: `${h * 100}%`,
                backgroundColor:
                  i < activeBars ? "#8b7340" : "rgba(245,230,211,0.12)",
              }}
            />
          ))}
        </div>
        <div
          className="absolute top-0 bottom-0 w-px bg-olive-light pointer-events-none z-10"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-3 h-3 text-muted-warm" />
        <div
          className="flex-1 h-1 bg-champagne/10 rounded-full overflow-hidden cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const v = Math.max(
              0,
              Math.min(1, (e.clientX - rect.left) / rect.width)
            );
            setVolume(v);
            setIsMuted(false);
          }}
        >
          <div
            className="h-full bg-olive-light rounded-full"
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
        </div>
      </div>

      {/* Streaming Platform Links */}
      <div className="pt-2 border-t border-champagne/10">
        <p className="text-[9px] tracking-[0.15em] uppercase text-muted-warm mb-2">
          Listen Full Track On
        </p>
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {streamingLinks.spotify && (
            <a
              href={streamingLinks.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-[10px] hover:bg-[#1DB954]/20 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Spotify
            </a>
          )}
          {streamingLinks.apple && (
            <a
              href={streamingLinks.apple}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FC3C44]/10 border border-[#FC3C44]/30 text-[#FC3C44] text-[10px] hover:bg-[#FC3C44]/20 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.994 6.124a9.23 9.23 0 00-.24 1.852c0 5.399-4.48 9.754-10.054 9.754-1.146 0-2.243-.194-3.27-.548a6.646 6.646 0 01-5.148 2.435 6.64 6.64 0 01-1.615-.205 6.674 6.674 0 004.62-2.38C5.66 16.087 3.518 13.68 3.518 10.75c0-4.83 3.925-8.75 8.753-8.75.336 0 .666.023.994.057-.058.134-.089.274-.089.42 0 .82.664 1.484 1.485 1.484a1.48 1.48 0 00.576-.117c.558.885.884 1.928.884 3.04 0 3.316-2.683 6.004-5.996 6.004-1.06 0-2.055-.275-2.919-.758a6.032 6.032 0 002.916.757c2.71 0 5.013-1.82 5.697-4.307a7.196 7.196 0 01-1.426.142 7.27 7.27 0 01-7.268-7.27 7.27 7.27 0 017.268-7.27 7.27 7.27 0 017.27 7.27 7.255 7.255 0 01-1.998 5.03 9.062 9.062 0 002.754-6.56c0-.556-.054-1.102-.16-1.633a8.73 8.73 0 001.06 4.48z" />
              </svg>
              Apple
            </a>
          )}
          {streamingLinks.deezer && (
            <a
              href={streamingLinks.deezer}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEAA2D]/10 border border-[#FEAA2D]/30 text-[#FEAA2D] text-[10px] hover:bg-[#FEAA2D]/20 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12zm4.41 8.705c.581-.594 1.492-.882 2.64-.882h7.055c1.068 0 1.855-.293 2.285-.88.423-.575.533-1.376.533-2.398V7.455c0-1.024-.11-1.825-.533-2.398-.43-.588-1.217-.882-2.285-.882H7.05c-1.148 0-2.059.288-2.64.882C3.83 5.645 3.72 6.446 3.72 7.47v8.955c0 1.022.11 1.823.533 2.398.423.587 1.21.882 2.157.882z" />
              </svg>
              Deezer
            </a>
          )}
          {streamingLinks.tidal && (
            <a
              href={streamingLinks.tidal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] hover:bg-white/20 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996 4.004 12l4.004-4.004L12.012 12l-4.004 4.004 4.004 4.004 4.004-4.004L12.012 12l4.004-4.004L12.012 3.992z" />
              </svg>
              Tidal
            </a>
          )}
          {streamingLinks.soundcloud && (
            <a
              href={streamingLinks.soundcloud}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] hover:bg-[#FF5500]/20 transition-colors"
            >
              <Headphones className="w-3 h-3" />
              SoundCloud
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================
   YOUTUBE VIDEO CARD
   ============================================ */
function VideoCard({ album }: { album: Album }) {
  if (album.cloudinaryVideoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full glass rounded-lg p-3 mt-3 sm:mt-4 border border-champagne/10"
      >
        <p className="text-champagne text-sm font-medium mb-2">{album.title}</p>
        <video
          src={album.cloudinaryVideoUrl}
          className="w-full rounded-md max-h-[min(42vh,240px)] sm:max-h-[220px] bg-black/40"
          controls
          playsInline
          preload="metadata"
        />
      </motion.div>
    );
  }

  return (
    <motion.a
      href={album.youtubeUrl || "https://www.youtube.com"}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="w-full glass rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 hover:border-olive-light/40 transition-all group touch-manipulation min-h-[52px]"
    >
      <div className="min-h-[44px] min-w-[44px] rounded-full bg-[#FF0000] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <ExternalLink className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-champagne text-sm font-medium">{album.title}</p>
        <p className="text-muted-warm text-xs mt-0.5">Watch on YouTube</p>
      </div>
    </motion.a>
  );
}

/* ============================================
   CATALOG PAGE
   ============================================ */
export default function Catalog() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = Math.max(albums.length, 1);
  const layout = useResponsiveCarousel("catalog");
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    apiFetch<(Omit<Album, "id"> & { _id: string })[]>("/albums")
      .then(data => {
        const mapped = data.map(item => ({ ...item, id: item._id }));
        setAlbums(mapped);
        setCurrent(0);
      })
      .catch(() => {
        setAlbums([]);
        setCurrent(0);
      });
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + total) % total);
  }, [total]);

  const getIdx = (offset: number) => {
    const idx = current + offset;
    if (idx < 0) return idx + total;
    if (idx >= total) return idx - total;
    return idx;
  };

  const currentAlbum = albums[current] ?? albums[0];

  if (albums.length === 0) {
    return (
      <main className="relative min-h-[100dvh] bg-obsidian flex items-center justify-center px-6">
        <CrimsonVoid />
        <p className="relative z-10 text-muted-warm text-sm text-center max-w-md">
          No catalog releases yet.{" "}
          <Link
            to="/admin/music?new=1"
            className="text-champagne underline underline-offset-4 hover:text-olive-light"
          >
            Add a release in admin
          </Link>{" "}
          (Catalog → music); it will show here once saved.
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-obsidian overflow-hidden">
      {/* 3D Shader Background from Home */}
      <CrimsonVoid />

      <div
        className="relative z-10 min-h-[100dvh] touch-pan-y"
        onTouchStart={e => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={e => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx < -48) next();
          else if (dx > 48) prev();
        }}
      >
        {/* Header: stack on small screens; horizontal scroll for filters */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-20 sm:top-24 left-0 right-0 z-30 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between px-4 sm:px-8 max-w-[100vw]"
        >
          <div className="flex-shrink-0 text-center sm:text-left sm:w-[120px] md:w-[140px]">
            <p className="text-[12px] sm:text-[13px] font-body font-medium tracking-[0.15em] text-champagne/70">
              ARA MUZICC
            </p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-champagne/30 mt-0.5">
              Catalog
            </p>
          </div>

          <div className="flex-1 text-center min-w-0 order-first sm:order-none">
            <h1 className="font-display text-[clamp(1.1rem,5.5vw,3.5rem)] tracking-[0.06em] sm:tracking-[0.1em] text-champagne leading-[1.05] px-1">
              ARA MUZICC CATALOG
            </h1>
            <p className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-muted-warm mt-1.5 px-2">
              Albums / Singles / Instrumentals / Videos
            </p>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[120px] md:min-w-[140px] flex gap-1.5 sm:gap-2 justify-center sm:justify-end overflow-x-auto pb-1 -mx-1 px-1">
            {["ALL", "ALBUMS", "SINGLES", "INSTRUMENTALS", "VIDEOS"].map(
              cat => (
                <button
                  key={cat}
                  type="button"
                  className="shrink-0 px-2.5 sm:px-3 py-2 sm:py-1 rounded-full glass text-[8px] sm:text-[9px] tracking-[0.12em] sm:tracking-[0.15em] uppercase text-champagne/50 hover:text-champagne hover:border-olive-light/30 transition-all touch-manipulation"
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* 3D wall — dimensions follow viewport */}
        <div
          className="absolute inset-0 flex items-center justify-center pt-24 pb-[22rem] sm:pb-52 md:pb-44 lg:pb-36 xl:pb-28"
          style={{ perspective: layout.centerW < 360 ? "900px" : "1400px" }}
        >
          <div
            className="relative flex items-center justify-center max-w-[100vw]"
            style={{
              transformStyle: "preserve-3d",
              width: "100%",
              height: "100%",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {layout.offsets.map(offset => {
                const album = albums[getIdx(offset)] ?? albums[0];
                const absOffset = Math.abs(offset);
                const zTranslate = offset === 0 ? 0 : -layout.zStep * absOffset;
                const xTranslate = offset * layout.xStep;
                const rotateY = offset * -layout.rotateYPer;
                const scale = 1 - absOffset * 0.08;
                const brightness = 1 - absOffset * 0.35;
                const isCenter = offset === 0;
                const frameW = isCenter ? layout.centerW : layout.sideW;

                return (
                  <motion.div
                    key={`${album.id}-${offset}`}
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
                      opacity: absOffset > 1 ? 0.1 : 1 - absOffset * 0.2,
                    }}
                    exit={{
                      x: xTranslate - direction * layout.animSlide,
                      z: zTranslate,
                      rotateY,
                      scale,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute max-w-[calc(100vw-1.5rem)]"
                    style={{
                      transformStyle: "preserve-3d",
                      width: frameW,
                      filter: `brightness(${brightness})`,
                    }}
                  >
                    <div
                      className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-8 sm:h-10"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(245,230,211,0.1) 0%, transparent 70%)",
                        boxShadow: "0 0 50px 15px rgba(245,230,211,0.03)",
                      }}
                    />

                    <div className="relative p-[4px] sm:p-[5px] bg-[#1a1508] rounded-sm shadow-2xl">
                      <div className="relative overflow-hidden bg-[#1a1508] p-0.5">
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%)",
                          }}
                        />
                      </div>
                      <div
                        className="absolute inset-0 pointer-events-none rounded-sm"
                        style={{
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.6)",
                        }}
                      />
                    </div>

                    <div
                      className="absolute -bottom-4 sm:-bottom-5 left-[10%] right-[10%] h-5 sm:h-6"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
                      }}
                    />

                    {isCenter && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 sm:mt-3 w-[min(100%,calc(100vw-1.25rem))] max-w-[520px]">
                        {album.mediaType === "audio" ? (
                          <AudioPlayer album={album} />
                        ) : (
                          <VideoCard album={album} />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          key={`caption-${current}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 text-center z-30 px-4 w-full max-w-[90vw]"
        >
          <p className="font-script text-base sm:text-lg text-olive-light text-center truncate">
            {currentAlbum.genre}
          </p>
          <p className="text-muted-warm text-[10px] mt-0.5 text-center">
            {currentAlbum.releaseDate}
          </p>
          <p className="text-[10px] sm:text-[11px] tracking-[0.15em] text-champagne/30 uppercase mt-1 text-center">
            {current + 1} / {total}
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={prev}
          className="absolute left-2 sm:left-6 top-[42%] sm:top-1/2 -translate-y-1/2 z-30 min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0 sm:w-12 sm:h-12 rounded-full border border-champagne/15 flex items-center justify-center text-champagne/50 hover:text-champagne hover:border-champagne/40 transition-all bg-obsidian/40 backdrop-blur-sm touch-manipulation"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={next}
          className="absolute right-2 sm:right-6 top-[42%] sm:top-1/2 -translate-y-1/2 z-30 min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0 sm:w-12 sm:h-12 rounded-full border border-champagne/15 flex items-center justify-center text-champagne/50 hover:text-champagne hover:border-champagne/40 transition-all bg-obsidian/40 backdrop-blur-sm touch-manipulation"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5" />
        </motion.button>
      </div>
    </main>
  );
}
