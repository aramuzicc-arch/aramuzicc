import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Music, ShoppingBag, Image, MessageSquare, CalendarCheck,
  Settings, LogOut, Headphones, DollarSign, Mail, ClipboardList
} from 'lucide-react';
import { clearToken, getToken } from '@/lib/api';

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Music, label: 'Music', path: '/admin/music' },
  { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
  { icon: Image, label: 'Gallery', path: '/admin/gallery' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
  { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const STATS = [
  { icon: Headphones, label: 'Total Streams', value: '500M+', color: 'text-olive-light' },
  { icon: DollarSign, label: 'Revenue', value: '$1.2M', color: 'text-emerald-400' },
  { icon: Mail, label: 'Messages', value: '24', color: 'text-amber-400' },
  { icon: ClipboardList, label: 'Bookings', value: '8', color: 'text-sky-400' },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-[100dvh] bg-obsidian flex">
      <aside className="w-64 bg-obsidian border-r border-champagne/10 flex flex-col fixed h-full">
        <div className="p-6">
          <Link to="/" className="font-display text-xl tracking-[0.3em] text-champagne">ARA MUZICC</Link>
          <p className="text-muted-warm text-[10px] tracking-wider uppercase mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                location.pathname === link.path
                  ? 'bg-olive/10 text-olive-light border-l-2 border-olive-light'
                  : 'text-muted-warm hover:text-champagne hover:bg-champagne/5'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-champagne/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-muted-warm hover:text-amber-700 hover:bg-olive-light/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="h-16 border-b border-champagne/10 flex items-center justify-between px-8">
          <h1 className="font-display text-xl text-champagne tracking-wider">
            {SIDEBAR_LINKS.find((l) => l.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center">
              <span className="text-olive-light text-xs font-bold">A</span>
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function DashboardHome() {
  const activities = [
    { text: 'New booking request from Live Nation', time: '2 min ago', type: 'booking' },
    { text: 'Product "ARA MUZICC LOGO TEE" low stock', time: '1 hour ago', type: 'alert' },
    { text: 'New message from press@rollingstone.com', time: '3 hours ago', type: 'message' },
    { text: 'Album "MIDNIGHT ECHO" added to catalog', time: '1 day ago', type: 'music' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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
        <h3 className="font-display text-lg text-champagne tracking-wider mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-champagne/5 last:border-0">
              <p className="text-champagne text-sm">{activity.text}</p>
              <span className="text-muted-warm text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <DashboardHome />
    </AdminLayout>
  );
}
