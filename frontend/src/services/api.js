import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const statefulPath =
    config.url?.startsWith('/api/') || config.url?.includes('/login') || config.url?.includes('/register')

  if (statefulPath) {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    } catch {
      // Ignore — CSRF cookie may already be present
    }
  }

  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]

  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

export default api