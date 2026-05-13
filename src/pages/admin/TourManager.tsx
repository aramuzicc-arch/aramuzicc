import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eraser, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';
import { useConsumeNewQuery } from '@/hooks/useConsumeNewQuery';
import { useAdminFormDraft } from '@/hooks/useAdminFormDraft';
import {
  NATIVE_PICKER_CLASS,
  formatTourDateLabel,
  parseTourCalendarFromLabel,
  toLocalYMD,
} from '@/lib/nativePickerFields';

type TourRow = {
  _id: string;
  dateLabel: string;
  venue: string;
  location: string;
  ticketUrl: string;
  sortOrder: number;
  active: boolean;
};

type TourFormState = {
  calendarDate: string;
  calendarTime: string;
  venue: string;
  location: string;
  ticketUrl: string;
  sortOrder: number;
  active: boolean;
};

const DRAFT_KEY = 'admin:draft:tour';

export default function TourManager() {
  const [items, setItems] = useState<TourRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TourRow | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [form, setForm] = useState<TourFormState>(() => ({
    calendarDate: toLocalYMD(new Date()),
    calendarTime: '',
    venue: '',
    location: '',
    ticketUrl: '',
    sortOrder: 0,
    active: true,
  }));

  const getEmpty = useCallback(
    (): TourFormState => ({
      calendarDate: toLocalYMD(new Date()),
      calendarTime: '',
      venue: '',
      location: '',
      ticketUrl: '',
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
    apiFetch<TourRow[]>('/admin/tour-dates', { auth: true }).then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setOpen(true);
  };

  useConsumeNewQuery(() => openCreateModal());

  const save = async () => {
    const dateLabel = form.calendarDate.trim()
      ? formatTourDateLabel(form.calendarDate, form.calendarTime)
      : editing?.dateLabel ?? '';
    if (!dateLabel.trim()) {
      toast.error('Choose a show date on the calendar.');
      return;
    }
    const body = {
      dateLabel,
      venue: form.venue,
      location: form.location,
      ticketUrl: form.ticketUrl,
      sortOrder: form.sortOrder,
      active: form.active,
    };
    setSavePending(true);
    try {
      try {
        if (editing) {
          await apiFetch(`/admin/tour-dates/${editing._id}`, { method: 'PUT', auth: true, body: JSON.stringify(body) });
          toast.success('Tour date updated.');
        } else {
          await apiFetch('/admin/tour-dates', { method: 'POST', auth: true, body: JSON.stringify(body) });
          toast.success('Tour date added.');
        }
        const wasNew = !editing;
        setOpen(false);
        setEditing(null);
        if (wasNew) clearDraft();
        else setForm(getEmpty());
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save tour date.');
      }
    } finally {
      setSavePending(false);
    }
  };

  const del = async (id: string) => {
    try {
      await apiFetch(`/admin/tour-dates/${id}`, { method: 'DELETE', auth: true });
      toast.success('Tour date removed.');
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
        Add new tour date
      </Button>
      <p className="text-muted-warm text-sm max-w-xl">
        Same as the green <strong className="text-champagne">Add tour date</strong> button in the top bar. Unsaved new
        rows are kept in this browser until you save or clear the form.
      </p>
      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-champagne/10 text-left text-muted-warm text-[10px] uppercase tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row._id} className="border-b border-champagne/5">
                <td className="px-4 py-2 font-mono text-olive-light">{row.dateLabel}</td>
                <td className="px-4 py-2 text-champagne">{row.venue}</td>
                <td className="px-4 py-2 text-muted-warm">{row.location}</td>
                <td className="px-4 py-2 text-xs">{row.sortOrder}</td>
                <td className="px-4 py-2">{row.active ? 'yes' : 'no'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    type="button"
                    className="text-muted-warm hover:text-champagne"
                    onClick={() => {
                      setEditing(row);
                      const parsed = parseTourCalendarFromLabel(row.dateLabel);
                      setForm({
                        calendarDate: parsed?.date ?? '',
                        calendarTime: parsed?.time ?? '',
                        venue: row.venue,
                        location: row.location,
                        ticketUrl: row.ticketUrl,
                        sortOrder: row.sortOrder,
                        active: row.active,
                      });
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
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-champagne">{editing ? 'Edit' : 'Add'} tour date</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Show date</Label>
                <Input
                  type="date"
                  value={form.calendarDate}
                  onChange={(e) => setForm({ ...form, calendarDate: e.target.value })}
                  className={`bg-transparent border-champagne/20 mt-1 ${NATIVE_PICKER_CLASS}`}
                />
              </div>
              <div>
                <Label>Start time (optional)</Label>
                <Input
                  type="time"
                  value={form.calendarTime}
                  onChange={(e) => setForm({ ...form, calendarTime: e.target.value })}
                  className={`bg-transparent border-champagne/20 mt-1 ${NATIVE_PICKER_CLASS}`}
                />
              </div>
            </div>
            {editing && !form.calendarDate.trim() ? (
              <p className="text-[11px] text-muted-warm">
                Current label (unchanged until you pick a date):{' '}
                <span className="font-mono text-champagne">{editing.dateLabel}</span>
              </p>
            ) : null}
            <div>
              <Label>Venue</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
            </div>
            <div>
              <Label>Ticket URL (optional)</Label>
              <Input
                value={form.ticketUrl}
                onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })}
                className="bg-transparent border-champagne/20 mt-1"
              />
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
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
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
                Save
              </SubmitButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
