import api from './api'

export const categoryService = {
  async getCategories() {
    const { data } = await api.get('/api/categories')
    return data
  },

  async createCategory({ name, prefix }) {
    const { data } = await api.post('/api/categories', { name, prefix })
    return data
  },

  async deleteCategory(id) {
    const { data } = await api.delete(`/api/categories/${id}`)
    return data
  },
}