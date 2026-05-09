import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Layouts
import UserLayout from './layouts/UserLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import Home from './pages/user/Home';
import ProductList from './pages/user/ProductList';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Profile from './pages/user/Profile';
import Wishlist from './pages/user/Wishlist';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/Register';
import VendorLogin from './pages/auth/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorProfile from './pages/vendor/Profile';
import ProductForm from './pages/vendor/ProductForm';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVendors from './pages/admin/Vendors';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<ProtectedRoute role="user"><Cart /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute role="user"><Checkout /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute role="user"><Orders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute role="user"><OrderDetail /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute role="user"><Wishlist /></ProtectedRoute>} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor" element={<ProtectedRoute role="vendor"><VendorLayout /></ProtectedRoute>}>
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
