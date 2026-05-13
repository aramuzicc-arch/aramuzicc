import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eraser, Plus, Pencil, Trash2, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch, uploadImage, uploadVideo } from '@/lib/api';
import { useConsumeNewQuery } from '@/hooks/useConsumeNewQuery';
import { useAdminFormDraft } from '@/hooks/useAdminFormDraft';

type LiveShow = {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  imagePublicId?: string;
  videoUrl: string;
  videoPublicId?: string;
  sortOrder: number;
  active: boolean;
};

type LiveFormState = {
  title: string;
  subtitle: string;
  image: string;
  imagePublicId: string;
  videoUrl: string;
  videoPublicId: string;
  sortOrder: number;
  active: boolean;
};

const DRAFT_KEY = 'admin:draft:live-shows';

export default function LiveShowsManager() {
  const [items, setItems] = useState<LiveShow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LiveShow | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [form, setForm] = useState<LiveFormState>({
    title: '',
    subtitle: '',
    image: '',
    imagePublicId: '',
    videoUrl: '',
    videoPublicId: '',
    sortOrder: 0,
    active: true,
  });

  const getEmpty = useCallback(
    (): LiveFormState => ({
      title: '',
      subtitle: '',
      image: '',
      imagePublicId: '',
      videoUrl: '',
      videoPublicId: '',
      sortOrder: items.length,
      active: true,
    }),
    [items.length],
  );

  const { clearDraft, flushDraft } = useAdminFormDraft({
    storageKey: DRAFT_KEY,
    active: open && !editing,
    form: form as unknown as Record<string, unknown>,
    setForm: setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>,
    getEmpty: () => getEmpty() as unknown as Record<string, unknown>,
  });

  const load = () => {
    apiFetch<LiveShow[]>('/admin/live-shows', { auth: true }).then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setImageFile(null);
    setVideoFile(null);
    setOpen(true);
  };

  useConsumeNewQuery(() => openCreateModal());

  const save = async () => {
    setSavePending(true);
    try {
      let image = form.image;
      let imagePublicId = form.imagePublicId;
      if (imageFile) {
        const up = await uploadImage(imageFile);
        image = up.url;
        imagePublicId = up.publicId;
      }

      let videoUrl = form.videoUrl;
      let videoPublicId = form.videoPublicId;
      if (videoFile) {
        const up = await uploadVideo(videoFile);
        videoUrl = up.url;
        videoPublicId = up.publicId;
      }

      if (!image.trim()) {
        toast.error('Poster image is required. Upload a poster to Cloudinary.');
        return;
      }

      const body = {
        title: form.title,
        subtitle: form.subtitle,
        image,
        imagePublicId,
        videoUrl,
        videoPublicId,
        sortOrder: form.sortOrder,
        active: form.active,
      };

      try {
        if (editing) {
          await apiFetch(`/admin/live-shows/${editing._id}`, { method: 'PUT', auth: true, body: JSON.stringify(body) });
          toast.success('Live show updated.');
        } else {
          await apiFetch('/admin/live-shows', { method: 'POST', auth: true, body: JSON.stringify(body) });
          toast.success('Live show added.');
        }
        const wasNew = !editing;
        setOpen(false);
        setEditing(null);
        setImageFile(null);
        setVideoFile(null);
        if (wasNew) clearDraft();
        else setForm(getEmpty());
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save live show.');
      }
    } finally {
      setSavePending(false);
    }
  };

  const del = async (id: string) => {
    try {
      await apiFetch(`/admin/live-shows/${id}`, { method: 'DELETE', auth: true });
      toast.success('Live show removed.');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete.');
    }
  };

  return (
    <div className="space-y-6">
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto min-h-[52px] px-8 bg-olive hover:bg-olive-light text-white hover:text-white text-base font-semibold shadow-lg shadow-black/25 ring-2 ring-olive-light/50"
        onClick={() => openCreateModal()}
      >
        <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
        Add new live show
      </Button>
      <p className="text-muted-warm text-sm max-w-xl">
        Matches the green <strong className="text-champagne">Add live show</strong> control in the top bar. Upload a{' '}
        <strong className="text-champagne">poster image</strong> (required) and optionally a{' '}
        <strong className="text-champagne">Cloudinary video</strong> for the home page. Unsaved new shows are kept in this
        browser until you save or clear the form.
      </p>
      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-champagne/10 text-left text-muted-warm text-[10px] uppercase tracking-wider">
              <th className="px-4 py-3">Poster</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row._id} className="border-b border-champagne/5">
                <td className="px-4 py-2">
                  <img src={row.image} alt="" className="w-14 h-10 object-cover rounded" />
                </td>
                <td className="px-4 py-2 text-champagne">{row.title}</td>
                <td className="px-4 py-2 text-xs text-muted-warm">{row.videoUrl ? 'Yes' : '—'}</td>
                <td className="px-4 py-2 font-mono text-xs">{row.sortOrder}</td>
                <td className="px-4 py-2">{row.active ? 'yes' : 'no'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    type="button"
                    className="text-muted-warm hover:text-champagne"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        title: row.title,
                        subtitle: row.subtitle,
                        image: row.image,
                        imagePublicId: row.imagePublicId || '',
                        videoUrl: row.videoUrl || '',
                        videoPublicId: row.videoPublicId || '',
                        sortOrder: row.sortOrder,
                        active: row.active,
                      });
                      setImageFile(null);
                      setVideoFile(null);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                  <button type="button" className="text-amber-700" onClick={() => del(row._id)}>
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && !editing) flushDraft();
          setOpen(o);
          if (!o) {
            setEditing(null);
            setImageFile(null);
            setVideoFile(null);
          }
        }}
      >
        <DialogContent className="glass border-champagne/20 max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-champagne">{editing ? 'Edit' : 'Add'} live show</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
            <div className="border border-champagne/15 rounded-lg p-3 space-y-2">
              <Label>Poster image (Cloudinary)</Label>
              {form.image ? <img src={form.image} alt="" className="w-28 h-20 object-cover rounded border border-champagne/20" /> : null}
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            <div className="border border-champagne/15 rounded-lg p-3 space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-3 h-3" /> Optional video (Cloudinary)
              </Label>
              {form.videoUrl ? (
                <video src={form.videoUrl} className="w-full max-h-36 rounded border border-champagne/20" controls muted playsInline />
              ) : null}
              <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                  className="bg-transparent border-champagne/20 mt-1"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-champagne cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Active
                </label>
              </div>
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
                    setVideoFile(null);
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
                onClick={save}
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
