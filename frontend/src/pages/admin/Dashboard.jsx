import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiUsers, FiBriefcase, FiShoppingBag, FiDollarSign, FiPackage, FiAlertCircle } from 'react-icons/fi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}</div>;
  if (!data) return null;

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: FiUsers, color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Vendors', value: data.totalVendors, icon: FiBriefcase, color: 'bg-purple-500', change: `${data.pendingVendors} pending` },
    { label: 'Total Orders', value: data.totalOrders, icon: FiShoppingBag, color: 'bg-green-500', change: '' },
    { label: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-orange-500', change: '' },
  ];

  const salesChart = data.salesTrend?.map(s => ({
    name: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][s._id.month],
    sales: s.sales, orders: s.count,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className="text-white" size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="font-display text-xl font-bold text-gray-800">{value}</p>
              {change && <p className="text-xs text-green-600 mt-0.5">{change}</p>}
            </div>
          </div>
        ))}
      </div>

      {data.pendingVendors > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="text-yellow-600" size={20} />
          <p className="text-sm text-yellow-800">
            <strong>{data.pendingVendors}</strong> vendor(s) are pending approval.
            <a href="/admin/vendors?status=pending" className="ml-2 text-yellow-700 underline">Review now →</a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Sales Trend (6 months)</h2>
          {salesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [name === 'sales' ? `₹${v.toLocaleString()}` : v, name]} />
                <Bar dataKey="sales" fill="#6C63FF" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiPackage size={16} className="text-primary" /> Top Products</h2>
          <div className="space-y-3">
            {data.topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((p.totalSold / (data.topProducts[0]?.totalSold || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700 shrink-0">{p.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
