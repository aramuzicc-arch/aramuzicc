import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eraser, Plus, Search, Pencil, Trash2, Upload, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Album } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, uploadImage, uploadVideo } from '@/lib/api';
import { useConsumeNewQuery } from '@/hooks/useConsumeNewQuery';
import { useAdminFormDraft } from '@/hooks/useAdminFormDraft';
import {
  NATIVE_PICKER_CLASS,
  currentMonthInputValue,
  monthValueToReleaseLabel,
  parseReleaseDateToMonthValue,
} from '@/lib/nativePickerFields';

type ApiAlbum = Omit<Album, 'id'> & { _id: string };
const normalize = (item: ApiAlbum): Album => ({ ...item, id: item._id });

type MusicFormState = {
  title: string;
  type: Album['type'];
  genre: string;
  releaseMonth: string;
  description: string;
  coverImage: string;
  coverPublicId: string;
  youtubeUrl: string;
  cloudinaryVideoUrl: string;
  cloudinaryVideoPublicId: string;
  isLatestDrop: boolean;
};

function createMusicEmptyForm(): MusicFormState {
  return {
    title: '',
    type: 'album',
    genre: '',
    releaseMonth: currentMonthInputValue(),
    description: '',
    coverImage: '',
    coverPublicId: '',
    youtubeUrl: '',
    cloudinaryVideoUrl: '',
    cloudinaryVideoPublicId: '',
    isLatestDrop: false,
  };
}

const DRAFT_KEY = 'admin:draft:music';

