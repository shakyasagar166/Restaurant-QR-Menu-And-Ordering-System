const CLOUD_BACKEND_URL = 'https://bikaner-express-backend.onrender.com';

// Dynamic resilient API_BASE:
// 1. If VITE_API_BASE_URL is provided in env (e.g. Render backend URL), use it.
// 2. If running on Vercel or public internet domain, connect to Render Cloud Backend.
// 3. If opened from mobile on local Wi-Fi (e.g. http://10.136.198.117:3000), use laptop's Wi-Fi IP port 8080.
// 4. Otherwise fallback to http://localhost:8080.
const getDynamicApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const raw = import.meta.env.VITE_API_BASE_URL.trim();
    return raw.endsWith('/api') ? raw : `${raw.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    // Cloud environments: Vercel edge CDN, Render, or any public internet domain
    if (host.includes('vercel.app') || host.includes('onrender.com') || (!host.includes('localhost') && !host.includes('127.0.0.1') && !host.startsWith('192.168.') && !host.startsWith('10.') && !host.startsWith('172.'))) {
      return `${CLOUD_BACKEND_URL}/api`;
    }
    // Local Wi-Fi mobile testing (e.g. http://10.136.198.117:3000)
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8080/api`;
    }
  }
  return 'http://localhost:8080/api';
};

const API_BASE = getDynamicApiBase();

// Cloud requests need up to 55s to handle Render free-tier cold-start wake-up
const isCloudEnv = typeof window !== 'undefined' && window.location && window.location.hostname && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('onrender.com'));
const DEFAULT_TIMEOUT_MS = isCloudEnv ? 55000 : 10000;

// Lightweight background ping to wake up cloud backend immediately on site load
export function pingBackend() {
  try {
    fetch(`${API_BASE}/ping`, { method: 'GET', mode: 'cors' }).catch(() => {});
  } catch {}
}

// Security Token Extraction for Protected Admin Operations
export function getAuthHeaders() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('bikaner_admin_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.token) {
          return {
            'Authorization': `Bearer ${parsed.token}`,
            'X-Admin-Token': parsed.token,
          };
        }
      }
    }
  } catch {}
  return {};
}

// Resilient fetch with automatic timeout to prevent browser UI freezing / hanging
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
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

