import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch, uploadImage } from '@/lib/api';

type TimelineRow = { year: string; title: string; description: string; order: number };
type StatRow = { value: number; suffix: string; label: string; order: number };

type SiteForm = {
  aboutHeroTagline: string;
  aboutHeroImage: string;
  aboutHeroImagePublicId: string;
  aboutPortraitImage: string;
  aboutPortraitImagePublicId: string;
  aboutBioParagraphs: string[];
  timeline: TimelineRow[];
  stats: StatRow[];
};

export default function AboutContentManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bioText, setBioText] = useState('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [form, setForm] = useState<SiteForm>({
    aboutHeroTagline: '',
    aboutHeroImage: '',
    aboutHeroImagePublicId: '',
    aboutPortraitImage: '',
    aboutPortraitImagePublicId: '',
    aboutBioParagraphs: [],
    timeline: [],
    stats: [],
  });

  useEffect(() => {
    apiFetch<SiteForm>('/admin/site-content', { auth: true })
      .then((data) => {
        setForm({
          aboutHeroTagline: data.aboutHeroTagline,
          aboutHeroImage: data.aboutHeroImage,
          aboutHeroImagePublicId: data.aboutHeroImagePublicId || '',
          aboutPortraitImage: data.aboutPortraitImage,
          aboutPortraitImagePublicId: data.aboutPortraitImagePublicId || '',
          aboutBioParagraphs: data.aboutBioParagraphs,
          timeline: [...data.timeline].sort((a, b) => a.order - b.order),
          stats: [...data.stats].sort((a, b) => a.order - b.order),
        });
        setBioText(data.aboutBioParagraphs.join('\n\n'));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const paragraphs = bioText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    let aboutHeroImage = form.aboutHeroImage;
    let aboutHeroImagePublicId = form.aboutHeroImagePublicId;
    if (heroFile) {
      const up = await uploadImage(heroFile);
      aboutHeroImage = up.url;
      aboutHeroImagePublicId = up.publicId;
    }

    let aboutPortraitImage = form.aboutPortraitImage;
    let aboutPortraitImagePublicId = form.aboutPortraitImagePublicId;
    if (portraitFile) {
      const up = await uploadImage(portraitFile);
      aboutPortraitImage = up.url;
      aboutPortraitImagePublicId = up.publicId;
    }

    setSaving(true);
    try {
      await apiFetch('/admin/site-content', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({
          ...form,
          aboutHeroImage,
          aboutHeroImagePublicId,
          aboutPortraitImage,
          aboutPortraitImagePublicId,
          aboutBioParagraphs: paragraphs,
        }),
      });
      setForm((f) => ({
        ...f,
        aboutHeroImage,
        aboutHeroImagePublicId,
        aboutPortraitImage,
        aboutPortraitImagePublicId,
        aboutBioParagraphs: paragraphs,
      }));
      setHeroFile(null);
      setPortraitFile(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-warm text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-4xl space-y-10">
      <p className="text-muted-warm text-sm">
        Hero and portrait images are uploaded to <strong className="text-champagne">Cloudinary</strong>. Saving with a
        new file removes the previous Cloudinary asset on the server.
      </p>

      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="font-display text-lg text-champagne tracking-wider">Hero</h3>
        <div>
          <Label className="text-muted-warm text-xs uppercase">Tagline (script text under THE STORY)</Label>
          <Input
            value={form.aboutHeroTagline}
            onChange={(e) => setForm({ ...form, aboutHeroTagline: e.target.value })}
            className="bg-transparent border-champagne/20 mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-warm text-xs uppercase">Hero background (Cloudinary)</Label>
          {form.aboutHeroImage ? (
            <img
              src={form.aboutHeroImage}
              alt=""
              className="mt-2 w-full max-h-40 object-cover rounded-lg border border-champagne/15"
            />
          ) : (
            <p className="text-muted-warm text-xs mt-2">No image — public About page uses a gradient until you upload.</p>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
            className="mt-2 bg-transparent border-champagne/20"
          />
        </div>
        <div>
          <Label className="text-muted-warm text-xs uppercase">Portrait (bio column, Cloudinary)</Label>
          {form.aboutPortraitImage ? (
            <img
              src={form.aboutPortraitImage}
              alt=""
              className="mt-2 w-40 aspect-[3/4] object-cover rounded-lg border border-champagne/15"
            />
          ) : (
            <p className="text-muted-warm text-xs mt-2">Optional — placeholder block if empty.</p>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPortraitFile(e.target.files?.[0] || null)}
            className="mt-2 bg-transparent border-champagne/20"
          />
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-2">
        <h3 className="font-display text-lg text-champagne tracking-wider mb-2">Bio</h3>
        <p className="text-muted-warm text-xs mb-2">Separate paragraphs with a blank line.</p>
        <Textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          rows={12}
          className="bg-transparent border-champagne/20 font-body text-sm"
        />
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-champagne tracking-wider">Timeline</h3>
          <Button
            type="button"
            variant="outline"
            className="border-champagne/20 text-champagne"
            onClick={() =>
              setForm({
                ...form,
                timeline: [
                  ...form.timeline,
                  { year: '', title: '', description: '', order: form.timeline.length },
                ],
              })
            }
          >
            Add row
          </Button>
        </div>
        <div className="space-y-3">
          {form.timeline.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border border-champagne/10 rounded-lg p-3">
              <div className="md:col-span-2">
                <Label className="text-[10px] uppercase text-muted-warm">Year</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1800}
                  max={2200}
                  step={1}
                  placeholder="Year"
                  value={row.year}
                  onChange={(e) => {
                    const timeline = [...form.timeline];
                    timeline[idx] = { ...row, year: e.target.value };
                    setForm({ ...form, timeline });
                  }}
                  className="bg-transparent border-champagne/20 mt-1 [color-scheme:dark] font-mono tabular-nums"
                />
              </div>
              <div className="md:col-span-3">
                <Label className="text-[10px] uppercase text-muted-warm">Title</Label>
                <Input
                  value={row.title}
                  onChange={(e) => {
                    const timeline = [...form.timeline];
                    timeline[idx] = { ...row, title: e.target.value };
                    setForm({ ...form, timeline });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-5">
                <Label className="text-[10px] uppercase text-muted-warm">Description</Label>
                <Input
                  value={row.description}
                  onChange={(e) => {
                    const timeline = [...form.timeline];
                    timeline[idx] = { ...row, description: e.target.value };
                    setForm({ ...form, timeline });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Label className="text-[10px] uppercase text-muted-warm">Order</Label>
                <Input
                  type="number"
                  value={row.order}
                  onChange={(e) => {
                    const timeline = [...form.timeline];
                    timeline[idx] = { ...row, order: Number(e.target.value) || 0 };
                    setForm({ ...form, timeline });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-amber-700"
                  onClick={() =>
                    setForm({
                      ...form,
                      timeline: form.timeline.filter((_, i) => i !== idx),
                    })
                  }
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-champagne tracking-wider">By the numbers</h3>
          <Button
            type="button"
            variant="outline"
            className="border-champagne/20 text-champagne"
            onClick={() =>
              setForm({
                ...form,
                stats: [
                  ...form.stats,
                  { value: 0, suffix: '', label: 'NEW', order: form.stats.length },
                ],
              })
            }
          >
            Add stat
          </Button>
        </div>
        <div className="space-y-3">
          {form.stats.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border border-champagne/10 rounded-lg p-3">
              <div className="md:col-span-3">
                <Label className="text-[10px] uppercase text-muted-warm">Value (number)</Label>
                <Input
                  type="number"
                  value={row.value}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[idx] = { ...row, value: Number(e.target.value) || 0 };
                    setForm({ ...form, stats });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[10px] uppercase text-muted-warm">Suffix</Label>
                <Input
                  value={row.suffix}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[idx] = { ...row, suffix: e.target.value };
                    setForm({ ...form, stats });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-4">
                <Label className="text-[10px] uppercase text-muted-warm">Label</Label>
                <Input
                  value={row.label}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[idx] = { ...row, label: e.target.value };
                    setForm({ ...form, stats });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[10px] uppercase text-muted-warm">Order</Label>
                <Input
                  type="number"
                  value={row.order}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[idx] = { ...row, order: Number(e.target.value) || 0 };
                    setForm({ ...form, stats });
                  }}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-amber-700"
                  onClick={() =>
                    setForm({
                      ...form,
                      stats: form.stats.filter((_, i) => i !== idx),
                    })
                  }
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmitButton type="button" pending={saving} onClick={save} className="bg-olive hover:bg-olive-light text-white hover:text-white">
        <Save className="w-4 h-4 mr-2" />
        Save to database
      </SubmitButton>
    </div>
  );
}
