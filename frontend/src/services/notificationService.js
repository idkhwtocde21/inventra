import api from './api'

export const notificationService = {
  async getNotifications() {
    const { data } = await api.get('/api/notifications')
    return data
  },

  async markAsRead(id) {
    const { data } = await api.patch(`/api/notifications/${id}/read`)
    return data
  },

  async markAllAsRead() {
    const { data } = await api.patch('/api/notifications/read-all')
    return data
  },
}