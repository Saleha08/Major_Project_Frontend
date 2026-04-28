import { api } from '../lib/api.js'

export function fetchPublicEvents(token, params = {}) {
  const q = new URLSearchParams(params)
  const suffix = q.toString() ? `?${q}` : ''
  return api.get(`/events${suffix}`, { token })
}

export function fetchMyEvents(token, limit = 20) {
  return api.get(`/events/my-events?limit=${limit}`, { token })
}

export function fetchSavedEvents(token, limit = 30) {
  return api.get(`/events/saved?limit=${limit}`, { token })
}

export function fetchEventDrafts(token, limit = 20) {
  return api.get(`/event-drafts/my-drafts?limit=${limit}`, { token })
}

export function createEvent(payload, token) {
  return api.post('/events', payload, { token })
}

export function updateEvent(eventId, payload, token) {
  return api.put(`/events/${eventId}`, payload, { token })
}

export function saveDraft(payload, token) {
  return api.post('/event-drafts', payload, { token })
}

export function updateDraft(draftId, payload, token) {
  return api.put(`/event-drafts/${draftId}`, payload, { token })
}

export function deleteDraft(draftId, token) {
  return api.delete(`/event-drafts/${draftId}`, { token })
}

export function submitDraft(draftId, token) {
  return api.post(`/event-drafts/${draftId}/submit`, {}, { token })
}

export function fetchEventApplications(eventId, token, limit = 20) {
  return api.get(`/events/${eventId}/applications?limit=${limit}`, { token })
}

export function saveEvent(eventId, token) {
  return api.post(`/events/${eventId}/save`, {}, { token })
}

export function unsaveEvent(eventId, token) {
  return api.delete(`/events/${eventId}/save`, { token })
}

export function emailApplicants(eventId, payload, token) {
  return api.post(`/events/${eventId}/email-applicants`, payload, { token })
}
