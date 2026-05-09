import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart, FiUser, FiBell, FiSearch, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useAuthStore, useCartStore, useNotificationStore } from '../store';
import toast from 'react-hot-toast';

export default function UserLayout() {
  const { user, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) { fetchCart(); fetchNotifications(); }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) setProfileOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="font-display text-2xl font-bold text-primary">ShopHub</Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text" placeholder="Search products..."
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  className="input pr-10"
                />
                <button type="submit" className="absolute right-2 top-2 text-gray-400 hover:text-primary">
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="hidden md:block text-gray-600 hover:text-primary">
                <FiHeart size={22} />
              </Link>
              <Link to="/cart" className="relative text-gray-600 hover:text-primary">
                <FiShoppingCart size={22} />
                {cart?.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="relative profile-dropdown">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 text-gray-700 hover:text-primary">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                      {user.name[0].toUpperCase()}
                    </div>
                  </button>
                  <div className={`absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 ${profileOpen ? 'block' : 'hidden'}`}>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiUser size={16} /> Profile
                    </Link>
                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiPackage size={16} /> Orders
                    </Link>
                    <hr className="my-1" />
                    <button onClick={() => { handleLogout(); setProfileOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm">Login</Link>
              )}
            </div>
          </div>
        </div>

        {/* Category Nav */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 py-2 text-sm text-gray-600">
            <Link to="/products" className="hover:text-primary">All Products</Link>
            <Link to="/products?category=electronics" className="hover:text-primary">Electronics</Link>
            <Link to="/products?category=fashion" className="hover:text-primary">Fashion</Link>
            <Link to="/products?category=home" className="hover:text-primary">Home & Living</Link>
            <Link to="/products?category=sports" className="hover:text-primary">Sports</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-dark text-white mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold text-primary mb-3">ShopHub</h3>
            <p className="text-gray-400 text-sm">Your one-stop multi-vendor marketplace.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Sell on ShopHub</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/vendor/register" className="hover:text-white">Become a Vendor</Link></li>
              <li><Link to="/vendor/login" className="hover:text-white">Vendor Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <p className="text-gray-400 text-sm">support@shophub.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
