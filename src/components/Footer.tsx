import { Link } from 'react-router';
import { Music, Instagram, Youtube, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-obsidian overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display text-[20vw] text-champagne/[0.03] tracking-[0.1em]">ARA MUZICC</span>
      </div>

      <div className="relative px-[4vw] pt-20 pb-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-olive-light text-[11px] tracking-[0.3em] uppercase font-body mb-4">Join the Wave</p>
          <div className="flex items-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-b border-champagne/30 pb-2 text-champagne text-sm font-body placeholder:text-muted-warm/50 focus:outline-none focus:border-olive-light transition-colors"
            />
            <button className="bg-olive text-obsidian px-6 py-2 rounded-full text-[11px] tracking-[0.15em] uppercase font-body hover:bg-olive-light transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-12">
          {[
            { icon: Music, label: 'Spotify' },
            { icon: Instagram, label: 'Instagram' },
            { icon: Youtube, label: 'YouTube' },
            { icon: Twitter, label: 'Twitter' },
          ].map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-warm hover:text-olive-light hover:border-olive-light/30 transition-all"
              aria-label={label}
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-champagne/10">
          <p className="text-muted-warm text-[10px] tracking-[0.15em] uppercase">
            2025 ARA MUZICC. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Admin'].map((item) => (
              <Link
                key={item}
                to={item === 'Admin' ? '/admin' : '#'}
                className="text-muted-warm text-[10px] tracking-[0.15em] uppercase hover:text-champagne transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
