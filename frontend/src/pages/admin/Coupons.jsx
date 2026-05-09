import { useState, useEffect } from 'react';
import { adminAPI, couponAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiPercent, FiDollarSign } from 'react-icons/fi';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '0', maxDiscountAmount: '', usageLimit: '', expiresAt: '',
  });

  // Fetch active coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setFetching(true);
    try {
      const res = await couponAPI.getActive();
      setCoupons(res.data.data.coupons || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      toast.error('Failed to load coupons');
    }
    setFetching(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminAPI.createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        isActive: true,
      });
      setCoupons(prev => [res.data.data.coupon, ...prev]);
      toast.success('Coupon created!');
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '0', maxDiscountAmount: '', usageLimit: '', expiresAt: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-6">Coupons & Discounts</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Coupon */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiPlus className="text-primary" /> Create Coupon
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input type="text" className="input uppercase text-sm" placeholder="e.g. SAVE20" value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select className="input text-sm" value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" className="input text-sm" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value {form.discountType === 'percentage' ? '(%)' : '(₹)'} *
                </label>
                <input type="number" min="1" className="input text-sm" value={form.discountValue}
                  onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                <input type="number" min="0" className="input text-sm" value={form.minOrderAmount}
                  onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                <input type="number" className="input text-sm" placeholder="No limit" value={form.maxDiscountAmount}
                  onChange={e => setForm(p => ({ ...p, maxDiscountAmount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                <input type="number" className="input text-sm" placeholder="Unlimited" value={form.usageLimit}
                  onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input type="datetime-local" className="input text-sm" value={form.expiresAt}
                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Active Coupons</h2>
          {fetching ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
              <p className="text-sm text-gray-400 mt-3">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiPercent className="mx-auto mb-3" size={32} />
              <p className="text-sm">No active coupons yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coupons.map(c => (
                <div key={c._id} className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-primary text-lg tracking-wider">{c.code}</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Active</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{c.description || 'No description'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} off
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Min: ₹{c.minOrderAmount}</span>
                    <span>Used: {c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : '∞'}</span>
                    <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