// Local persistent storage for menu edits so edits NEVER get lost even if backend is sleeping or offline
export function saveLocalMenuOverride(dish) {
  try {
    const raw = localStorage.getItem('bikaner_custom_menu_edits') || '{}';
    const parsed = JSON.parse(raw);
    const key = (dish.name || '').toLowerCase().trim();
    if (key) {
      parsed[key] = {
        ...parsed[key],
        ...dish,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('bikaner_custom_menu_edits', JSON.stringify(parsed));
    }
  } catch (err) {
    console.warn('Error saving local menu override:', err);
  }
}

export function getLocalMenuOverrides() {
  try {
    const raw = localStorage.getItem('bikaner_custom_menu_edits');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const apiService = {
  // Menu APIs
  async getMenu(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetchWithTimeout(`${API_BASE}/menu?${params.toString()}`, {}, DEFAULT_TIMEOUT_MS);
    if (!res.ok) throw new Error('Failed to load menu');
    return res.json();
  },

  async getCategories() {
    const res = await fetchWithTimeout(`${API_BASE}/menu/categories`, {}, DEFAULT_TIMEOUT_MS);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  async toggleDishAvailability(id) {
    const res = await fetchWithTimeout(`${API_BASE}/menu/${id}/toggle-availability`, {
      method: 'PUT',
      headers: { ...getAuthHeaders() },
    }, DEFAULT_TIMEOUT_MS);
    if (!res.ok) throw new Error('Failed to toggle dish availability');
    return res.json();
  },

  async updateMenuItem(id, itemData) {
    // Save to local override immediately
    saveLocalMenuOverride({ ...itemData, id });

    try {
      const res = await fetchWithTimeout(`${API_BASE}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(itemData),
      }, DEFAULT_TIMEOUT_MS);

      if (res.ok) {
        const saved = await res.json();
        saveLocalMenuOverride(saved);
        return saved;
      }

      // If 404 (ID doesn't exist in cloud DB yet), auto create it via POST
      if (res.status === 404) {
        const created = await this.createMenuItem(itemData);
        saveLocalMenuOverride(created);
        return created;
      }
      throw new Error(`Server returned status ${res.status}`);
    } catch (err) {
      console.warn('Direct PUT failed, attempting fallback to POST /api/menu:', err);
      try {
        const created = await this.createMenuItem(itemData);
        saveLocalMenuOverride(created);
        return created;
      } catch (postErr) {
        // If network completely fails, return optimistic item saved in localStorage
        return { ...itemData, id: id || Date.now() };
      }
    }
  },

  async createMenuItem(itemData) {
    // Save to local override immediately
    saveLocalMenuOverride(itemData);

    const res = await fetchWithTimeout(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(itemData),
    }, DEFAULT_TIMEOUT_MS);

    if (!res.ok) {
      // Return optimistic item if backend unreachable
      return { ...itemData, id: Date.now() };
    }
    const created = await res.json();
    saveLocalMenuOverride(created);
    return created;
  },

  async deleteMenuItem(id) {
    const res = await fetchWithTimeout(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    }, DEFAULT_TIMEOUT_MS);
    if (!res.ok) throw new Error('Failed to delete dish');
    return true;
  },

  // Orders APIs (Resilient cloud order dispatch with auto-retry on cold starts)
  async placeOrder(orderData) {
    const ORDER_TIMEOUT_MS = isCloudEnv ? 45000 : 15000;
    let savedOrder = null;

    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }, ORDER_TIMEOUT_MS);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      savedOrder = await res.json();
    } catch (firstErr) {
      console.warn('Initial order dispatch notice, attempting resilient reconnect:', firstErr);
      // Automatic immediate retry: handles cold-start server wakeups
      const retryRes = await fetchWithTimeout(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      }, ORDER_TIMEOUT_MS);
      if (!retryRes.ok) throw new Error('Connection error. Please try again.');
      savedOrder = await retryRes.json();
    }

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

    const res = await fetchWithTimeout(`${API_BASE}/orders?${params.toString()}`, {
      headers: { ...getAuthHeaders() },
    }, DEFAULT_TIMEOUT_MS);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async updateOrderStatus(orderId, newStatus) {
    const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status: newStatus }),
    }, DEFAULT_TIMEOUT_MS);
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

  async updateOrderBill(orderId, billDetails) {
    const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/bill`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(billDetails),
    }, DEFAULT_TIMEOUT_MS);
    if (!res.ok) throw new Error('Failed to update order bill');
    const updated = await res.json();

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
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(paymentDetails),
    }, DEFAULT_TIMEOUT_MS);
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
    const res = await fetchWithTimeout(`${API_BASE}/orders/stats`, {
      headers: { ...getAuthHeaders() },
    }, DEFAULT_TIMEOUT_MS);
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
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ apiKey }),
    });
    return await res.json();
  },

  // Admin Authentication APIs (with resilient auto-retry on cold starts)
  async loginWithPin(pin) {
    let res;
    try {
      res = await fetchWithTimeout(`${API_BASE}/auth/pin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      }, DEFAULT_TIMEOUT_MS);
    } catch (err) {
      console.warn('First PIN login notice, retrying:', err);
      res = await fetchWithTimeout(`${API_BASE}/auth/pin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      }, DEFAULT_TIMEOUT_MS);
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid 4-digit PIN');
    }
    return data;
  },

  async loginAdmin(phone, password) {
    let res;
    try {
      res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      }, DEFAULT_TIMEOUT_MS);
    } catch (err) {
      console.warn('First admin login notice, retrying:', err);
      res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      }, DEFAULT_TIMEOUT_MS);
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    return data;
  },

  async changeCredentials(payload) {
    const res = await fetchWithTimeout(`${API_BASE}/auth/change-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    }, DEFAULT_TIMEOUT_MS);
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
    }, DEFAULT_TIMEOUT_MS);
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
