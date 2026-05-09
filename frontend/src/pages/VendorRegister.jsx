import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function VendorRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', storeDescription: '', phone: '' });
  const { registerVendor, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerVendor(form);
    if (result.success) {
      toast.success('Registration submitted! Awaiting admin approval.');
      navigate('/vendor');
    } else toast.error(result.message);
  };

  const fields = [
    { label: 'Your Name', key: 'name', type: 'text' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Password', key: 'password', type: 'password' },
    { label: 'Store Name', key: 'storeName', type: 'text' },
    { label: 'Phone', key: 'phone', type: 'tel' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark/90 to-dark-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark">Become a Vendor</h1>
          <p className="text-gray-500 mt-2">Start selling on ShopHub</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} className="input" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea rows={3} className="input resize-none" value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-dark text-white py-2 rounded-lg font-medium hover:bg-dark-800 transition-colors">
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered? <Link to="/vendor/login" className="text-primary font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
