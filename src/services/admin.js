import { api } from '../lib/api.js'

export function fetchPendingEvents(token, limit = 20) {
  return api.get(`/admin/events/pending?limit=${limit}`, { token })
}

export function fetchAllAdminEvents(token, limit = 20) {
  return api.get(`/admin/events?limit=${limit}`, { token })
}

export function approveEvent(eventId, token) {
  return api.patch(`/admin/events/${eventId}/approve`, {}, { token })
}

export function rejectEvent(eventId, token, reason = 'Needs revision before approval.') {
  return api.patch(`/admin/events/${eventId}/reject`, { reason }, { token })
}
