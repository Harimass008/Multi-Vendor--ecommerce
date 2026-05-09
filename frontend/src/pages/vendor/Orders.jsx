// pages/vendor/Orders.jsx
import { useState, useEffect } from 'react';
import { orderAPI } from '../../api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  paid: ['processing'],
  processing: ['shipped', 'dispatched'],
  shipped: ['dispatched', 'delivered'],
  dispatched: ['delivery', 'delivered'],
  delivery: ['delivered'],
  delivered: ['completed']
};
const statusColors = {
  pending: 'badge-pending',
  paid: 'badge-paid',
  processing: 'badge-paid',
  shipped: 'badge-shipped',
  dispatched: 'badge-shipped',
  delivery: 'badge-delivered',
  delivered: 'badge-delivered',
  completed: 'badge-approved',
  cancelled: 'badge-cancelled'
};

const formatAmount = (value) => (typeof value === 'number' ? value.toLocaleString() : '0');
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';

export default function VendorOrders() {
  const { vendor } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updateData, setUpdateData] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getVendorOrders({ status: statusFilter });
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to load vendor orders', err);
      toast.error('Failed to load orders');
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (vendor?.approvalStatus === 'approved') {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [vendor?.approvalStatus, statusFilter]);

  const handleStatusUpdate = async (orderId) => {
    const data = updateData[orderId] || {};
    if (!data.status) {
      toast.error('Select a status');
      return;
    }

    try {
      await orderAPI.updateStatus(orderId, {
        status: data.status,
        trackingNumber: data.trackingNumber || '',
        note: data.note || ''
      });
      toast.success('Status updated!');
      setUpdateData(prev => ({ ...prev, [orderId]: {} }));
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-800">Orders</h1>
        <select className="input w-auto text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'paid', 'processing', 'shipped', 'dispatched', 'delivery', 'delivered', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const vo = order.vendorOrders?.[0];
            if (!vo) return null;
            const isExpanded = expandedOrder === order._id;
            const nextStatuses = STATUS_TRANSITIONS[vo.status] || [];

            return (
              <div key={order._id} className="card">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                  <div>
                    <p className="font-semibold text-gray-800">{order.orderNumber || 'Order'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Customer: {order.userId?.name || 'Guest'} · {formatDate(order.createdAt)}</p>
                    <p className="text-sm text-primary font-bold mt-0.5">₹{formatAmount(vo?.subtotal)}</p>
                  </div>
                  <span className={statusColors[vo.status] || 'badge-pending'}>{vo.status}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      {vo.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <img src={item?.image || '/placeholder.png'} alt={item?.name || 'Product'} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-700">{item?.name || 'Product'}</p>
                            <p className="text-gray-400">₹{formatAmount(item?.price)} × {item?.quantity ?? 0}</p>
                          </div>
                          <p className="font-semibold">₹{formatAmount(item?.subtotal)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-700 mb-1">Delivery Address</p>
                      <p>{order.shippingAddress?.street || 'Address not provided'}, {order.shippingAddress?.city || '—'}, {order.shippingAddress?.state || '—'} - {order.shippingAddress?.pincode || '—'}</p>
                      <p className="mt-1">📞 {order.shippingAddress?.phone || 'No phone provided'}</p>
                    </div>

                    {nextStatuses.length > 0 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                            <select className="input text-sm" value={updateData[order._id]?.status || ''} onChange={e => setUpdateData(p => ({ ...p, [order._id]: { ...(p[order._id] || {}), status: e.target.value } }))}>
                              <option value="">Select status</option>
                              {nextStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking # (optional)</label>
                            <input type="text" className="input text-sm" placeholder="e.g. TRK12345" value={updateData[order._id]?.trackingNumber || ''} onChange={e => setUpdateData(p => ({ ...p, [order._id]: { ...(p[order._id] || {}), trackingNumber: e.target.value } }))} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                            <input type="text" className="input text-sm" placeholder="Add a note" value={updateData[order._id]?.note || ''} onChange={e => setUpdateData(p => ({ ...p, [order._id]: { ...(p[order._id] || {}), note: e.target.value } }))} />
                          </div>
                        </div>
                        <button onClick={() => handleStatusUpdate(order._id)} className="btn-primary text-sm">Update Status</button>
                      </div>
                    )}

                    {vo.statusHistory?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status History</p>
                        <div className="space-y-1">
                          {vo.statusHistory.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                              <span className="font-medium capitalize">{h.status}</span>
                              <span>· {formatDate(h.timestamp)}</span>
                              {h.note && <span className="text-gray-400">· {h.note}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
