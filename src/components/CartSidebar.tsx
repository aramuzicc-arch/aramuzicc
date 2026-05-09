import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export default function CartSidebar() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass border-l border-champagne/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-champagne/10">
              <h2 className="font-display text-2xl tracking-wider text-champagne">YOUR CART</h2>
              <button onClick={() => setCartOpen(false)} className="text-muted-warm hover:text-champagne transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-warm">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-champagne/5">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-champagne text-sm font-medium">{item.name}</p>
                        <p className="text-olive-light text-sm">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded border border-champagne/20 flex items-center justify-center text-champagne hover:border-olive-light">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-champagne text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded border border-champagne/20 flex items-center justify-center text-champagne hover:border-olive-light">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-muted-warm hover:text-amber-700 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-champagne/10">
                <div className="flex justify-between mb-4">
                  <span className="text-muted-warm text-sm">Subtotal</span>
                  <span className="text-champagne font-medium">${totalPrice().toFixed(2)}</span>
                </div>
                <Link to="/checkout" onClick={() => setCartOpen(false)} className="block w-full">
                  <button className="w-full bg-olive text-obsidian py-3 rounded-full text-[11px] tracking-[0.15em] uppercase font-body hover:bg-olive-light transition-colors">
                    Checkout
                  </button>
                </Link>
                <button onClick={clearCart} className="w-full mt-2 text-muted-warm text-xs hover:text-champagne transition-colors">
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

