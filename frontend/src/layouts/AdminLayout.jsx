import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiShoppingBag, FiPackage, FiTag, FiPercent, FiLogOut, FiBriefcase } from 'react-icons/fi';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/vendors', label: 'Vendors', icon: FiBriefcase },
    { to: '/admin/products', label: 'Products', icon: FiPackage },
    { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: FiTag },
    { to: '/admin/coupons', label: 'Coupons', icon: FiPercent },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-dark-800 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-display text-xl font-bold text-accent">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">{user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to, exact) ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h2 className="font-display font-semibold text-gray-800 capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
