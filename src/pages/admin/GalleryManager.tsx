import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Upload } from 'lucide-react';
import type { GalleryItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, uploadImage } from '@/lib/api';

type ApiGalleryItem = Omit<GalleryItem, 'id'> & { _id: string };
const normalize = (item: ApiGalleryItem): GalleryItem => ({ ...item, id: item._id });

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', type: 'photo' as 'photo' | 'video', url: '' });

  useEffect(() => {
    apiFetch<ApiGalleryItem[]>('/gallery').then((data) => setItems(data.map(normalize))).catch(() => setItems([]));
  }, []);

  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    let url = form.url;
    if (file) {
      const uploaded = await uploadImage(file);
      url = uploaded.url;
    }
    if (!form.title || !url) return;

    const created = await apiFetch<ApiGalleryItem>('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify({ title: form.title, type: form.type, url, thumbnail: url }),
      auth: true,
    });

    setItems([normalize(created), ...items]);
    setModalOpen(false);
    setFile(null);
    setForm({ title: '', type: 'photo', url: '' });
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/admin/gallery/${id}`, { method: 'DELETE', auth: true });
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery..." className="pl-10 bg-transparent border-champagne/20" />
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-olive hover:bg-olive-light text-obsidian">
          <Plus className="w-4 h-4 mr-2" /> Upload
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden group relative">
            <img src={item.url} alt={item.title} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button onClick={() => handleDelete(item.id)} className="text-amber-700 hover:text-amber-700/80">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-champagne text-xs truncate">{item.title}</p>
              <span className="text-muted-warm text-[10px] uppercase">{item.type}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-xl text-champagne tracking-wider">Upload Media</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="text-muted-warm">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Image File</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Or Image URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="bg-transparent border-champagne/20 mt-1" placeholder="https://..." /></div>
            <div><Label className="text-muted-warm">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'photo' | 'video' })}>
                <SelectTrigger className="bg-transparent border-champagne/20 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-obsidian border-champagne/20">
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full bg-olive hover:bg-olive-light text-obsidian"><Upload className="w-4 h-4 mr-2" />Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
