const API_BASE_URL = 'http://localhost:8080/api';

const api = {
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },
  async handleResponse(response) {
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = 'login.html';
      throw new Error('Session expired. Please log in again.');
    }
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    if (!response.ok) throw new Error(data?.message || `Request failed (${response.status})`);
    return data;
  },
  async request(endpoint, method, body) {
    const options = { method, headers: this.getHeaders() };
    if (body !== undefined && body !== null) options.body = JSON.stringify(body);
    return this.handleResponse(await fetch(`${API_BASE_URL}${endpoint}`, options));
  },
  get(endpoint) { return this.request(endpoint, 'GET'); },
  post(endpoint, body) { return this.request(endpoint, 'POST', body); },
  put(endpoint, body) { return this.request(endpoint, 'PUT', body); },
  delete(endpoint) { return this.request(endpoint, 'DELETE'); }
};
