import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink, Link } from 'react-router';
import {
  LayoutDashboard,
  Music,
  ShoppingBag,
  Image,
  MessageSquare,
  CalendarCheck,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  FileText,
  Radio,
  MapPin,
  Package,
  Plus,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { clearToken, getToken } from '@/lib/api';

const STORAGE_KEY = 'admin_sidebar_collapsed';

/** Shown in the top bar on these routes so “Add” is always visible (not buried in the page). */
const ADMIN_ADD_CTA: Partial<Record<string, { to: string; label: string }>> = {
  '/admin/music': { to: '/admin/music?new=1', label: 'Add release' },
  '/admin/live-shows': { to: '/admin/live-shows?new=1', label: 'Add live show' },
  '/admin/tour': { to: '/admin/tour?new=1', label: 'Add tour date' },
  '/admin/products': { to: '/admin/products?new=1', label: 'Add product' },
  '/admin/gallery': { to: '/admin/gallery?new=1', label: 'Add gallery item' },
};

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/about', icon: FileText, label: 'About page' },
  { to: '/admin/music', icon: Music, label: 'Catalog (music)' },
  { to: '/admin/live-shows', icon: Radio, label: 'Live shows' },
  { to: '/admin/tour', icon: MapPin, label: 'Tour' },
  { to: '/admin/products', icon: ShoppingBag, label: 'Store products' },
  { to: '/admin/orders', icon: Package, label: 'Orders' },
  { to: '/admin/gallery', icon: Image, label: 'Gallery' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    if (!getToken()) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate(`/admin/login?redirect=${encodeURIComponent(returnTo)}`);
    }
  }, [navigate, location.pathname, location.search]);

  const handleLogout = () => {
    clearToken();
    navigate('/admin/login');
  };

  const activeLabel =
    NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ??
    'Admin';

  const addCta = ADMIN_ADD_CTA[location.pathname];

  const rail = collapsed ? 'w-[72px]' : 'w-64';

  return (
    <div className="min-h-[100dvh] bg-obsidian flex text-champagne">
      <Toaster richColors theme="dark" closeButton position="top-center" className="font-body" />
      <aside
        className={`${rail} shrink-0 border-r border-champagne/10 flex flex-col fixed inset-y-0 left-0 z-40 bg-obsidian/95 backdrop-blur-md transition-[width] duration-300 ease-out`}
      >
        <div className={`p-4 border-b border-champagne/10 flex items-center ${collapsed ? 'justify-center flex-col gap-2' : 'justify-between gap-2'}`}>
          {!collapsed && (
            <NavLink to="/" className="font-display text-lg tracking-[0.2em] text-champagne truncate">
              ARA MUZICC
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-lg border border-champagne/15 text-muted-warm hover:text-champagne hover:border-champagne/30 transition-colors shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg py-2.5 transition-colors ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive
                    ? 'bg-olive/15 text-olive-light border border-olive-light/25'
                    : 'text-muted-warm hover:text-champagne hover:bg-champagne/5 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="text-sm truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-champagne/10">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full rounded-lg py-2.5 text-sm text-muted-warm hover:text-amber-700 hover:bg-olive-light/5 transition-colors ${
              collapsed ? 'justify-center' : 'px-3'
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ${collapsed ? 'ml-[72px]' : 'ml-64'}`}>
        <header className="relative z-20 min-h-14 border-b border-champagne/10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2 shrink-0 bg-obsidian/95 backdrop-blur-sm">
          <h1 className="font-display text-base sm:text-lg md:text-xl text-champagne tracking-wider truncate min-w-0 flex-1">
            {activeLabel}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {addCta ? (
              <Link
                to={addCta.to}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-olive px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-black/30 ring-2 ring-olive-light/60 hover:bg-olive-light hover:text-white hover:ring-olive-light transition-colors [&_svg]:text-white"
              >
                <Plus className="w-5 h-5 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="whitespace-nowrap">{addCta.label}</span>
              </Link>
            ) : null}
            <div
              className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center shrink-0"
              aria-hidden
            >
              <span className="text-olive-light text-xs font-bold">A</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
