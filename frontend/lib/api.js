import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if needed
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration - try to refresh
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth state and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
        
        // Only redirect to login if we're not already on the login/register page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 (unauthorized) - token invalid or missing for protected routes
    if (error.response?.status === 401 && !error.response?.data?.code) {
      // Clear potentially invalid tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
      
      // Dispatch custom event for stores to handle auth state update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { 
          detail: { message: error.response?.data?.message || 'Session expired' } 
        }));
      }
    }

    // Handle 403 (forbidden) - user doesn't have permission
    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response?.data?.message);
    }

    // Handle 404 (not found) - resource doesn't exist
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  updatePassword: (data) => api.put('/profile/password', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addPricing: (id, data) => api.post(`/products/${id}/pricing`, data),
  getCategories: () => api.get('/products/categories'),
  createCategory: (data) => api.post('/products/categories', data),
  updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (productId, data) => api.put(`/cart/items/${productId}`, data),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/admin/stats'),
  getTraderOrders: (params) => api.get('/orders/trader/orders', { params }),
  getTraderStats: () => api.get('/orders/trader/stats'),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/products/${productId}/reviews`, { params }),
  getProductRating: (productId) => api.get(`/reviews/products/${productId}/rating`),
  addReview: (data) => api.post('/reviews/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/reviews/${id}`),
  getAll: (params) => api.get('/reviews/reviews', { params }),
};

// Offers API
export const offersAPI = {
  getActive: () => api.get('/offers/active'),
  validate: (data) => api.post('/offers/validate', data),
  create: (data) => api.post('/offers', data),
  getAll: (params) => api.get('/offers', { params }),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
  sendByEmail: (data) => api.post('/offers/send-email', data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

// Shipping API
export const shippingAPI = {
  getAreas: (params) => api.get('/shipping/areas', { params }),
  calculate: (data) => api.post('/shipping/calculate', data),
  saveAddress: (data) => api.post('/shipping/addresses', data),
  getAddresses: () => api.get('/shipping/addresses'),
  updateAddress: (id, data) => api.put(`/shipping/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/shipping/addresses/${id}`),
  sendPhoneVerification: (phone) => api.post('/shipping/verify-phone/send', { phone }),
  verifyPhone: (data) => api.post('/shipping/verify-phone', data),
  createArea: (data) => api.post('/shipping/areas', data),
  updateArea: (id, data) => api.put(`/shipping/areas/${id}`, data),
  deleteArea: (id) => api.delete(`/shipping/areas/${id}`),
};

// Tickets API
export const ticketsAPI = {
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  getOne: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  addMessage: (id, data) => api.post(`/tickets/${id}/messages`, data),
  close: (id) => api.post(`/tickets/${id}/close`),
  getAll: (params) => api.get('/tickets', { params }),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  getStats: () => api.get('/tickets/stats'),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  getCount: () => api.get('/favorites/count'),
  check: (productId) => api.get(`/favorites/check/${productId}`),
  add: (productId) => api.post('/favorites', { product_id: productId }),
  remove: (productId) => api.delete(`/favorites/${productId}`),
  toggle: (productId) => api.post('/favorites/toggle', { product_id: productId }),
  getMostFavorited: (limit = 10) => api.get('/favorites/admin/most-favorited', { params: { limit } }),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getAllUsers: () => api.get('/admin/users/all'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getPendingTraders: () => api.get('/admin/traders/pending'),
  approveTrader: (id) => api.put(`/admin/traders/${id}/approve`),
  rejectTrader: (id) => api.put(`/admin/traders/${id}/reject`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllProducts: (params) => api.get('/admin/products', { params }),
  getAllAddresses: () => api.get('/admin/addresses'),
  // Analytics
  getDashboardStats: () => api.get('/admin/analytics/dashboard'),
  getSalesByDate: (params) => api.get('/admin/analytics/sales', { params }),
  getRevenue: (params) => api.get('/admin/analytics/revenue', { params }),
  getTopProducts: (params) => api.get('/admin/analytics/products/top', { params }),
  getLowStock: (params) => api.get('/admin/analytics/products/low-stock', { params }),
  getTopCategories: (params) => api.get('/admin/analytics/categories/top', { params }),
  getUserRegistrations: (params) => api.get('/admin/analytics/users/registrations', { params }),
  getUserBehavior: () => api.get('/admin/analytics/users/behavior'),
  getMerchantActivity: (params) => api.get('/admin/analytics/merchants/activity', { params }),
  getOrderDistribution: () => api.get('/admin/analytics/orders/distribution'),
  getActiveOffers: () => api.get('/admin/offers/active'),
};