import api from './api'

export const itemService = {
  async getItems(params = {}) {
    const { data } = await api.get('/api/items', { params })
    return data
  },

  async getItem(id) {
    const { data } = await api.get(`/api/items/${id}`)
    return data
  },

  async createItem(payload) {
    const { data } = await api.post('/api/items', payload)
    return data
  },

  async updateItem(id, payload) {
    const { data } = await api.put(`/api/items/${id}`, payload)
    return data
  },

  async deleteItem(id) {
    const { data } = await api.delete(`/api/items/${id}`)
    return data
  },
}