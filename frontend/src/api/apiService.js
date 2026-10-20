const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

export const apiService = {
  // Menu APIs
  async getMenu(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/menu?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load menu');
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/menu/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  async toggleDishAvailability(id) {
    const res = await fetch(`${API_BASE}/menu/${id}/toggle-availability`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to toggle dish availability');
    return res.json();
  },

  async updateMenuItem(id, itemData) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error('Failed to update dish');
    return res.json();
  },

  async createMenuItem(itemData) {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error('Failed to add dish');
    return res.json();
  },

  async deleteMenuItem(id) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete dish');
    return true;
  },

  // Orders APIs
  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to submit order');
    return res.json();
  },

  async getOrders(status, table) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (table) params.append('table', table);

    const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async updateOrderStatus(orderId, newStatus) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async updateOrderPayment(orderId, paymentDetails) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
    });
    if (!res.ok) throw new Error('Failed to update payment status');
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/orders/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },

  // AI Chat Concierge API
  async sendChatMessage(message, tableNumber, activeOrderId) {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tableNumber, activeOrderId }),
      });
      if (!res.ok) throw new Error('Chat service error');
      return await res.json();
    } catch (e) {
      console.warn('Backend chat fallback to client AI:', e);
      return null;
    }
  },

  async getGroqStatus() {
    try {
      const res = await fetch(`${API_BASE}/chat/groq-status`);
      return await res.json();
    } catch {
      return { configured: false };
    }
  },

  async updateGroqKey(apiKey) {
    const res = await fetch(`${API_BASE}/chat/groq-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return await res.json();
  },

  // Admin Authentication APIs
  async loginAdmin(phone, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    return data;
  },

  async verifyAdminSession(token) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.ok;
  },

  async logoutAdmin(token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  },

  // Real-time Server-Sent Events (SSE) subscriber
  subscribeToOrderAlerts(onNewOrder, onOrderUpdated) {
    try {
      const eventSource = new EventSource(`${API_BASE}/orders/stream`);

      eventSource.addEventListener('NEW_ORDER', (event) => {
        try {
          const order = JSON.parse(event.data);
          if (onNewOrder) onNewOrder(order);
        } catch (e) {
          console.error('Error parsing SSE NEW_ORDER:', e);
        }
      });

      eventSource.addEventListener('ORDER_UPDATED', (event) => {
        try {
          const order = JSON.parse(event.data);
          if (onOrderUpdated) onOrderUpdated(order);
        } catch (e) {
          console.error('Error parsing SSE ORDER_UPDATED:', e);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('SSE stream notice (will auto-reconnect):', err);
      };

      return eventSource;
    } catch (e) {
      console.warn('Could not establish SSE connection:', e);
      return null;
    }
  }
};
