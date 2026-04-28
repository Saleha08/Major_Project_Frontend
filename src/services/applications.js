import { api } from '../lib/api.js'

export function fetchMyApplications(token, limit = 20) {
  return api.get(`/applications/my-applications?limit=${limit}`, { token })
}

export function createApplication(payload, token) {
  return api.post('/applications', payload, { token })
}

export function updateApplicationStatus(applicationId, status, token) {
  return api.patch(`/applications/${applicationId}/status`, { status }, { token })
}
