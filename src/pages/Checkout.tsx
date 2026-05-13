import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Truck, ArrowLeft, Check } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import CrimsonVoid from '@/components/CrimsonVoid';
import { apiFetch } from '@/lib/api';
import { NativeSubmitButton } from '@/components/ui/submit-button';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<'info' | 'payment' | 'done'>('info');
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', country: '', zip: '' });
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const placeOrder = async () => {
    setPayError('');
    setPayLoading(true);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            address: form.address,
            city: form.city,
            country: form.country,
            zip: form.zip,
          },
          items: items.map((i) => ({
            productId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          total: totalPrice(),
        }),
      });
      clearCart();
      setStep('done');
    } catch {
      setPayError('Could not place order. Check your connection and try again.');
    } finally {
      setPayLoading(false);
    }
  };

  if (items.length === 0 && step !== 'done') {
    return (
      <main className="relative min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <CrimsonVoid />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-warm mx-auto mb-6" />
          <h1 className="font-display text-4xl text-champagne tracking-wider mb-4">YOUR CART IS EMPTY</h1>
          <p className="text-muted-warm mb-8">Add some merch before checking out</p>
          <Link to="/store" className="btn-pill inline-block">Browse Store</Link>
        </motion.div>
      </main>
    );
  }

  if (step === 'done') {
    return (
      <main className="relative min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <CrimsonVoid />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-full bg-olive/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-olive-light" />
          </div>
          <h1 className="font-display text-4xl text-champagne tracking-wider mb-4">ORDER CONFIRMED</h1>
          <p className="text-muted-warm mb-2">Thank you for your purchase!</p>
          <p className="text-muted-warm text-sm mb-8">You will receive a confirmation email shortly</p>
          <Link to="/" className="btn-pill inline-block">Back to Home</Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-obsidian">
      <CrimsonVoid />
      <div className="relative z-10 px-[4vw] py-24 max-w-6xl mx-auto">
        <Link to="/store" className="flex items-center gap-2 text-muted-warm hover:text-champagne transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Store</span>
        </Link>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-[clamp(36px,6vw,80px)] text-champagne tracking-wider mb-12">
          CHECKOUT
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            {step === 'info' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl text-champagne tracking-wider mb-6 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-olive-light" />
                  SHIPPING INFO
                </h2>
                <div className="space-y-5">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Address', key: 'address', type: 'text' },
                    { label: 'City', key: 'city', type: 'text' },
                    { label: 'Country', key: 'country', type: 'text' },
                    { label: 'Postal Code', key: 'zip', type: 'text' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">{label}</label>
                      <input type={type} required value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body focus:outline-none focus:border-olive-light transition-colors" />
                    </div>
                  ))}
                  <button onClick={() => setStep('payment')}
                    className="w-full bg-olive text-obsidian py-4 rounded-full text-[11px] tracking-[0.2em] uppercase font-body hover:bg-olive-light transition-colors mt-4 flex items-center justify-center gap-2">
                    Continue to Payment <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-display text-2xl text-champagne tracking-wider mb-6 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-olive-light" />
                  PAYMENT
                </h2>
                <div className="space-y-5">
                  <fieldset disabled={payLoading} className="border-0 p-0 m-0 space-y-5 min-w-0 disabled:opacity-75">
                    {[
                      { label: 'Card Number', placeholder: '4242 4242 4242 4242' },
                      { label: 'Cardholder Name', placeholder: 'NAME ON CARD' },
                      { label: 'Expiry Date', placeholder: 'MM / YY' },
                      { label: 'CVC', placeholder: '123' },
                    ].map(({ label, placeholder }) => (
                      <div key={label}>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted-warm mb-2 block">{label}</label>
                        <input
                          type="text"
                          placeholder={placeholder}
                          className="w-full bg-transparent border-b border-champagne/30 pb-3 text-champagne font-body placeholder:text-muted-warm/30 focus:outline-none focus:border-olive-light transition-colors"
                        />
                      </div>
                    ))}
                  </fieldset>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep('info')}
                      disabled={payLoading}
                      className="flex-1 border border-champagne/30 text-champagne py-3 rounded-full text-[11px] tracking-[0.2em] uppercase font-body hover:border-olive-light transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Back
                    </button>
                    <NativeSubmitButton
                      type="button"
                      pending={payLoading}
                      onClick={placeOrder}
                      className="flex-1 bg-olive text-obsidian py-3 rounded-full text-[11px] tracking-[0.2em] uppercase font-body hover:bg-olive-light transition-colors"
                    >
                      {`Pay $${totalPrice().toFixed(2)}`}
                    </NativeSubmitButton>
                  </div>
                  {payError && <p className="text-amber-700 text-sm mt-3">{payError}</p>}
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-6 sticky top-24">
              <h3 className="font-display text-lg text-champagne tracking-wider mb-6">ORDER SUMMARY</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-champagne text-sm truncate">{item.name}</p>
                      <p className="text-muted-warm text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-olive-light text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-champagne/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-warm">Subtotal</span><span className="text-champagne">${totalPrice().toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-warm">Shipping</span><span className="text-champagne">FREE</span></div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-champagne/10">
                  <span className="text-champagne">Total</span>
                  <span className="text-olive-light">${totalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
