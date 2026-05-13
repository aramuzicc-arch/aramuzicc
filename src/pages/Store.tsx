import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { apiFetch } from '@/lib/api';

const CATEGORIES = ['ALL', 'CLOTHING', 'ACCESSORIES', 'DIGITAL'];

export default function Store() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCartStore();

  useEffect(() => {
    apiFetch<(Omit<Product, 'id'> & { _id: string })[]>('/products')
      .then((data) => setProducts(data.map((item) => ({ ...item, id: item._id }))))
      .catch(() => setProducts([]));
  }, []);

  const filtered = activeCategory === 'ALL' ? products : products.filter((p) => p.category === activeCategory.toLowerCase());

  return (
    <main className="bg-obsidian min-h-[100dvh]">
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian to-transparent" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative px-[4vw] py-20">
          <h1 className="font-display text-[clamp(48px,10vw,140px)] leading-none tracking-[0.05em] text-champagne">MERCH & DIGITAL</h1>
        </motion.div>
      </section>
      <section className="relative py-20 bg-obsidian">
        <div className="px-[4vw]">
          <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 text-[11px] tracking-[0.2em] uppercase font-body border-b-2 transition-all whitespace-nowrap ${activeCategory === cat ? 'border-olive-light text-olive-light' : 'border-transparent text-muted-warm hover:text-champagne'}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 px-6">
                <p className="text-muted-warm text-sm max-w-md mx-auto">
                  No products in the database yet. Add SKUs in the admin under{' '}
                  <Link to="/admin/products?new=1" className="text-champagne underline underline-offset-4 hover:text-olive-light">
                    Store products
                  </Link>
                  ; they appear here for visitors automatically.
                </p>
              </div>
            ) : (
              filtered.map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-[#2a2824]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  {product.badge !== 'none' && (
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase ${product.badge === 'new' ? 'bg-olive text-obsidian' : 'bg-olive-light text-obsidian'}`}>{product.badge}</span>
                  )}
                </div>
                <div className="glass rounded-lg p-4">
                  <h3 className="text-champagne font-body text-sm tracking-wide font-medium">{product.name}</h3>
                  <p className="text-muted-warm text-xs mt-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-olive-light font-body text-xl font-bold">${product.price}</span>
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                      className="flex items-center gap-2 bg-olive hover:bg-olive-light text-obsidian px-5 py-2.5 rounded-full text-[11px] tracking-wider uppercase font-body transition-all hover:shadow-[0_0_20px_rgba(107,124,63,0.3)]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