export default function MusicManager() {
  const [items, setItems] = useState<Album[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [form, setForm] = useState<MusicFormState>(() => createMusicEmptyForm());

  const getEmpty = useCallback(() => createMusicEmptyForm(), []);

  const { clearDraft, flushDraft } = useAdminFormDraft({
    storageKey: DRAFT_KEY,
    active: modalOpen && !editing,
    form: form as unknown as Record<string, unknown>,
    setForm: setForm as unknown as Dispatch<SetStateAction<Record<string, unknown>>>,
    getEmpty: () => getEmpty() as unknown as Record<string, unknown>,
  });

  useEffect(() => {
    apiFetch<ApiAlbum[]>('/albums').then((data) => setItems(data.map(normalize))).catch(() => setItems([]));
  }, []);

  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const clearCover = () => {
    setForm((f) => ({ ...f, coverImage: '', coverPublicId: '' }));
    setCoverFile(null);
  };

  const clearCatalogVideo = () => {
    setForm((f) => ({ ...f, cloudinaryVideoUrl: '', cloudinaryVideoPublicId: '' }));
    setVideoFile(null);
  };

  const openCreateModal = () => {
    setEditing(null);
    setCoverFile(null);
    setVideoFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSavePending(true);
    try {
      let coverImage = form.coverImage;
      let coverPublicId = form.coverPublicId;
      if (coverFile) {
        const uploaded = await uploadImage(coverFile);
        coverImage = uploaded.url;
        coverPublicId = uploaded.publicId;
      }

      let cloudinaryVideoUrl = form.cloudinaryVideoUrl;
      let cloudinaryVideoPublicId = form.cloudinaryVideoPublicId;
      if (videoFile) {
        const uploaded = await uploadVideo(videoFile);
        cloudinaryVideoUrl = uploaded.url;
        cloudinaryVideoPublicId = uploaded.publicId;
      }

      if (!coverImage.trim()) {
        toast.error('Cover image is required. Upload a cover to Cloudinary.');
        return;
      }

      const releaseDate = form.releaseMonth.trim()
        ? monthValueToReleaseLabel(form.releaseMonth)
        : editing
          ? editing.releaseDate
          : '';
      if (!releaseDate.trim()) {
        toast.error('Choose a valid release month.');
        return;
      }

      const payload = {
        title: form.title,
        type: form.type,
        genre: form.genre,
        releaseDate,
        description: form.description,
        coverImage,
        coverPublicId,
        youtubeUrl: form.youtubeUrl,
        cloudinaryVideoUrl,
        cloudinaryVideoPublicId,
        isLatestDrop: form.isLatestDrop,
        mediaType: form.type === 'video' ? 'video' : 'audio',
      };

      try {
        if (editing) {
          const updated = await apiFetch<ApiAlbum>(`/admin/albums/${editing.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            auth: true,
          });
          setItems(items.map((i) => (i.id === editing.id ? normalize(updated) : i)));
          toast.success('Release updated.');
        } else {
          const created = await apiFetch<ApiAlbum>('/admin/albums', {
            method: 'POST',
            body: JSON.stringify(payload),
            auth: true,
          });
          setItems([normalize(created), ...items]);
          toast.success('Release added.');
        }

        const wasNew = !editing;
        setModalOpen(false);
        setEditing(null);
        setCoverFile(null);
        setVideoFile(null);
        if (wasNew) clearDraft();
        else setForm(createMusicEmptyForm());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save release.');
      }
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/admin/albums/${id}`, { method: 'DELETE', auth: true });
      setItems(items.filter((i) => i.id !== id));
      toast.success('Release removed.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete.');
    }
  };

  const openEdit = (item: Album | null) => {
    if (item) {
      setEditing(item);
      setForm({
        title: item.title,
        type: item.type,
        genre: item.genre,
        releaseMonth: parseReleaseDateToMonthValue(item.releaseDate) || currentMonthInputValue(),
        description: item.description,
        coverImage: item.coverImage,
        coverPublicId: item.coverPublicId || '',
        youtubeUrl: item.youtubeUrl || '',
        cloudinaryVideoUrl: item.cloudinaryVideoUrl || '',
        cloudinaryVideoPublicId: item.cloudinaryVideoPublicId || '',
        isLatestDrop: Boolean(item.isLatestDrop),
      });
    } else {
      setEditing(null);
    }
    setCoverFile(null);
    setVideoFile(null);
    setModalOpen(true);
  };

  useConsumeNewQuery(() => openCreateModal());

  return (
    <div className="space-y-6">
      <Button
        type="button"
        size="lg"
        onClick={() => openCreateModal()}
        className="w-full sm:w-auto min-h-[52px] px-8 bg-olive hover:bg-olive-light text-white hover:text-white text-base font-semibold shadow-lg shadow-black/25 ring-2 ring-olive-light/50"
      >
        <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
        Add new release
      </Button>
      <p className="text-muted-warm text-sm max-w-xl">
        Same action as the green <strong className="text-champagne">Add release</strong> button in the top bar. Covers
        and catalog videos go to <strong className="text-champagne">Cloudinary</strong>. Replacing or deleting a release
        removes previous Cloudinary files when possible. Unsaved new releases are kept in this browser until you save or
        clear the form.
      </p>
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search music..."
          className="pl-10 bg-transparent border-champagne/20"
        />
      </div>

      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-champagne/10 text-left">
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Title</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Type</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Genre</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Latest</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-champagne/5 hover:bg-champagne/5 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={item.coverImage} alt="" className="w-10 h-10 rounded object-cover" />
                  <span className="text-champagne text-sm">{item.title}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-olive/10 text-olive-light text-[10px] uppercase">{item.type}</span>
                </td>
                <td className="px-6 py-4 text-muted-warm text-sm">{item.genre}</td>
                <td className="px-6 py-4 text-xs text-olive-light">{item.isLatestDrop ? 'Yes' : '—'}</td>
                <td className="px-6 py-4 text-right">
                  <button type="button" onClick={() => openEdit(item)} className="text-muted-warm hover:text-champagne mr-3">
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="text-muted-warm hover:text-amber-700">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(o) => {
          if (!o && !editing) flushDraft();
          setModalOpen(o);
          if (!o) {
            setEditing(null);
            setCoverFile(null);
            setVideoFile(null);
          }
        }}
      >
        <DialogContent className="glass border-champagne/20 max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-champagne tracking-wider">
              {editing ? 'Edit Music' : 'Add Music'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-muted-warm">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>
            <div>
              <Label className="text-muted-warm">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Album['type'] })}>
                <SelectTrigger className="bg-transparent border-champagne/20 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-champagne/20">
                  <SelectItem value="album">Album</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="instrumental">Instrumental</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-warm">Genre</Label>
              <Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>
            <div>
              <Label className="text-muted-warm">Release month</Label>
              <Input
                type="month"
                value={form.releaseMonth}
                onChange={(e) => setForm({ ...form, releaseMonth: e.target.value })}
                className={`bg-transparent border-champagne/20 mt-1 ${NATIVE_PICKER_CLASS}`}
              />
              {editing && !form.releaseMonth.trim() ? (
                <p className="text-[11px] text-muted-warm mt-1">
                  Stored value (pick a month above to change):{' '}
                  <span className="font-mono text-champagne">{editing.releaseDate}</span>
                </p>
              ) : null}
            </div>
            <div>
              <Label className="text-muted-warm">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-transparent border-champagne/20 mt-1" />
            </div>

            <div className="border border-champagne/15 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-warm">Cover (Cloudinary)</Label>
                {form.coverImage ? (
                  <button type="button" onClick={clearCover} className="text-xs text-amber-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                ) : null}
              </div>
              {form.coverImage ? (
                <img src={form.coverImage} alt="" className="w-24 h-24 rounded object-cover border border-champagne/20" />
              ) : null}
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="bg-transparent border-champagne/20 mt-1" />
            </div>

            <div className="border border-champagne/15 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-warm flex items-center gap-2">
                  <Video className="w-3 h-3" /> Catalog video (Cloudinary)
                </Label>
                {form.cloudinaryVideoUrl ? (
                  <button type="button" onClick={clearCatalogVideo} className="text-xs text-amber-700 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                ) : null}
              </div>
              <p className="text-[10px] text-muted-warm">Shown on the catalog page for video-type releases (embedded player).</p>
              {form.cloudinaryVideoUrl ? (
                <video src={form.cloudinaryVideoUrl} className="w-full max-h-40 rounded border border-champagne/20" controls muted />
              ) : null}
              <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="bg-transparent border-champagne/20 mt-1" />
            </div>

            <div>
              <Label className="text-muted-warm">YouTube URL (optional fallback)</Label>
              <Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} className="bg-transparent border-champagne/20 mt-1" placeholder="https://..." />
            </div>

            <label className="flex items-center gap-2 text-sm text-champagne cursor-pointer">
              <input type="checkbox" checked={form.isLatestDrop} onChange={(e) => setForm({ ...form, isLatestDrop: e.target.checked })} />
              Feature on home — Latest drops
            </label>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              {!editing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-champagne/25 text-champagne hover:bg-champagne/10"
                  onClick={() => {
                    clearDraft();
                    setCoverFile(null);
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
