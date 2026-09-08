import api from './api'

export const authService = {
  async register(name, email, password, password_confirmation) {
    const { data } = await api.post('/api/register', {
      name,
      email,
      password,
      password_confirmation,
    })
    return data
  },

  async login(email, password) {
    const { data } = await api.post('/api/login', { email, password })
    return data
  },

  async logout() {
    const { data } = await api.post('/api/logout')
    return data
  },

  async getUser() {
    const { data } = await api.get('/api/user')
    return data
  },
}