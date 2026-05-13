import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type OrderRow = {
  _id: string;
  status: string;
  total: number;
  createdAt?: string;
  customer: { name: string; email: string; address?: string; city?: string; country?: string; zip?: string };
  items: { name: string; quantity: number; price: number }[];
};

const STATUSES = ['pending', 'processing', 'shipped', 'cancelled'] as const;

export default function OrdersManager() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const load = () => {
    apiFetch<OrderRow[]>('/admin/orders', { auth: true }).then(setOrders).catch(() => setOrders([]));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-warm text-sm max-w-2xl">
        Orders are created when customers complete checkout on the store. Update status as you fulfill shipments.
      </p>
      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-champagne/10 text-left text-muted-warm text-[10px] uppercase tracking-wider">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-champagne/5 align-top">
                <td className="px-4 py-3 font-mono text-xs text-muted-warm">{String(o._id).slice(-8)}</td>
                <td className="px-4 py-3 text-champagne">
                  <div>{o.customer?.name}</div>
                  <div className="text-xs text-muted-warm">{o.customer?.email}</div>
                </td>
                <td className="px-4 py-3">${(o.total ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-muted-warm text-xs max-w-[200px]">
                  {o.items?.map((i) => (
                    <div key={i.name + i.quantity}>
                      {i.name} ×{i.quantity}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="bg-obsidian border border-champagne/20 rounded px-2 py-1 text-champagne text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p className="text-muted-warm text-sm">No orders yet.</p>}
    </div>
  );
}
