import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email, role });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  const getLoginLink = () => {
    if (role === 'admin') return '/admin/login';
    if (role === 'vendor') return '/vendor/login';
    return '/login';
  };

  const getRoleLabel = () => {
    if (role === 'admin') return 'Admin';
    if (role === 'vendor') return 'Vendor';
    return 'User';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-center text-sm text-gray-500 mb-6">{getRoleLabel()} Account</p>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-600 mb-4">Check your email for the reset link.</p>
            <Link to={getLoginLink()} className="text-primary hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm"><Link to={getLoginLink()} className="text-primary hover:underline">Back to login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
