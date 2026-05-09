// pages/user/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

const statusColors = {
  pending: 'badge-pending', paid: 'badge-paid', processing: 'badge-paid',
  shipped: 'badge-shipped', dispatched: 'badge-shipped', delivery: 'badge-delivered',
  delivered: 'badge-delivered', completed: 'badge-approved', cancelled: 'badge-cancelled'
};

const formatAmount = (value) => (typeof value === 'number' ? value.toLocaleString() : '0');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getUserOrders().then(r => {
      setOrders(r.data.data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />)}</div>;

  if (orders.length === 0) return (
    <div className="text-center py-20">
      <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
      <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
      <Link to="/products" className="btn-primary inline-block mt-4">Start Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order._id} to={`/orders/${order._id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow group">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FiPackage className="text-primary" size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.vendorOrders?.length} vendor(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-primary">₹{formatAmount(order.finalAmount)}</p>
                <div className="mt-1">
                  {order.vendorOrders?.map((vo, i) => (
                    <span key={i} className={`${statusColors[vo.status] || 'badge-pending'} mr-1`}>{vo.status}</span>
                  ))}
                </div>
              </div>
              <FiChevronRight className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
