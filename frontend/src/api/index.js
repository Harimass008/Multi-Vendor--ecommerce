import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor - attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── API methods ─────────────────────────────────────────────────────────────
export const authAPI = {
  registerUser: (data) => api.post('/auth/user/register', data),
  loginUser: (data) => api.post('/auth/user/login', data),
  registerVendor: (data) => api.post('/auth/vendor/register', data),
  loginVendor: (data) => api.post('/auth/vendor/login', data),
  loginAdmin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/addresses', data),
  removeAddress: (id) => api.delete(`/users/addresses/${id}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  // vendor
  create: (data) => api.post('/products/vendor/create', data),
  update: (id, data) => api.put(`/products/vendor/${id}`, data),
  delete: (id) => api.delete(`/products/vendor/${id}`),
  getMyProducts: (params) => api.get('/products/vendor/my-products', { params }),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (data) => api.put('/cart/update', data),
  remove: (id) => api.delete(`/cart/remove/${id}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  create: (data) => api.post('/orders/create', data),
  getUserOrders: (params) => api.get('/orders/user', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  // vendor
  getVendorOrders: (params) => api.get('/vendors/orders', { params }),
  updateStatus: (orderId, data) => api.put(`/vendors/orders/${orderId}/status`, data),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verify: (data) => api.post('/payment/verify', data),
};

export const vendorAPI = {
  getProfile: () => api.get('/vendors/profile'),
  updateProfile: (data) => api.put('/vendors/profile', data),
  getDashboard: () => api.get('/vendors/dashboard'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  approveVendor: (id, data) => api.put(`/admin/vendors/${id}/approve`, data),
  banVendor: (id, action) => api.put(`/admin/vendors/${id}/ban`, { action }),
  deleteVendor: (id) => api.delete(`/admin/vendors/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  createCoupon: (data) => api.post('/admin/coupons', data),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getActive: () => api.get('/coupons/active'),
};

export const notificationAPI = {
  get: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/mark-read'),
};

export default api;
