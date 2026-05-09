import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Store from '@/pages/Store';
import Gallery from '@/pages/Gallery';
import Contact from '@/pages/Contact';
import Bookings from '@/pages/Bookings';
import About from '@/pages/About';
import Checkout from '@/pages/Checkout';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import MusicManager from '@/pages/admin/MusicManager';
import ProductManager from '@/pages/admin/ProductManager';
import GalleryManager from '@/pages/admin/GalleryManager';
import MessagesManager from '@/pages/admin/MessagesManager';
import BookingsManager from '@/pages/admin/BookingsManager';
import SettingsPage from '@/pages/admin/Settings';

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navigation />
      <CartSidebar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/store" element={<Store />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/about" element={<About />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/music" element={<MusicManager />} />
        <Route path="/admin/products" element={<ProductManager />} />
        <Route path="/admin/gallery" element={<GalleryManager />} />
        <Route path="/admin/messages" element={<MessagesManager />} />
        <Route path="/admin/bookings" element={<BookingsManager />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Routes>
    </MainLayout>
  );
}
