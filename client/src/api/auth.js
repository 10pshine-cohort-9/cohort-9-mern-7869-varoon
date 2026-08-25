import api from './axios';

export async function signupApi(name, email, password) {
  const response = await api.post('/api/auth/signup', { name, email, password });
  return response.data.data;
}

export async function loginApi(email, password) {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data.data;
}

export async function logoutApi() {
  const response = await api.post('/api/auth/logout');
  return response.data;
}
