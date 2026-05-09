import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI } from '../../api';
import { useAuthStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiPackage, FiShoppingBag, FiDollarSign, FiStar, FiAlertCircle } from 'react-icons/fi';

export default function VendorDashboard() {
  const { vendor } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor?.approvalStatus === 'approved') {
      vendorAPI.getDashboard().then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
    } else { setLoading(false); }
  }, [vendor]);

  if (vendor?.approvalStatus !== 'approved') return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <div className="card text-center max-w-md">
        <FiAlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
        <h2 className="font-display text-xl font-bold text-gray-800 mb-2">
          {vendor?.approvalStatus === 'pending' ? 'Awaiting Approval' : 'Application Rejected'}
        </h2>
        <p className="text-gray-500 text-sm">
          {vendor?.approvalStatus === 'pending'
            ? 'Your vendor application is under review. We\'ll notify you once approved.'
            : `Rejected: ${vendor?.approvalNote || 'Please contact support.'}`}
        </p>
      </div>
    </div>
  );

  if (loading) return <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}</div>;

  const stats = [
    { label: 'Total Sales', value: data?.totalSales || 0, icon: FiShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-green-500' },
    { label: 'Products', value: data?.totalProducts || 0, icon: FiPackage, color: 'bg-purple-500' },
    { label: 'Rating', value: `${(data?.rating || 0).toFixed(1)} ⭐`, icon: FiStar, color: 'bg-yellow-500' },
  ];

  const chartData = data?.monthlySales?.map(m => ({
    month: ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m._id.month],
    revenue: m.revenue,
    orders: m.orders,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-800">Welcome back, {vendor?.storeName}</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your store overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
              <Icon className="text-white" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="font-display text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-800 mb-4">Revenue (Last 3 Months)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#6C63FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Low Stock */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-red-500" size={16} /> Low Stock Alerts
          </h2>
          {data?.lowStockProducts?.length === 0 ? (
            <p className="text-sm text-gray-400">All products are well stocked ✓</p>
          ) : (
            <div className="space-y-3">
              {data?.lowStockProducts?.map(p => (
                <div key={p._id} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700 truncate flex-1">{p.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/vendor/products" className="text-sm text-primary hover:underline mt-4 block">Manage Products →</Link>
        </div>
      </div>

      {/* Recent Orders */}
      {data?.recentOrders?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Date</th>
              </tr></thead>
              <tbody>
                {data.recentOrders.map(o => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="py-2 font-medium text-primary">{o.orderNumber}</td>
                    <td className="py-2 text-gray-600">{o.userId?.name}</td>
                    <td className="py-2 font-medium">₹{o.finalAmount ? o.finalAmount.toLocaleString() : '0'}</td>
                    <td className="py-2 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
