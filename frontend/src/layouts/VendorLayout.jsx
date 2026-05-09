import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiUser, FiLogOut, FiPlusCircle } from 'react-icons/fi';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function VendorLayout() {
  const { user, vendor, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/vendor', label: 'Dashboard', icon: FiGrid, exact: true },
    { to: '/vendor/products', label: 'Products', icon: FiPackage },
    { to: '/vendor/orders', label: 'Orders', icon: FiShoppingBag },
    { to: '/vendor/profile', label: 'Profile', icon: FiUser },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/vendor/login');
  };

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-display text-xl font-bold text-primary">Vendor Panel</h1>
          <p className="text-gray-400 text-sm mt-1 truncate">{vendor?.storeName || user?.name}</p>
          {vendor?.approvalStatus === 'pending' && (
            <span className="badge-pending mt-2 inline-block">Awaiting Approval</span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to, exact) ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
          <Link to="/vendor/products/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-gray-700">
            <FiPlusCircle size={18} /> Add Product
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 w-full text-sm">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
