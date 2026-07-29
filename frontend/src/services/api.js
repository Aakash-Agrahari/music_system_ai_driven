import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sv_token')
      localStorage.removeItem('sv_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Search
export const searchApi = {
  searchAlbums: (query, limit = 20) =>
    api.get('/search', { params: { query, limit } }),
}

// Library
export const libraryApi = {
  getLibrary: (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc') =>
    api.get('/library', { params: { page, size, sortBy, sortDir } }),
  saveAlbum: (data) => api.post('/library', data),
  updateAlbum: (id, data) => api.put(`/library/${id}`, data),
  deleteAlbum: (id) => api.delete(`/library/${id}`),
  getAnalytics: () => api.get('/library/analytics'),
  getInsights: () => api.get('/library/insights'),
  checkInLibrary: (catalogId) => api.get(`/library/check/${catalogId}`),
}

export default api
