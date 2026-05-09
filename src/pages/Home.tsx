import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Calendar, Music, Headphones, Radio, Disc3 } from 'lucide-react';
import CrimsonVoid from '@/components/CrimsonVoid';
import ScrollReveal from '@/components/ScrollReveal';
import TiltCard from '@/components/TiltCard';
import { ALBUMS, EVENTS } from '@/types';

gsap.registerPlugin(ScrollTrigger);

function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });
      if (titleRef.current) {
        const letters = titleRef.current.querySelectorAll('.letter');
        tl.fromTo(letters, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out' });
      }
      tl.fromTo('.hero-sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 }, '-=0.2');
      }
      if (metaRef.current) {
        tl.fromTo(metaRef.current.children, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.3');
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <CrimsonVoid />
      <div className="relative z-10 w-full px-[4vw] py-20">
        <div className="max-w-7xl mx-auto">
          <h1
            ref={titleRef}
            className="font-display text-[clamp(80px,12vw,200px)] leading-[0.9] tracking-[0.08em] text-champagne uppercase overflow-hidden"
          >
            {'ARA MUZICC'.split('').map((char, i) => (
              <span key={i} className="letter inline-block" style={{ opacity: 0 }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p className="hero-sub text-[12px] tracking-[0.3em] uppercase text-muted-warm mt-6" style={{ opacity: 0 }}>
            Artist / Producer / Guitarist
          </p>

          <div ref={ctaRef} className="flex flex-wrap gap-4 mt-12">
            <Link to="/catalog" className="btn-pill">Enter Catalog</Link>
            <Link to="/store" className="btn-pill">Visit Store</Link>
            <Link to="/gallery" className="btn-pill">Watch Gallery</Link>
            <Link to="/bookings" className="btn-pill">Book Artist</Link>
          </div>
        </div>

        <div ref={metaRef} className="absolute right-[4vw] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {['LIVE SHOWS', 'STUDIO', '2025', 'ATMOSPHERE'].map((tag) => (
            <span key={tag} className="metadata-tag text-right" style={{ opacity: 0 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[9px] tracking-[0.3em] text-muted-warm uppercase">Scroll</span>
        <div className="w-px h-8 bg-champagne/30 relative overflow-hidden">
          <div className="w-full h-2 bg-champagne/60 animate-scroll-indicator" />
        </div>
      </div>
    </section>
  );
}

function ReleasesSection() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center py-20 bg-obsidian overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,124,63,0.06)_0%,transparent_70%)]" />
      <div className="relative px-[4vw]">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-12">
            <h2 className="section-header">Latest Drops</h2>
            <div className="flex gap-1">
              {[0.4, 0.7, 0.5].map((s, i) => (
                <div key={i} className="w-1 h-6 bg-olive-light/60 rounded-full origin-bottom" style={{ animation: `sound-bar 0.6s ease-in-out ${i * 0.1}s infinite alternate`, transform: `scaleY(${s})` }} />
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {ALBUMS.slice(0, 3).map((album, i) => (
            <ScrollReveal key={album.id} delay={i * 0.15} y={80}>
              <TiltCard>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="glass rounded-lg p-4">
                    <h3 className="font-display text-xl tracking-wider text-champagne">{album.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 rounded-full border border-olive-light/40 text-olive-light text-[10px] font-mono tracking-wider">{album.genre}</span>
                      <span className="text-muted-warm text-xs">{album.releaseDate}</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PerformancesSection() {
  const performances = [
    { title: 'ARENA TOUR 2024', subtitle: 'Highlights', img: '/images/gallery/gallery7.jpg' },
    { title: 'FESTIVAL SET', subtitle: 'Electric Forest', img: '/images/gallery/gallery8.jpg' },
    { title: 'ACOUSTIC SESSIONS', subtitle: 'Stripped Down', img: '/images/gallery/gallery9.jpg' },
    { title: 'STUDIO LIVE', subtitle: 'One Take', img: '/images/gallery/gallery10.jpg' },
  ];

  return (
    <section className="relative py-20 bg-obsidian">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />
      <div className="relative px-[4vw]">
        <ScrollReveal>
          <h2 className="section-header text-right text-olive-light mb-12">Live Energy</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {performances.map((perf, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer">
                <img src={perf.img} alt={perf.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-obsidian/40 group-hover:bg-obsidian/60 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-12 h-12 rounded-full bg-olive-light flex items-center justify-center">
                    <Play className="w-5 h-5 text-obsidian ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 glass-light">
                  <p className="font-display text-lg tracking-wider text-champagne">{perf.title}</p>
                  <p className="text-muted-warm text-xs">{perf.subtitle}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventsSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-obsidian to-olive/20">
      <div className="px-[4vw]">
        <ScrollReveal>
          <h2 className="section-header mb-12">On Tour</h2>
        </ScrollReveal>

        <div className="max-w-4xl">
          {EVENTS.map((event, i) => (
            <ScrollReveal key={event.id} delay={i * 0.12}>
              <div className="group flex items-center gap-6 py-6 border-b border-champagne/10 cursor-pointer hover:bg-olive/5 hover:border-l-[3px] hover:border-l-olive-light hover:pl-4 transition-all duration-300 -ml-4 pl-4">
                <span className="font-mono text-xl md:text-2xl text-olive-light min-w-[80px]">{event.date}</span>
                <div className="flex-1">
                  <p className="font-body text-base md:text-lg text-champagne tracking-wide">{event.venue}</p>
                </div>
                <span className="text-muted-warm text-sm hidden sm:block">{event.location}</span>
                <Calendar className="w-4 h-4 text-muted-warm group-hover:text-olive-light transition-colors" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialSection() {
  const platforms = [
    { icon: Music, name: 'Spotify' },
    { icon: Headphones, name: 'Apple Music' },
    { icon: Radio, name: 'YouTube Music' },
    { icon: Disc3, name: 'SoundCloud' },
    { icon: Music, name: 'Bandcamp' },
    { icon: Disc3, name: 'TIDAL' },
  ];

  return (
    <section className="relative py-32 bg-obsidian">
      <div className="px-[4vw] text-center">
        <ScrollReveal>
          <h2 className="font-display text-[clamp(36px,6vw,80px)] tracking-wider text-champagne mb-12">Follow the Sound</h2>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {platforms.map((platform, i) => (
            <ScrollReveal key={platform.name} delay={i * 0.08}>
              <a href="#" className="group flex flex-col items-center gap-3 w-24">
                <div className="w-16 h-16 rounded-full glass flex items-center justify-center transition-all duration-400 group-hover:shadow-glow group-hover:border-olive-light/30">
                  <platform.icon className="w-6 h-6 text-champagne group-hover:text-olive-light transition-colors" />
                </div>
                <span className="text-muted-warm text-[10px] tracking-wider uppercase">{platform.name}</span>
              </a>
            </ScrollReveal>
          ))}
        </div>

        <div className="flex justify-center items-end gap-[2px] h-[30px] opacity-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full"
              style={{
                background: `linear-gradient(to top, #6b7c3f, #8b7340)`,
                height: '100%',
                animation: `equalizer ${0.4 + Math.random() * 0.3}s ease-in-out ${i * 0.02}s infinite alternate`,
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ReleasesSection />
      <PerformancesSection />
      <EventsSection />
      <SocialSection />
    </main>
  );
}
