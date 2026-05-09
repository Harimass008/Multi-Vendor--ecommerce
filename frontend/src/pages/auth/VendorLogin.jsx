// VendorLogin.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export function VendorLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { loginVendor, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginVendor(form);
    if (result.success) { toast.success('Welcome back!'); navigate('/vendor'); }
    else toast.error(result.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark/90 to-dark-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark">Vendor Login</h1>
          <p className="text-gray-500 mt-2">Access your vendor dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-dark text-white py-2 rounded-lg font-medium hover:bg-dark-800 transition-colors">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          New vendor? <Link to="/vendor/register" className="text-primary font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default VendorLogin;
