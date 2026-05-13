import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Headphones, Mail, ClipboardList, Package, MessageSquare, Plus, Music, Radio, MapPin, ShoppingBag, Image } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Msg = { _id: string; read?: boolean; createdAt?: string; subject?: string; name?: string };
type Booking = { _id: string; status?: string; createdAt?: string; eventName?: string; eventType?: string };
type Order = { _id: string; status?: string; createdAt?: string; total?: number; customer?: { name?: string } };
type Product = { _id: string };

type Activity = { id: string; text: string; time: string; kind: string; t: number };

function fmtTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} hr ago`;
  return d.toLocaleDateString();
}

export default function DashboardHome() {
  const [msgCount, setMsgCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [messages, bookings, orders, products] = await Promise.all([
          apiFetch<Msg[]>('/admin/messages', { auth: true }),
          apiFetch<Booking[]>('/admin/bookings', { auth: true }),
          apiFetch<Order[]>('/admin/orders', { auth: true }),
          apiFetch<Product[]>('/products'),
        ]);
        if (cancelled) return;
        setMsgCount(messages.length);
        setUnread(messages.filter((m) => !m.read).length);
        setBookingCount(bookings.length);
        setPendingBookings(bookings.filter((b) => b.status === 'pending').length);
        setOrderCount(orders.length);
        setPendingOrders(orders.filter((o) => o.status === 'pending').length);
        setProductCount(products.length);

        const acts: Activity[] = [];
        for (const m of messages.slice(0, 5)) {
          const t = m.createdAt ? new Date(m.createdAt).getTime() : 0;
          acts.push({
            id: `m-${m._id}`,
            text: `Message from ${m.name || 'Unknown'}: ${m.subject || '(no subject)'}`,
            time: fmtTime(m.createdAt),
            kind: 'message',
            t,
          });
        }
        for (const b of bookings.slice(0, 5)) {
          const t = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          acts.push({
            id: `b-${b._id}`,
            text: `Booking: ${b.eventName || b.eventType || 'Request'}`,
            time: fmtTime(b.createdAt),
            kind: 'booking',
            t,
          });
        }
        for (const o of orders.slice(0, 5)) {
          const t = o.createdAt ? new Date(o.createdAt).getTime() : 0;
          acts.push({
            id: `o-${o._id}`,
            text: `Order #${String(o._id).slice(-6)} — ${o.customer?.name || 'Customer'} ($${(o.total ?? 0).toFixed(2)})`,
            time: fmtTime(o.createdAt),
            kind: 'order',
            t,
          });
        }
        acts.sort((a, b) => b.t - a.t);
        setActivities(acts.slice(0, 12));
      } catch {
        if (!cancelled) {
          setActivities([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { icon: Headphones, label: 'Store SKUs', value: String(productCount), color: 'text-olive-light' },
    { icon: Mail, label: 'Messages', value: `${unread}/${msgCount}`, color: 'text-amber-400' },
    { icon: ClipboardList, label: 'Bookings (pending)', value: `${pendingBookings}/${bookingCount}`, color: 'text-sky-400' },
    { icon: Package, label: 'Orders (pending)', value: `${pendingOrders}/${orderCount}`, color: 'text-emerald-400' },
  ];

  const createLinks = [
    { to: '/admin/music?new=1', label: 'Catalog release', desc: 'Albums, singles, videos — saved to the database and shown on Catalog.', icon: Music },
    { to: '/admin/live-shows?new=1', label: 'Live show', desc: 'Poster + optional Cloudinary video for the home page.', icon: Radio },
    { to: '/admin/tour?new=1', label: 'Tour date', desc: 'Date, venue, location, ticket link.', icon: MapPin },
    { to: '/admin/products?new=1', label: 'Store product', desc: 'Merch and digital goods on the Store page.', icon: ShoppingBag },
    { to: '/admin/gallery?new=1', label: 'Gallery item', desc: 'Photo or video hosted on Cloudinary.', icon: Image },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-olive-light/35 bg-olive/10 px-4 py-4 text-sm text-muted-warm leading-relaxed">
        <p className="text-champagne font-medium mb-1">Looking for “Add”?</p>
        <p>
          Adding music, products, tour dates, and gallery items happens in the{' '}
          <strong className="text-champagne">admin area</strong> after you sign in at{' '}
          <code className="text-olive-light text-xs">/admin/login</code> — not on the public store or catalog pages.
        </p>
        <p className="mt-2">
          On each admin list page, use the large <strong className="text-olive-light">green button</strong> at the{' '}
          <strong className="text-champagne">top of the page</strong> or the matching{' '}
          <strong className="text-olive-light">green control in the top bar</strong> (next to the page title).
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display text-lg text-champagne tracking-wider mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-olive-light" />
          Add site content
        </h3>
        <p className="text-muted-warm text-sm mb-6 max-w-2xl">
          Create new entries here; each opens the right admin screen with the create form ready. Everything is stored in your database (and Cloudinary for media).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {createLinks.map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-champagne/15 bg-champagne/[0.03] p-4 hover:border-olive-light/40 hover:bg-olive/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg border border-champagne/20 p-2 text-olive-light group-hover:border-olive-light/40">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm text-champagne tracking-wide group-hover:text-olive-light transition-colors">
                    {label}
                  </p>
                  <p className="text-muted-warm text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-[10px] text-muted-warm uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display text-lg text-champagne tracking-wider mb-6 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-olive-light" />
          Recent activity
        </h3>
        {activities.length === 0 ? (
          <p className="text-muted-warm text-sm">No recent messages, bookings, or orders yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between py-3 border-b border-champagne/5 last:border-0 gap-4"
              >
                <p className="text-champagne text-sm truncate">{a.text}</p>
                <span className="text-muted-warm text-xs shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
