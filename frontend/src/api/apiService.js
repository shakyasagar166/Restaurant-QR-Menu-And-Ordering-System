// Dynamic resilient API_BASE:
// 1. If VITE_API_BASE_URL is provided in env (e.g. Render backend URL), use it.
// 2. If opened from mobile on local Wi-Fi (e.g. http://10.136.198.117:3000), use laptop's Wi-Fi IP port 8080.
// 3. Otherwise fallback to http://localhost:8080.
const getDynamicApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const raw = import.meta.env.VITE_API_BASE_URL.trim();
    return raw.endsWith('/api') ? raw : `${raw.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.includes('vercel.app')) {
      return `http://${host}:8080/api`;
    }
  }
  return 'http://localhost:8080/api';
};

const API_BASE = getDynamicApiBase();

// Resilient fetch with automatic timeout to prevent browser UI freezing / hanging
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s. Please check backend connection.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const apiService = {
  // Menu APIs
  async getMenu(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetchWithTimeout(`${API_BASE}/menu?${params.toString()}`, {}, 6000);
    if (!res.ok) throw new Error('Failed to load menu');
    return res.json();
  },

  async getCategories() {
    const res = await fetchWithTimeout(`${API_BASE}/menu/categories`, {}, 6000);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  async toggleDishAvailability(id) {
    const res = await fetchWithTimeout(`${API_BASE}/menu/${id}/toggle-availability`, {
      method: 'PUT',
    }, 6000);
    if (!res.ok) throw new Error('Failed to toggle dish availability');
    return res.json();
  },

  async updateMenuItem(id, itemData) {
    const res = await fetchWithTimeout(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    }, 8000);
    if (!res.ok) throw new Error('Failed to update dish');
    return res.json();
  },

  async createMenuItem(itemData) {
    const res = await fetchWithTimeout(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    }, 8000);
    if (!res.ok) throw new Error('Failed to add dish');
    return res.json();
  },

  async deleteMenuItem(id) {
    const res = await fetchWithTimeout(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
    }, 8000);
    if (!res.ok) throw new Error('Failed to delete dish');
    return true;
  },

  // Orders APIs
  async placeOrder(orderData) {
    const res = await fetchWithTimeout(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    }, 10000);
    if (!res.ok) throw new Error('Failed to submit order');
    const savedOrder = await res.json();

    // Instant local broadcast to all open Admin tabs on the device (0ms latency!)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('bikaner_pos_events');
        bc.postMessage({ type: 'NEW_ORDER', order: savedOrder });
        bc.close();
      }
    } catch {}

    return savedOrder;
  },

  async getOrders(status, table) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (table) params.append('table', table);

    const res = await fetchWithTimeout(`${API_BASE}/orders?${params.toString()}`, {}, 6000);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async updateOrderStatus(orderId, newStatus) {
    const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }, 8000);
    if (!res.ok) throw new Error('Failed to update status');
    const updated = await res.json();

    // Broadcast status change across all open tabs on the machine in 0.001ms
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('bikaner_pos_events');
        bc.postMessage({ type: 'ORDER_UPDATED', order: updated });
        bc.close();
      }
    } catch {}

    return updated;
  },

  async updateOrderPayment(orderId, paymentDetails) {
    const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails),
    }, 8000);
    if (!res.ok) throw new Error('Failed to update payment status');
    const updated = await res.json();

    // Broadcast payment change across all open tabs on the machine in 0.001ms
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('bikaner_pos_events');
        bc.postMessage({ type: 'ORDER_UPDATED', order: updated });
        bc.close();
      }
    } catch {}

    return updated;
  },

  async getStats() {
    const res = await fetchWithTimeout(`${API_BASE}/orders/stats`, {}, 6000);
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
  async loginWithPin(pin) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/pin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    }, 6000);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid 4-digit PIN');
    }
    return data;
  },

  async loginAdmin(phone, password) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    }, 8000);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    return data;
  },

  async changeCredentials(payload) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/change-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 8000);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update credentials');
    }
    return data;
  },

  async resetPassword(payload) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 8000);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },

  async verifyAdminSession(token) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }, 5000);
      return res.ok;
    } catch {
      return false;
    }
  },

  async logoutAdmin(token) {
    try {
      await fetchWithTimeout(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }, 4000);
    } catch {}
  },

  // Real-time Server-Sent Events (SSE) & Local IPC subscriber
  subscribeToOrderAlerts(onNewOrder, onOrderUpdated) {
    let eventSource = null;
    let reconnectTimer = null;
    let isTerminated = false;
    let broadcastChannel = null;

    // 1. Instant Local Inter-Tab Channel (0ms latency between tabs on same machine)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('bikaner_pos_events');
        broadcastChannel.onmessage = (event) => {
          if (!event || !event.data) return;
          if (event.data.type === 'NEW_ORDER' && onNewOrder && event.data.order) {
            onNewOrder(event.data.order);
          } else if (event.data.type === 'ORDER_UPDATED' && onOrderUpdated && event.data.order) {
            onOrderUpdated(event.data.order);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel notice:', e);
    }

    // 2. Real-Time Server-Sent Events (SSE) from Spring Boot Backend
    const establishSSE = () => {
      if (isTerminated) return;

      try {
        if (eventSource) {
          try { eventSource.close(); } catch {}
        }

        const streamUrl = `${API_BASE}/orders/stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.addEventListener('NEW_ORDER', (event) => {
          try {
            const order = JSON.parse(event.data);
            if (onNewOrder && order) onNewOrder(order);
          } catch (e) {
            console.error('Error parsing SSE NEW_ORDER:', e);
          }
        });

        eventSource.addEventListener('ORDER_UPDATED', (event) => {
          try {
            const order = JSON.parse(event.data);
            if (onOrderUpdated && order) onOrderUpdated(order);
          } catch (e) {
            console.error('Error parsing SSE ORDER_UPDATED:', e);
          }
        });

        eventSource.onerror = (err) => {
          // If SSE connection breaks, clean up and reconnect in 1.5 seconds
          if (eventSource) {
            try { eventSource.close(); } catch {}
            eventSource = null;
          }
          if (!isTerminated) {
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(establishSSE, 1500);
          }
        };
      } catch (err) {
        console.warn('Could not establish SSE, retry in 2.5s:', err);
        if (!isTerminated) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(establishSSE, 2500);
        }
      }
    };

    establishSSE();

    return {
      close: () => {
        isTerminated = true;
        clearTimeout(reconnectTimer);
        if (eventSource) {
          try { eventSource.close(); } catch {}
          eventSource = null;
        }
        if (broadcastChannel) {
          try { broadcastChannel.close(); } catch {}
          broadcastChannel = null;
        }
      }
    };
  }
};
