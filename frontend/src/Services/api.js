import axios from 'axios';

const api = axios.create({
  // Default to same-origin '/api' so it works in production deployments without env vars.
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
