import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Upload } from 'lucide-react';
import type { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, uploadImage } from '@/lib/api';

type ApiProduct = Omit<Product, 'id'> & { _id: string };
const normalize = (item: ApiProduct): Product => ({ ...item, id: item._id });

export default function ProductManager() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'clothing', description: '', badge: 'none', image: '' });

  useEffect(() => {
    apiFetch<ApiProduct[]>('/products').then((data) => setItems(data.map(normalize))).catch(() => setItems([]));
  }, []);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    let image = form.image;
    if (imageFile) {
      const uploaded = await uploadImage(imageFile);
      image = uploaded.url;
    }

    const payload = {
      ...form,
      image,
      price: Number(form.price),
      badge: form.badge as Product['badge'],
    };

    if (editing) {
      const updated = await apiFetch<ApiProduct>(`/admin/products/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        auth: true,
      });
      setItems(items.map((i) => (i.id === editing.id ? normalize(updated) : i)));
    } else {
      const created = await apiFetch<ApiProduct>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
        auth: true,
      });
      setItems([normalize(created), ...items]);
    }

    setModalOpen(false);
    setEditing(null);
    setImageFile(null);
    setForm({ name: '', price: '', category: 'clothing', description: '', badge: 'none', image: '' });
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/admin/products/${id}`, { method: 'DELETE', auth: true });
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-10 bg-transparent border-champagne/20" />
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-olive hover:bg-olive-light text-obsidian">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden group">
            <div className="relative aspect-square">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-champagne text-sm font-medium">{item.name}</h3>
              <p className="text-muted-warm text-xs mt-1">{item.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-olive-light font-semibold">${item.price}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(item); setForm({ name: item.name, price: String(item.price), category: item.category, description: item.description, badge: item.badge || 'none', image: item.image }); setModalOpen(true); }} className="text-muted-warm hover:text-champagne"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-muted-warm hover:text-amber-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-xl text-champagne tracking-wider">{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="text-muted-warm">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-transparent border-champagne/20 mt-1" /></div>
            <div><Label className="text-muted-warm">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-transparent border-champagne/20 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-obsidian border-champagne/20">
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-muted-warm">Image</Label><Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="bg-transparent border-champagne/20 mt-1" /></div>
            <Button onClick={handleSave} className="w-full bg-olive hover:bg-olive-light text-obsidian"><Upload className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
