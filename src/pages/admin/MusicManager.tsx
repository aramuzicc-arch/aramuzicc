import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Upload } from 'lucide-react';
import type { Album } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, uploadImage } from '@/lib/api';

type ApiAlbum = Omit<Album, 'id'> & { _id: string };
const normalize = (item: ApiAlbum): Album => ({ ...item, id: item._id });

export default function MusicManager() {
  const [items, setItems] = useState<Album[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', type: 'album', genre: '', releaseDate: '', description: '', coverImage: '' });

  useEffect(() => {
    apiFetch<ApiAlbum[]>('/albums').then((data) => setItems(data.map(normalize))).catch(() => setItems([]));
  }, []);

  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    let coverImage = form.coverImage;
    if (coverFile) {
      const uploaded = await uploadImage(coverFile);
      coverImage = uploaded.url;
    }

    const payload = {
      ...form,
      coverImage: coverImage || '/images/albums/midnight-echo.jpg',
      type: form.type as Album['type'],
      mediaType: form.type === 'video' ? 'video' : 'audio',
    };

    if (editing) {
      const updated = await apiFetch<ApiAlbum>(`/admin/albums/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        auth: true,
      });
      setItems(items.map((i) => (i.id === editing.id ? normalize(updated) : i)));
    } else {
      const created = await apiFetch<ApiAlbum>('/admin/albums', {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: true,
      });
      setItems([normalize(created), ...items]);
    }

    setModalOpen(false);
    setEditing(null);
    setCoverFile(null);
    setForm({ title: '', type: 'album', genre: '', releaseDate: '', description: '', coverImage: '' });
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/admin/albums/${id}`, { method: 'DELETE', auth: true });
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search music..." className="pl-10 bg-transparent border-champagne/20" />
        </div>
        <Button onClick={() => { setEditing(null); setForm({ title: '', type: 'album', genre: '', releaseDate: '', description: '', coverImage: '' }); setModalOpen(true); }} className="bg-olive hover:bg-olive-light text-obsidian">
          <Plus className="w-4 h-4 mr-2" /> Add Music
        </Button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-champagne/10 text-left"><th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Title</th><th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Type</th><th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Genre</th><th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Year</th><th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-champagne/5 hover:bg-champagne/5 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3"><img src={item.coverImage} alt="" className="w-10 h-10 rounded object-cover" /><span className="text-champagne text-sm">{item.title}</span></td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-olive/10 text-olive-light text-[10px] uppercase">{item.type}</span></td>
                <td className="px-6 py-4 text-muted-warm text-sm">{item.genre}</td>
                <td className="px-6 py-4 text-muted-warm text-sm font-mono">{item.releaseDate}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => { setEditing(item); setForm({ title: item.title, type: item.type, genre: item.genre, releaseDate: item.releaseDate, description: item.description, coverImage: item.coverImage }); setModalOpen(true); }} className="text-muted-warm hover:text-champagne mr-3"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(item.id)} className="text-muted-warm hover:text-amber-700"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-xl text-champagne tracking-wider">{editing ? 'Edit Music' : 'Add Music'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="text-muted-warm">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger className="bg-transparent border-champagne/20 mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-obsidian border-champagne/20"><SelectItem value="album">Album</SelectItem><SelectItem value="single">Single</SelectItem><SelectItem value="instrumental">Instrumental</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></div>
            <div><Label className="text-muted-warm">Genre</Label><Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Release Date</Label><Input value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Cover Image</Label><Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="bg-transparent border-champagne/20 mt-1" /></div>
            <Button onClick={handleSave} className="w-full bg-olive hover:bg-olive-light text-obsidian"><Upload className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { MusicManager };
