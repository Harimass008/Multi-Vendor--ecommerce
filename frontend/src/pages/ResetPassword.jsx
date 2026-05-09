import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const getRoleLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'vendor') return 'Vendor';
    return 'User';
};

const getLoginLink = (role) => {
    if (role === 'admin') return '/admin/login';
    if (role === 'vendor') return '/vendor/login';
    return '/login';
};

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const roleParam = searchParams.get('role') || 'user';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [role, setRole] = useState(roleParam);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.resetPassword({ token, password });
            setRole(response.data.data?.role || roleParam);
            setSuccess(true);
            toast.success('Password reset successful');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h1 className="font-display text-2xl font-bold text-center mb-2">Reset Password</h1>
                <p className="text-center text-sm text-gray-500 mb-6">{getRoleLabel(role)} Account</p>

                {!token ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Reset token is missing or invalid.</p>
                        <Link to={getLoginLink(role)} className="text-primary hover:underline">Back to login</Link>
                    </div>
                ) : success ? (
                    <div className="text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-gray-600 mb-4">Your password has been reset successfully.</p>
                        <Link to={getLoginLink(role)} className="text-primary hover:underline">Go to login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <p className="text-center text-sm">
                            <Link to={getLoginLink(role)} className="text-primary hover:underline">Back to login</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
