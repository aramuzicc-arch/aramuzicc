import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    artistName: 'ARA MUZICC',
    email: 'management@aramuzicc.music',
    socialSpotify: 'https://spotify.com',
    socialInstagram: 'https://instagram.com',
    socialYoutube: 'https://youtube.com',
    socialTwitter: 'https://twitter.com',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-display text-lg text-champagne tracking-wider">General Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div><Label className="text-muted-warm text-xs uppercase">Artist Name</Label><Input value={settings.artistName} onChange={(e) => setSettings({ ...settings, artistName: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
          <div><Label className="text-muted-warm text-xs uppercase">Contact Email</Label><Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <h3 className="font-display text-lg text-champagne tracking-wider">Social Links</h3>
        <div className="space-y-4">
          {(['socialSpotify', 'socialInstagram', 'socialYoutube', 'socialTwitter'] as const).map((key) => (
            <div key={key}>
              <Label className="text-muted-warm text-xs uppercase">{key.replace('social', '')}</Label>
              <Input value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-olive hover:bg-olive-light text-obsidian">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
        {saved && <span className="text-emerald-400 text-sm">Settings saved!</span>}
      </div>
    </div>
  );
}
