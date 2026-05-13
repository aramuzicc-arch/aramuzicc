import { useEffect, useState } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch } from '@/lib/api';

type Booking = {
  id: string;
  eventType: string;
  eventName: string;
  date: string;
  budget: string;
  location: string;
  attendance: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
};

type ApiBooking = Omit<Booking, 'id'> & { _id: string };
const normalize = (item: ApiBooking): Booking => ({
  ...item,
  id: item._id,
  contactName: item.contactName || '',
  contactEmail: item.contactEmail || '',
  contactPhone: item.contactPhone || '',
});

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber-400 bg-amber-400/10' },
  confirmed: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10' },
  cancelled: { icon: XCircle, color: 'text-amber-700 bg-olive-muted/10' },
};

export default function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<Booking | null>(null);

  useEffect(() => {
    apiFetch<ApiBooking[]>('/admin/bookings', { auth: true })
      .then((data) => setBookings(data.map(normalize)))
      .catch(() => setBookings([]));
  }, []);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (b.eventName || '').toLowerCase().includes(q) ||
      (b.contactName || '').toLowerCase().includes(q) ||
      (b.contactEmail || '').toLowerCase().includes(q) ||
      (b.contactPhone || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    const updated = await apiFetch<ApiBooking>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      auth: true,
    });
    setBookings(bookings.map((b) => (b.id === id ? normalize(updated) : b)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-warm" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="pl-10 bg-transparent border-champagne/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-transparent border-champagne/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-obsidian border-champagne/20">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-champagne/10 text-left">
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Event</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Contact</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Type</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Date</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm">Status</th>
              <th className="px-6 py-4 text-[11px] tracking-wider uppercase text-muted-warm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => {
              const statusConfig = STATUS_CONFIG[booking.status];
              const StatusIcon = statusConfig.icon;
              return (
                <tr key={booking.id} className="border-b border-champagne/5 hover:bg-champagne/5 transition-colors">
                  <td className="px-6 py-4 text-champagne text-sm">{booking.eventName || '—'}</td>
                  <td className="px-6 py-4 text-muted-warm text-xs">
                    <div>{booking.contactName || '—'}</div>
                    <div className="text-champagne/80">{booking.contactEmail || ''}</div>
                    {booking.contactPhone ? (
                      <div className="text-champagne/70 mt-0.5">{booking.contactPhone}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-olive/10 text-olive-light text-[10px] uppercase">
                      {booking.eventType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-warm text-sm font-mono">{booking.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] uppercase ${statusConfig.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => setViewing(booking)} className="text-muted-warm hover:text-champagne">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="glass border-champagne/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-champagne tracking-wider">Booking Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 mt-4">
              <div>
                <span className="text-muted-warm text-xs uppercase">Contact</span>
                <p className="text-champagne text-sm">
                  {viewing.contactName} &lt;{viewing.contactEmail}&gt;
                </p>
                {viewing.contactPhone ? (
                  <p className="text-champagne/90 text-sm mt-1">Phone: {viewing.contactPhone}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-warm text-xs uppercase">Event</span>
                  <p className="text-champagne text-sm">{viewing.eventName}</p>
                </div>
                <div>
                  <span className="text-muted-warm text-xs uppercase">Type</span>
                  <p className="text-champagne text-sm">{viewing.eventType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-warm text-xs uppercase">Date</span>
                  <p className="text-champagne text-sm font-mono">{viewing.date}</p>
                </div>
                <div>
                  <span className="text-muted-warm text-xs uppercase">Budget</span>
                  <p className="text-champagne text-sm">{viewing.budget.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-muted-warm text-xs uppercase">Location</span>
                  <p className="text-champagne text-sm">{viewing.location}</p>
                </div>
                {viewing.attendance ? (
                  <div>
                    <span className="text-muted-warm text-xs uppercase">Attendance</span>
                    <p className="text-champagne text-sm">{viewing.attendance}</p>
                  </div>
                ) : null}
              </div>
              {viewing.notes ? (
                <div>
                  <span className="text-muted-warm text-xs uppercase">Notes</span>
                  <p className="text-muted-warm text-sm mt-1">{viewing.notes}</p>
                </div>
              ) : null}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    updateStatus(viewing.id, 'confirmed');
                    setViewing(null);
                  }}
                  className="flex-1 bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-emerald-500/30 transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStatus(viewing.id, 'cancelled');
                    setViewing(null);
                  }}
                  className="flex-1 bg-olive-muted/20 text-amber-700 py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-olive-light/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
