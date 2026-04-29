import { api } from '../lib/api.js'

export function fetchConversations(token) {
  return api.get('/chats/conversations', { token })
}

export function fetchChatHistory({ eventId, otherUserId, page = 1, limit = 50 }, token) {
  const params = new URLSearchParams({
    event_id: String(eventId),
    other_user_id: String(otherUserId),
    page: String(page),
    limit: String(limit),
  })

  return api.get(`/chats/history?${params.toString()}`, { token })
}

export function sendMessage(payload, token) {
  return api.post('/chats/message', payload, { token })
}
