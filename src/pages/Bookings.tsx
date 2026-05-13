import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic2,
  Guitar,
  Music,
  Calendar,
  MapPin,
  Users,
  Send,
  Check,
  Clapperboard,
  PartyPopper,
  Phone,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { apiFetch } from '@/lib/api';
import { telHref } from '@/lib/telLink';
import { NativeSubmitButton } from '@/components/ui/submit-button';

const EVENT_TYPES = [
  { id: 'live_show', label: 'Live Show', icon: Mic2 },
  { id: 'studio_session', label: 'Studio Session', icon: Music },
  { id: 'guitar_session', label: 'Guitar Session', icon: Guitar },
  { id: 'production', label: 'Production', icon: Clapperboard },
  { id: 'event', label: 'Special Event', icon: PartyPopper },
];

function BookingsHero({ publicPhone }: { publicPhone: string }) {
  const tel = telHref(publicPhone);
  return (
    <section className="relative min-h-[40vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-olive/25 to-obsidian" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(139,115,64,0.3),transparent_55%)]" />
      <div className="absolute inset-0 bg-obsidian/70" />
      <div className="relative z-10 px-[4vw] py-20">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-display text-[clamp(48px,10vw,140px)] leading-none tracking-[0.05em] text-champagne"
        >
          BOOK THE ARTIST
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-warm text-base mt-4 max-w-lg"
        >
          Available for live shows, studio sessions, and special events worldwide
        </motion.p>
        {publicPhone.trim() && tel ? (
          <motion.a
            href={tel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="inline-flex items-center gap-2 mt-6 text-olive-light text-sm font-body hover:text-champagne transition-colors"
          >
            <Phone className="w-4 h-4" />
            {publicPhone.trim()}
          </motion.a>
        ) : null}
      </div>
    </section>
  );
}

function BookingForm({ publicPhone }: { publicPhone: string }) {
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [eventType, setEventType] = useState('live_show');
  const tel = telHref(publicPhone);
  const [form, setForm] = useState<{
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    eventName: string;
    date: string;
    budget: 'under_5k' | '5k_10k' | '10k_25k' | '25k_plus' | 'negotiable';
    location: string;
    attendance: string;
    notes: string;
  }>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    eventName: '',
    date: '',
    budget: 'negotiable',
    location: '',
    attendance: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          eventType: eventType as 'live_show' | 'studio_session' | 'guitar_session' | 'production' | 'event',
        }),
      });
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="relative py-20 bg-obsidian">
      <div className="px-[4vw] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <ScrollReveal>
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-16 h-16 rounded-full bg-olive/20 flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-olive-light" />
                  </div>
                  <h3 className="font-display text-3xl text-champagne tracking-wider">REQUEST SENT</h3>
                  <p className="text-muted-warm mt-2">We&apos;ll respond within 24-48 hours</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <fieldset disabled={isSending} className="space-y-8 border-0 p-0 m-0 min-w-0 disabled:opacity-75">
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-4 block">Event Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {EVENT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setEventType(type.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                            eventType === type.id
                              ? 'border-olive-light bg-olive/10 shadow-glow'
                              : 'border-champagne/10 hover:border-champagne/30'
                          }`}
                        >
                          <type.icon className={`w-6 h-6 ${eventType === type.id ? 'text-olive-light' : 'text-muted-warm'}`} />
                          <span
                            className={`text-[10px] tracking-wider uppercase ${eventType === type.id ? 'text-champagne' : 'text-muted-warm'}`}
                          >
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Your name</label>
                      <input
                        type="text"
                        required
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Your email</label>
                      <input
                        type="email"
                        required
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">
                      Your phone <span className="normal-case tracking-normal text-champagne/50">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      placeholder="+1 …"
                      className="w-full max-w-md bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Event Name</label>
                      <input
                        type="text"
                        value={form.eventName}
                        onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                        className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">
                        Preferred date &amp; time
                      </label>
                      <input
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full min-h-[42px] rounded-md border border-champagne/30 bg-transparent px-3 py-2 font-mono text-sm text-champagne tabular-nums focus:outline-none focus:border-olive-light transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Budget Range</label>
                      <select
                        value={form.budget}
                        onChange={(e) => setForm({ ...form, budget: e.target.value as typeof form.budget })}
                        className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                      >
                        <option value="under_5k" className="bg-obsidian">Under $5,000</option>
                        <option value="5k_10k" className="bg-obsidian">$5,000 - $10,000</option>
                        <option value="10k_25k" className="bg-obsidian">$10,000 - $25,000</option>
                        <option value="25k_plus" className="bg-obsidian">$25,000+</option>
                        <option value="negotiable" className="bg-obsidian">Negotiable</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Expected Attendance</label>
                    <input
                      type="number"
                      value={form.attendance}
                      onChange={(e) => setForm({ ...form, attendance: e.target.value })}
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Additional Notes</label>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors resize-none"
                    />
                  </div>

                  <NativeSubmitButton
                    type="submit"
                    pending={isSending}
                    className="w-full bg-olive text-white py-4 rounded-full text-[11px] tracking-[0.2em] uppercase font-body hover:bg-olive-light hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Request Booking
                  </NativeSubmitButton>
                  </fieldset>
                </form>
              )}
            </ScrollReveal>
          </div>

          <div className="space-y-8">
            {publicPhone.trim() && tel ? (
              <ScrollReveal delay={0.1}>
                <div className="glass rounded-lg p-6">
                  <h3 className="font-display text-xl text-champagne tracking-wider mb-2">Call or text</h3>
                  <a href={tel} className="text-olive-light text-lg font-body hover:text-champagne transition-colors inline-flex items-center gap-2">
                    <Phone className="w-5 h-5 shrink-0" />
                    {publicPhone.trim()}
                  </a>
                  <p className="text-muted-warm text-xs mt-3 leading-relaxed">
                    Prefer email? Use the form — or reach this number for urgent booking questions.
                  </p>
                </div>
              </ScrollReveal>
            ) : null}

            <ScrollReveal delay={0.2}>
              <div className="glass rounded-lg p-6">
                <h3 className="font-display text-xl text-champagne tracking-wider mb-4">What to Expect</h3>
                <ul className="space-y-3">
                  {[
                    { icon: Calendar, text: 'Response within 24-48 hours' },
                    { icon: MapPin, text: 'Worldwide availability' },
                    { icon: Users, text: 'Full technical rider provided' },
                    { icon: Mic2, text: 'Hospitality rider included' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-muted-warm text-sm">
                      <Icon className="w-4 h-4 text-olive-light flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="glass rounded-lg p-6">
                <h3 className="font-display text-xl text-champagne tracking-wider mb-4">Past Venues</h3>
                <ul className="space-y-2 text-muted-warm text-sm">
                  {['Madison Square Garden', 'O2 Arena London', 'Coachella', 'Glastonbury', 'Tokyo Dome'].map((venue) => (
                    <li key={venue} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-olive" />
                      {venue}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Bookings() {
  const [publicPhone, setPublicPhone] = useState('');

  useEffect(() => {
    apiFetch<{ publicPhone?: string }>('/site-content')
      .then((data) => setPublicPhone(data.publicPhone?.trim() ?? ''))
      .catch(() => setPublicPhone(''));
  }, []);

  return (
    <main>
      <BookingsHero publicPhone={publicPhone} />
      <BookingForm publicPhone={publicPhone} />
    </main>
  );
}
