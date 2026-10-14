const API_BASE = 'http://localhost:5000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('license_auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateWallet: (walletAddress: string) => request('/auth/wallet', { method: 'PUT', body: JSON.stringify({ walletAddress }) }),

  // Software Products
  getProducts: (params?: { category?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.category && params.category !== 'ALL' && params.category !== 'undefined') {
      sp.set('category', params.category);
    }
    if (params?.search && params.search.trim() !== '' && params.search !== 'undefined') {
      sp.set('search', params.search.trim());
    }
    const q = sp.toString();
    return request(`/software${q ? `?${q}` : ''}`);
  },
  getProduct: (idOrSlug: string) => request(`/software/${idOrSlug}`),
  createProduct: (productData: any) => request('/software', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id: string, productData: any) => request(`/software/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id: string) => request(`/software/${id}`, { method: 'DELETE' }),

  // Licenses
  issueLicense: (data: any) => request('/licenses/issue', { method: 'POST', body: JSON.stringify(data) }),
  purchaseCheckout: (data: any) => request('/licenses/checkout', { method: 'POST', body: JSON.stringify(data) }),
  getPublisherLicenses: () => request('/licenses/publisher'),
  getCustomerLicenses: () => request('/licenses/customer'),
  getLicenseDetails: (id: string) => request(`/licenses/${id}`),
  activateDevice: (licenseId: number | string, data?: { deviceName?: string; deviceFingerprint?: string }) => 
    request(`/licenses/${licenseId}/activate`, { method: 'POST', body: JSON.stringify(data || {}) }),
  deactivateDevice: (licenseId: number | string) => 
    request(`/licenses/${licenseId}/deactivate`, { method: 'POST' }),
  revokeLicense: (data: { licenseId: number; reason: string; txHash?: string }) => 
    request('/licenses/revoke', { method: 'POST', body: JSON.stringify(data) }),
  renewLicense: (data: { licenseId: number; additionalDays: number; txHash?: string }) => 
    request('/licenses/renew', { method: 'POST', body: JSON.stringify(data) }),

  // Public Verification (No login required)
  verifyLicense: (licenseId: number | string) => request(`/verify/${licenseId}`),

  // Public Ledger Activity & Transactions (No login required)
  getTransactions: () => request('/transactions'),

  // Admin (Admin login required)
  getAdminMetrics: () => request('/admin/metrics'),
  listUsers: () => request('/admin/users'),
  toggleUserStatus: (userId: string) => request(`/admin/users/${userId}/toggle-status`, { method: 'PATCH' }),
  getAuditLogs: (params?: { action?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.action && params.action !== 'ALL' && params.action !== 'undefined') {
      sp.set('action', params.action);
    }
    if (params?.search && params.search.trim() !== '' && params.search !== 'undefined') {
      sp.set('search', params.search.trim());
    }
    const q = sp.toString();
    return request(`/admin/audit-logs${q ? `?${q}` : ''}`);
  },
  getAdminTransactions: () => request('/admin/transactions'),
};
