import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eraser, Plus, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { GalleryItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, uploadImage, uploadVideo } from '@/lib/api';
import { useConsumeNewQuery } from '@/hooks/useConsumeNewQuery';
import { useAdminFormDraft } from '@/hooks/useAdminFormDraft';

type ApiGalleryItem = Omit<GalleryItem, 'id'> & { _id: string };
const normalize = (item: ApiGalleryItem): GalleryItem => ({ ...item, id: item._id });

type GalleryFormState = { title: string; type: 'photo' | 'video' };

const DRAFT_KEY = 'admin:draft:gallery';

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [form, setForm] = useState<GalleryFormState>({ title: '', type: 'photo' });

  const getEmpty = useCallback((): GalleryFormState => ({ title: '', type: 'photo' }), []);

  const { clearDraft, flushDraft } = useAdminFormDraft({
    storageKey: DRAFT_KEY,
    active: modalOpen,
    form: form as unknown as Record<string, unknown>,
    setForm: setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>,
    getEmpty: () => getEmpty() as unknown as Record<string, unknown>,
  });

  useEffect(() => {
    apiFetch<ApiGalleryItem[]>('/gallery').then((data) => setItems(data.map(normalize))).catch(() => setItems([]));
  }, []);

  const openCreateModal = () => {
    setFile(null);
    setModalOpen(true);
  };

  useConsumeNewQuery(() => openCreateModal());

  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!file) {
      toast.error('Choose a file to upload to Cloudinary.');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    setSavePending(true);
    try {
      let uploaded: { url: string; publicId: string; resourceType: 'image' | 'video'; thumbnailUrl?: string };
      if (form.type === 'video') {
        uploaded = await uploadVideo(file);
      } else {
        uploaded = await uploadImage(file);
      }

      const thumbnail = form.type === 'video' ? uploaded.thumbnailUrl || uploaded.url : uploaded.url;

      try {
        const created = await apiFetch<ApiGalleryItem>('/admin/gallery', {
          method: 'POST',
          body: JSON.stringify({
            title: form.title,
            type: form.type,
            url: uploaded.url,
            thumbnail,
            urlPublicId: uploaded.publicId,
            urlResourceType: uploaded.resourceType,
          }),
          auth: true,
        });

        setItems([normalize(created), ...items]);
        toast.success('Gallery item added.');
        setModalOpen(false);
        setFile(null);
        clearDraft();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not add gallery item.');
      }
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/admin/gallery/${id}`, { method: 'DELETE', auth: true });
      setItems(items.filter((i) => i.id !== id));
      toast.success('Removed from gallery.');
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
        Add new gallery item
      </Button>
      <p className="text-muted-warm text-sm max-w-xl">
        Same as the green <strong className="text-champagne">Add gallery item</strong> button in the top bar. Files are
        stored on <strong className="text-champagne">Cloudinary</strong> only. Title and type are remembered if you close
        this window; the file must be chosen again before upload.
      </p>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gallery..."
          className="pl-10 bg-transparent border-champagne/20"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="glass rounded-xl overflow-hidden group relative">
            {item.type === 'video' ? (
              <video src={item.url} poster={item.thumbnail} className="w-full aspect-square object-cover" muted playsInline />
            ) : (
              <img src={item.url} alt={item.title} className="w-full aspect-square object-cover" />
            )}
            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => handleDelete(item.id)} className="text-amber-700 hover:text-amber-700/80">
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

      <Dialog
        open={modalOpen}
        onOpenChange={(o) => {
          if (!o) flushDraft();
          setModalOpen(o);
          if (!o) setFile(null);
        }}
      >
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-champagne tracking-wider">Add gallery item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-muted-warm">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-warm">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'photo' | 'video' })}>
                <SelectTrigger className="bg-transparent border-champagne/20 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-champagne/20">
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-warm">File</Label>
              <Input
                type="file"
                accept={form.type === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-champagne/25 text-champagne hover:bg-champagne/10"
                onClick={() => {
                  clearDraft();
                  setFile(null);
                  toast.message('Form cleared', { description: 'Draft removed from this browser.' });
                }}
              >
                <Eraser className="w-4 h-4 mr-2" />
                Clear form
              </Button>
              <SubmitButton
                type="button"
                pending={savePending}
                onClick={handleSave}
                className="w-full sm:w-auto bg-olive hover:bg-olive-light text-white hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add to gallery
              </SubmitButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
