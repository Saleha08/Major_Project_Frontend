import { api } from '../lib/api.js'

export function searchStudents(queryString, token) {
  return api.get(`/students/search?${queryString}`, { token })
}
