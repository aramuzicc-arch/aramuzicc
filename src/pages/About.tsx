import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollReveal from '@/components/ScrollReveal';
import { MILESTONES } from '@/types';
import CountUp from 'react-countup';

gsap.registerPlugin(ScrollTrigger);

function AboutHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/gallery/gallery1.jpg" alt="ARA MUZICC" className="w-full h-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />
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
          Music is the language of the soul, and I&apos;m here to make it scream.
        </motion.p>
      </div>
    </section>
  );
}

function BioSection() {
  return (
    <section className="relative py-20 bg-obsidian">
      <div className="px-[4vw] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="relative">
              <img
                src="/images/gallery/gallery3.jpg"
                alt="ARA MUZICC Artist Portrait"
                className="w-full aspect-[3/4] object-cover rounded-lg"
                loading="lazy"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-olive-light/30 rounded-lg" />
            </div>
          </ScrollReveal>
          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-4xl md:text-6xl tracking-wider text-champagne">Bio</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-muted-warm font-body leading-relaxed">
                Born from the underground music scene of Los Angeles, ARA MUZICC emerged as a force that defies genre boundaries. Starting as a self-taught guitarist at age 14, the journey from bedroom recordings to sold-out arenas has been nothing short of extraordinary.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-muted-warm font-body leading-relaxed">
                With a sound that fuses alternative rock, electronic production, and virtuosic guitar work, ARA MUZICC has created a sonic identity that is unmistakably unique. Each album represents a chapter in an evolving story - from the raw energy of &quot;PRISM&quot; (2021) to the sophisticated darkness of &quot;MIDNIGHT ECHO&quot; (2025).
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <p className="text-muted-warm font-body leading-relaxed">
                The live experience is where ARA MUZICC truly comes alive. Known for immersive stage designs, pyrotechnic displays, and extended improvisational sections, every show is a one-of-a-kind event that leaves audiences transformed.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-obsidian to-olive/10">
      <div className="px-[4vw] max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider text-champagne mb-16 text-center">Timeline</h2>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-champagne/10" />
          {MILESTONES.map((milestone, i) => (
            <ScrollReveal key={milestone.year} delay={i * 0.1}>
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

function StatsSection() {
  const stats = [
    { value: 500, suffix: 'M+', label: 'STREAMS' },
    { value: 50, suffix: '+', label: 'COUNTRIES' },
    { value: 200, suffix: '+', label: 'LIVE SHOWS' },
    { value: 4, suffix: '', label: 'ALBUMS' },
  ];

  return (
    <section className="relative py-32 bg-obsidian">
      <div className="px-[4vw] max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="section-header text-center mb-20">By the Numbers</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
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
  return (
    <main>
      <AboutHero />
      <BioSection />
      <TimelineSection />
      <StatsSection />
    </main>
  );
}
