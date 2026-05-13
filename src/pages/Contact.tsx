import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Music, Instagram, Youtube, Twitter, Phone } from 'lucide-react';
import CrimsonVoid from '@/components/CrimsonVoid';
import ScrollReveal from '@/components/ScrollReveal';
import { apiFetch } from '@/lib/api';
import { telHref } from '@/lib/telLink';
import { NativeSubmitButton } from '@/components/ui/submit-button';

function ContactHero({ publicPhone }: { publicPhone: string }) {
  const tel = telHref(publicPhone);
  return (
    <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
      <CrimsonVoid />
      <div className="relative z-10 text-center px-[4vw]">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-display text-[clamp(48px,10vw,140px)] leading-none tracking-[0.05em] text-champagne"
        >
          GET IN TOUCH
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-warm text-base mt-4"
        >
          For bookings, press, and collaborations
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

function ContactForm({ publicPhone }: { publicPhone: string }) {
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General', message: '' });
  const tel = telHref(publicPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiFetch('/contact', { method: 'POST', body: JSON.stringify(form) });
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="relative py-20 bg-obsidian">
      <div className="px-[4vw] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-3">
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
                  <h3 className="font-display text-3xl text-champagne tracking-wider">MESSAGE SENT</h3>
                  <p className="text-muted-warm mt-2">We&apos;ll be in touch soon</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <fieldset disabled={isSending} className="space-y-6 border-0 p-0 m-0 min-w-0 disabled:opacity-75">
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">
                      Your phone <span className="normal-case tracking-normal text-champagne/50">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 …"
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors"
                    >
                      <option value="General" className="bg-obsidian">General</option>
                      <option value="Booking" className="bg-obsidian">Booking</option>
                      <option value="Press" className="bg-obsidian">Press</option>
                      <option value="Collaboration" className="bg-obsidian">Collaboration</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors resize-none"
                    />
                  </div>
                  <NativeSubmitButton
                    type="submit"
                    pending={isSending}
                    className="w-full bg-olive text-white py-4 rounded-full text-[11px] tracking-[0.2em] uppercase font-body hover:bg-olive-light hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </NativeSubmitButton>
                  </fieldset>
                </form>
              )}
            </ScrollReveal>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {publicPhone.trim() && tel ? (
              <ScrollReveal delay={0.1}>
                <div>
                  <p className="text-olive-light text-[11px] tracking-[0.3em] uppercase mb-2">Phone</p>
                  <a href={tel} className="text-champagne font-body text-lg hover:text-olive-light transition-colors inline-flex items-center gap-2">
                    <Phone className="w-4 h-4 text-olive-light shrink-0" />
                    {publicPhone.trim()}
                  </a>
                </div>
              </ScrollReveal>
            ) : null}
            <ScrollReveal delay={0.2}>
              <div>
                <p className="text-olive-light text-[11px] tracking-[0.3em] uppercase mb-2">Management</p>
                <a
                  href="mailto:management@aramuzicc.music"
                  className="text-champagne font-body hover:text-olive-light transition-colors"
                >
                  management@aramuzicc.music
                </a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div>
                <p className="text-olive-light text-[11px] tracking-[0.3em] uppercase mb-2">Booking Agent</p>
                <a
                  href="mailto:bookings@aramuzicc.music"
                  className="text-champagne font-body hover:text-olive-light transition-colors"
                >
                  bookings@aramuzicc.music
                </a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div>
                <p className="text-olive-light text-[11px] tracking-[0.3em] uppercase mb-4">Social</p>
                <div className="flex gap-3">
                  {[
                    { icon: Music, label: 'Spotify' },
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Youtube, label: 'YouTube' },
                    { icon: Twitter, label: 'Twitter' },
                  ].map(({ icon: Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-warm hover:text-olive-light transition-colors"
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  const [publicPhone, setPublicPhone] = useState('');

  useEffect(() => {
    apiFetch<{ publicPhone?: string }>('/site-content')
      .then((data) => setPublicPhone(data.publicPhone?.trim() ?? ''))
      .catch(() => setPublicPhone(''));
  }, []);

  return (
    <main>
      <ContactHero publicPhone={publicPhone} />
      <ContactForm publicPhone={publicPhone} />
    </main>
  );
}
