import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiPackage, FiMapPin, FiCreditCard, FiAlertCircle } from 'react-icons/fi';

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'completed'];
const statusColors = { pending: 'badge-pending', paid: 'badge-paid', processing: 'badge-paid', shipped: 'badge-shipped', dispatched: 'badge-shipped', delivery: 'badge-delivered', delivered: 'badge-delivered', completed: 'badge-approved', cancelled: 'badge-cancelled' };

const formatAmount = (value) => (typeof value === 'number' ? value.toLocaleString() : '0');
const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getById(id).then(r => { setOrder(r.data.data.order); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await orderAPI.cancel(id, { reason: 'Cancelled by customer' });
      setOrder(res.data.data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    }
    setCancelling(false);
  };

  if (loading) return <div className="bg-white rounded-xl h-96 animate-pulse" />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const canCancel = order.vendorOrders.every(vo => ['pending', 'paid'].includes(vo.status));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/orders')} className="text-sm text-primary hover:underline mb-2 block">← Back to orders</button>
          <h1 className="font-display text-2xl font-bold text-gray-800">{order.orderNumber}</h1>
          <p className="text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling} className="btn-danger text-sm">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Vendor Orders */}
      {order.vendorOrders.map((vo, idx) => (
        <div key={idx} className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <p className="font-semibold text-gray-700">🏪 {vo.vendorId?.storeName || 'Vendor'}</p>
            <span className={statusColors[vo.status] || 'badge-pending'}>{vo.status}</span>
          </div>

          {/* Progress bar */}
          {vo.status !== 'cancelled' && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                {statusSteps.map(s => <span key={s} className={vo.status === s || statusSteps.indexOf(vo.status) > statusSteps.indexOf(s) ? 'text-primary font-medium' : ''}>{s}</span>)}
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${((statusSteps.indexOf(vo.status) + 1) / statusSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {vo.trackingNumber && (
            <p className="text-xs text-gray-500 mb-3">Tracking: <span className="font-medium text-gray-700">{vo.trackingNumber}</span></p>
          )}

          {/* Items */}
          <div className="space-y-3">
            {vo.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item?.image || '/placeholder.png'} alt={item?.name || 'Product'} className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item?.name || 'Product'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item?.quantity ?? 0} × ₹{formatAmount(item?.price)}
                  </p>
                </div>
                <p className="font-semibold text-sm text-gray-800">₹{formatAmount(item?.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-3 pt-3 border-t">
            <p className="font-bold text-gray-800">Subtotal: ₹{formatAmount(vo?.subtotal)}</p>
          </div>
        </div>
      ))}

      {/* Price Summary */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiCreditCard className="text-primary" /> Payment Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{formatAmount(order.totalAmount)}</span></div>
          {(order.discountAmount ?? 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{formatAmount(order.discountAmount)}</span></div>}
          <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-green-600">Free</span></div>
          <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
            <span>Total Paid</span><span className="text-primary">₹{formatAmount(order.finalAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Payment Method</span><span className="capitalize">{order.paymentMethod || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Payment Status</span>
            <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>{order.paymentStatus || 'pending'}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiMapPin className="text-primary" /> Delivery Address</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-800">{order.shippingAddress?.name || 'Customer'}</p>
          <p>{order.shippingAddress?.street || 'Address not provided'}</p>
          <p>{order.shippingAddress?.city || '—'}, {order.shippingAddress?.state || '—'} - {order.shippingAddress?.pincode || '—'}</p>
          <p>{order.shippingAddress?.phone || 'No phone provided'}</p>
        </div>
      </div>
    </div>
  );
}
