import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eraser, Plus, Search, Pencil, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, uploadImage } from '@/lib/api';
import { useConsumeNewQuery } from '@/hooks/useConsumeNewQuery';
import { useAdminFormDraft } from '@/hooks/useAdminFormDraft';

type ApiProduct = Omit<Product, 'id'> & { _id: string };
const normalize = (item: ApiProduct): Product => ({ ...item, id: item._id });

type ProductFormState = {
  name: string;
  price: string;
  category: string;
  description: string;
  badge: Product['badge'];
  image: string;
  imagePublicId: string;
};

const DRAFT_KEY = 'admin:draft:products';

export default function ProductManager() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    price: '',
    category: 'clothing',
    description: '',
    badge: 'none',
    image: '',
    imagePublicId: '',
  });

  const getEmpty = useCallback((): ProductFormState => {
    return { name: '', price: '', category: 'clothing', description: '', badge: 'none', image: '', imagePublicId: '' };
  }, []);

  const { clearDraft, flushDraft } = useAdminFormDraft({
    storageKey: DRAFT_KEY,
    active: modalOpen && !editing,
    form: form as unknown as Record<string, unknown>,
    setForm: setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>,
    getEmpty: () => getEmpty() as unknown as Record<string, unknown>,
  });

  useEffect(() => {
    apiFetch<ApiProduct[]>('/products').then((data) => setItems(data.map(normalize))).catch(() => setItems([]));
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setImageFile(null);
    setModalOpen(true);
  };

  useConsumeNewQuery(() => openCreateModal());

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    setSavePending(true);
    try {
      let image = form.image;
      let imagePublicId = form.imagePublicId;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image = uploaded.url;
        imagePublicId = uploaded.publicId;
      }
      if (!image.trim()) {
        toast.error('Product image is required. Upload to Cloudinary.');
        return;
      }

      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        badge: form.badge,
        image,
        imagePublicId,
      };

      try {
        if (editing) {
          const updated = await apiFetch<ApiProduct>(`/admin/products/${editing.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            auth: true,
          });
          setItems(items.map((i) => (i.id === editing.id ? normalize(updated) : i)));
          toast.success('Product updated.');
        } else {
          const created = await apiFetch<ApiProduct>('/admin/products', {
            method: 'POST',
            body: JSON.stringify(payload),
            auth: true,
          });
          setItems([normalize(created), ...items]);
          toast.success('Product added.');
        }
        const wasNew = !editing;
        setModalOpen(false);
        setEditing(null);
        setImageFile(null);
        if (wasNew) clearDraft();
        else setForm(getEmpty());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save product.');
      }
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE', auth: true });
      setItems(items.filter((i) => i.id !== id));
      toast.success('Product removed.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete.');
    }
  };

  return (
    <div className="space-y-6">
      <Button
        type="button"
        size="lg"
        onClick={() => openCreateModal()}
        className="w-full sm:w-auto min-h-[52px] px-8 bg-olive hover:bg-olive-light text-white hover:text-white text-base font-semibold shadow-lg shadow-black/25 ring-2 ring-olive-light/50"
      >
        <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
        Add new product
      </Button>
      <p className="text-muted-warm text-sm max-w-xl">
        Same as the green <strong className="text-champagne">Add product</strong> button in the top bar. Photos go to{' '}
        <strong className="text-champagne">Cloudinary</strong>. Unsaved new products stay in this browser until you save
        or clear the form.
      </p>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10 bg-transparent border-champagne/20"
        />
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
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setForm({
                        name: item.name,
                        price: String(item.price),
                        category: item.category,
                        description: item.description,
                        badge: item.badge || 'none',
                        image: item.image,
                        imagePublicId: item.imagePublicId || '',
                      });
                      setImageFile(null);
                      setModalOpen(true);
                    }}
                    className="text-muted-warm hover:text-champagne"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="text-muted-warm hover:text-amber-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(o) => {
          if (!o && !editing) flushDraft();
          setModalOpen(o);
          if (!o) {
            setEditing(null);
            setImageFile(null);
          }
        }}
      >
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-champagne tracking-wider">
              {editing ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-muted-warm">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>
            <div>
              <Label className="text-muted-warm">Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>
            <div>
              <Label className="text-muted-warm">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-transparent border-champagne/20 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-champagne/20">
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-warm">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>
            <div>
              <Label className="text-muted-warm">Badge</Label>
              <Select value={form.badge} onValueChange={(v) => setForm({ ...form, badge: v as Product['badge'] })}>
                <SelectTrigger className="bg-transparent border-champagne/20 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-champagne/20">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-warm">Image (Cloudinary)</Label>
              {form.image ? <img src={form.image} alt="" className="w-24 h-24 object-cover rounded mt-2 border border-champagne/20" /> : null}
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="bg-transparent border-champagne/20 mt-1" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              {!editing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-champagne/25 text-champagne hover:bg-champagne/10"
                  onClick={() => {
                    clearDraft();
                    setImageFile(null);
                    toast.message('Form cleared', { description: 'Draft removed from this browser.' });
                  }}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Clear form
                </Button>
              ) : null}
              <SubmitButton
                type="button"
                pending={savePending}
                onClick={handleSave}
                className="w-full sm:w-auto bg-olive hover:bg-olive-light text-white hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Save
              </SubmitButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
