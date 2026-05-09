// pages/admin/Orders.jsx
import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';

const statusColors = { pending: 'badge-pending', paid: 'badge-paid', processing: 'badge-paid', shipped: 'badge-shipped', dispatched: 'badge-shipped', delivery: 'badge-delivered', delivered: 'badge-delivered', completed: 'badge-approved', cancelled: 'badge-cancelled' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminAPI.getOrders({ status: statusFilter }).then(r => { setOrders(r.data.data.orders); setLoading(false); });
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-800">All Orders</h1>
        <select className="input w-auto text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'paid', 'processing', 'shipped', 'dispatched', 'delivery', 'delivered', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="card">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                    <td className="py-3 font-medium text-primary">{o.orderNumber}</td>
                    <td className="py-3 text-gray-700">{o.userId?.name}</td>
                    <td className="py-3 font-bold text-gray-800">₹{o.finalAmount ? o.finalAmount.toLocaleString() : '0'}</td>
                    <td className="py-3">
                      <span className={o.paymentStatus === 'paid' ? 'badge-approved' : 'badge-pending'}>{o.paymentStatus}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {o.vendorOrders?.map((vo, i) => (
                          <span key={i} className={statusColors[vo.status] || 'badge-pending'}>{vo.status}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders</p>}
          </div>
        )}
      </div>
    </div>
  );
}
