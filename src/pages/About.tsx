import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from '@/components/ScrollReveal';
import CountUp from 'react-countup';
import { apiFetch } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

type TimelineRow = { year: string; title: string; description: string; order: number };
type StatRow = { value: number; suffix: string; label: string; order: number };

type SitePayload = {
  aboutHeroTagline: string;
  aboutHeroImage: string;
  aboutPortraitImage: string;
  aboutBioParagraphs: string[];
  timeline: TimelineRow[];
  stats: StatRow[];
};

function AboutHero({ tagline, image }: { tagline: string; image: string }) {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        {image ? (
          <>
            <img src={image} alt="ARA MUZICC" className="w-full h-full object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-olive/20 to-obsidian" />
        )}
      </div>
      <div className="relative z-10 px-[4vw] py-20 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-display text-[clamp(60px,10vw,160px)] leading-none tracking-[0.05em] text-champagne"
        >
          THE STORY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-script text-xl md:text-2xl text-olive-light mt-6"
        >
          {tagline}
        </motion.p>
      </div>
    </section>
  );
}

function BioSection({ portrait, paragraphs }: { portrait: string; paragraphs: string[] }) {
  return (
    <section className="relative py-20 bg-obsidian">
      <div className="px-[4vw] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="relative">
              {portrait ? (
                <img
                  src={portrait}
                  alt="ARA MUZICC Artist Portrait"
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[3/4] rounded-lg bg-gradient-to-br from-champagne/10 to-olive/20 border border-champagne/10" />
              )}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-olive-light/30 rounded-lg" />
            </div>
          </ScrollReveal>
          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-4xl md:text-6xl tracking-wider text-champagne">Bio</h2>
            </ScrollReveal>
            {paragraphs.map((p, i) => (
              <ScrollReveal key={i} delay={0.15 + i * 0.08}>
                <p className="text-muted-warm font-body leading-relaxed">{p}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineSection({ timeline }: { timeline: TimelineRow[] }) {
  const sorted = [...timeline].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <section className="relative py-20 bg-gradient-to-b from-obsidian to-olive/10">
      <div className="px-[4vw] max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider text-champagne mb-16 text-center">Timeline</h2>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-champagne/10" />
          {sorted.map((milestone, i) => (
            <ScrollReveal key={`${milestone.year}-${milestone.title}-${i}`} delay={i * 0.1}>
              <div className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-12 md:pl-0`}>
                  <span className="font-mono text-2xl text-olive-light">{milestone.year}</span>
                  <h3 className="font-display text-xl text-champagne tracking-wider mt-1">{milestone.title}</h3>
                  <p className="text-muted-warm text-sm mt-1">{milestone.description}</p>
                </div>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-olive border-4 border-obsidian" />
                <div className="hidden md:block flex-1" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: StatRow[] }) {
  const sorted = [...stats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <section className="relative py-32 bg-obsidian">
      <div className="px-[4vw] max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="section-header text-center mb-20">By the Numbers</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {sorted.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.15}>
              <div className="text-center">
                <div className="font-display text-[clamp(48px,8vw,100px)] text-olive-light leading-none">
                  <CountUp end={stat.value} duration={2} suffix={stat.suffix} enableScrollSpy scrollSpyOnce />
                </div>
                <p className="text-muted-warm text-[11px] tracking-[0.2em] uppercase mt-4">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function About() {
  const [site, setSite] = useState<SitePayload | null>(null);

  useEffect(() => {
    apiFetch<SitePayload>('/site-content')
      .then(setSite)
      .catch(() => setSite(null));
  }, []);

  if (!site) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center bg-obsidian text-muted-warm text-sm">
        Loading…
      </main>
    );
  }

  return (
    <main>
      <AboutHero tagline={site.aboutHeroTagline} image={site.aboutHeroImage} />
      <BioSection portrait={site.aboutPortraitImage} paragraphs={site.aboutBioParagraphs} />
      <TimelineSection timeline={site.timeline} />
      <StatsSection stats={site.stats} />
    </main>
  );
}
