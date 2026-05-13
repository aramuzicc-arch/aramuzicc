import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

type SiteContentPublic = {
  publicPhone?: string;
};

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    artistName: 'ARA MUZICC',
    email: 'management@aramuzicc.music',
    publicPhone: '',
    socialSpotify: 'https://spotify.com',
    socialInstagram: 'https://instagram.com',
    socialYoutube: 'https://youtube.com',
    socialTwitter: 'https://twitter.com',
  });

  useEffect(() => {
    apiFetch<SiteContentPublic>('/admin/site-content', { auth: true })
      .then((data) => {
        setSettings((s) => ({ ...s, publicPhone: data.publicPhone?.trim() ?? '' }));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch('/admin/site-content', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({ publicPhone: settings.publicPhone.trim() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save. Check that you are signed in and the API is running.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="glass rounded-xl p-6 border border-champagne/10 text-muted-warm text-sm space-y-2">
        <p className="text-champagne font-display tracking-wider">Admin email notifications</p>
        <p>
          Contact form submissions, booking requests, and store orders are saved in the database and can trigger an email
          to you when SMTP is configured on the <span className="text-champagne font-mono">server</span>.
        </p>
        <ul className="list-disc pl-5 font-mono text-xs space-y-1 text-champagne/90">
          <li>ADMIN_NOTIFY_EMAIL — inbox that receives alerts</li>
          <li>SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS</li>
          <li>SMTP_SECURE — true for port 465, false for 587</li>
          <li>SMTP_FROM — optional From address</li>
        </ul>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-display text-lg text-champagne tracking-wider">Public contact phone</h3>
        <p className="text-muted-warm text-sm">
          Shown on the <strong className="text-champagne">Contact</strong> and <strong className="text-champagne">Bookings</strong>{' '}
          pages (call / text link). Leave empty to hide the block.
        </p>
        <div>
          <Label className="text-muted-warm text-xs uppercase">Phone number</Label>
          <Input
            value={settings.publicPhone}
            onChange={(e) => setSettings({ ...settings, publicPhone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            disabled={loading}
            className="bg-transparent border-champagne/20 mt-1 max-w-md"
          />
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-display text-lg text-champagne tracking-wider">General Settings</h3>
        <p className="text-muted-warm text-xs">
          Artist name and email below are for your reference only — they are not saved to the server yet.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label className="text-muted-warm text-xs uppercase">Artist Name</Label>
            <Input
              value={settings.artistName}
              onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
              className="bg-transparent border-champagne/20 mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-warm text-xs uppercase">Contact Email (reference)</Label>
            <Input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="bg-transparent border-champagne/20 mt-1"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-display text-lg text-champagne tracking-wider">Social Links</h3>
        <p className="text-muted-warm text-xs">Reference only — not persisted to the API yet.</p>
        <div className="space-y-4">
          {(['socialSpotify', 'socialInstagram', 'socialYoutube', 'socialTwitter'] as const).map((key) => (
            <div key={key}>
              <Label className="text-muted-warm text-xs uppercase">{key.replace('social', '')}</Label>
              <Input
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SubmitButton
          type="button"
          onClick={handleSave}
          pending={saving}
          disabled={loading}
          className="bg-olive hover:bg-olive-light text-white hover:text-white"
        >
          <Save className="w-4 h-4 mr-2" /> Save phone to site
        </SubmitButton>
        {saved && <span className="text-emerald-400 text-sm">Public phone saved.</span>}
      </div>
    </div>
  );
}
