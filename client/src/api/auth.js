import api from './axios';

/**
 * POST /api/auth/signup
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function signupApi(name, email, password) {
  const response = await api.post('/api/auth/signup', { name, email, password });
  return response.data.data; // { user, token }
}

/**
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function loginApi(email, password) {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data.data; // { user, token }
}

/**
 * POST /api/auth/logout
 * Requires valid JWT (attached automatically by interceptor).
 */
export async function logoutApi() {
  const response = await api.post('/api/auth/logout');
  return response.data;
}
