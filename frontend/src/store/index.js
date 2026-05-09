import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, cartAPI, notificationAPI } from '../api';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      vendor: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      loginUser: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.loginUser(data);
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      registerUser: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.registerUser(data);
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
      },

      loginVendor: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.loginVendor(data);
          const { user, vendor, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, vendor, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      registerVendor: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.registerVendor(data);
          const { user, vendor, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, vendor, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
      },

      loginAdmin: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.loginAdmin(data);
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) {}
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, vendor: null, accessToken: null, refreshToken: null });
      },

      updateUser: (user) => set({ user }),
      updateVendor: (vendor) => set({ vendor }),
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, vendor: s.vendor }) }
  )
);

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartAPI.get();
      set({ cart: res.data.data.cart, isLoading: false });
    } catch (_) { set({ isLoading: false }); }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await cartAPI.add({ productId, quantity });
      set({ cart: res.data.data.cart });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart' };
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const res = await cartAPI.update({ productId, quantity });
      set({ cart: res.data.data.cart });
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await cartAPI.remove(productId);
      set({ cart: res.data.data.cart });
    } catch (_) {}
  },

  clearCart: async () => {
    try { await cartAPI.clear(); set({ cart: null }); } catch (_) {}
  },

  get itemCount() { return get().cart?.totalItems || 0; },
}));

// ─── Notification Store ───────────────────────────────────────────────────────
export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await notificationAPI.get();
      set({ notifications: res.data.data.notifications, unreadCount: res.data.data.unreadCount });
    } catch (_) {}
  },

  markAllRead: async () => {
    try {
      await notificationAPI.markAllRead();
      set({ unreadCount: 0 });
    } catch (_) {}
  },
}));
