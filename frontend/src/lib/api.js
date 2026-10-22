const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('gamersg_token') : null;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const resJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = resJson.message || `HTTP ${response.status}: Request failed`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.errors = resJson.errors || [];
      throw err;
    }

    // Unpack data wrapper from backend ({ status: 'success', data: ... })
    if (resJson && resJson.status === 'success' && resJson.data !== undefined) {
      return resJson.data;
    }

    return resJson;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, { method: 'POST', body: (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    request(endpoint, { method: 'PUT', body: (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) =>
    request(endpoint, { method: 'PATCH', body: (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};
