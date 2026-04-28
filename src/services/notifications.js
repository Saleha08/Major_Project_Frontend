import { api } from '../lib/api.js'

export function fetchNotifications(token, limit = 20) {
  return api.get(`/notifications?limit=${limit}`, { token })
}

export function markNotificationRead(id, token) {
  return api.patch(`/notifications/${id}/read`, {}, { token })
}

export function deleteNotification(id, token) {
  return api.delete(`/notifications/${id}`, { token })
}

export function markAllRead(token) {
  return api.patch('/notifications/read-all', {}, { token })
}
