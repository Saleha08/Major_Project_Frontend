import { api } from '../lib/api.js'

export function login(credentials) {
  return api.post('/auth/login', credentials)
}

export function registerStudent(payload) {
  return api.post('/auth/register', payload)
}

export function registerAdmin(payload) {
  return api.post('/admin/register', payload)
}

export function verifyEmail(payload) {
  return api.post('/auth/verify-email', payload)
}

export function resendOtp(payload) {
  return api.post('/auth/resend-otp', payload)
}

export function adminLogin(payload) {
  return api.post('/admin/login', payload)
}

export function fetchMe(token) {
  return api.get('/auth/me', { token })
}
