import { api } from '../lib/api.js'

export function fetchProfile(token) {
  return api.get('/profile', { token })
}

export function updateProfile(payload, token) {
  return api.put('/profile', payload, { token })
}
