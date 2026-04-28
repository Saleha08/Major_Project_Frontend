import { api } from '../lib/api.js'
import { normalizeDashboardResponse } from '../lib/dashboardNormalize.js'

function buildQuery(filters = {}) {
  const q = new URLSearchParams()
  if (filters.department) q.set('department', filters.department)
  if (filters.year !== undefined && filters.year !== '') q.set('year', String(filters.year))
  if (filters.from) q.set('startDate', filters.from)
  if (filters.to) q.set('endDate', filters.to)
  if (filters.event) q.set('event', filters.event)
  return q.toString()
}

/**
 * Primary integration: dedicated /api/dashboard/* endpoints.
 * Falls back to legacy aggregate endpoints if needed.
 */
export async function fetchDashboardAnalytics(token, filters = {}) {
  const qs = buildQuery(filters)
  const suffix = qs ? `?${qs}` : ''

  try {
    const [summaryRes, departmentRes, yearRes, eventRes, trendsRes, insightsRes, detailsRes] = await Promise.allSettled([
      api.get(`/dashboard/summary${suffix}`, { token }),
      api.get(`/dashboard/department-wise${suffix}`, { token }),
      api.get(`/dashboard/year-wise${suffix}`, { token }),
      api.get(`/dashboard/event-wise${suffix}`, { token }),
      api.get(`/dashboard/trends${suffix}`, { token }),
      api.get(`/dashboard/insights${suffix}`, { token }),
      api.get(`/dashboard/details${suffix}`, { token }),
    ])

    const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value?.data || {} : {}
    const deptItems = departmentRes.status === 'fulfilled' ? departmentRes.value?.data?.items || [] : []
    const yearItems = yearRes.status === 'fulfilled' ? yearRes.value?.data?.items || [] : []
    const eventItems = eventRes.status === 'fulfilled' ? eventRes.value?.data?.items || [] : []
    const trendPoints = trendsRes.status === 'fulfilled' ? trendsRes.value?.data?.points || [] : []
    const insightsData = insightsRes.status === 'fulfilled' ? insightsRes.value?.data || {} : {}
    const detailItems = detailsRes.status === 'fulfilled' ? detailsRes.value?.data?.items || [] : []

    const payload = {
      data: {
        dashboard: {
          summary: {
            totalApplications: summaryData.totalApplications,
            totalParticipants: summaryData.totalParticipants,
            participationRate: summaryData.participationRate,
            activeEvents: summaryData.activeEvents,
          },
          myStats: summaryData.myParticipation
            ? {
                applicationsSubmitted: summaryData.myParticipation.totalApplications,
                eventsJoined: summaryData.myParticipation.completedCount,
                savedEvents: 0,
              }
            : null,
          departmentWise: deptItems.map((row) => ({
            label: row.label,
            value: row.total_applications,
            participants: row.participants,
          })),
          yearWise: yearItems.map((row) => ({
            label: row.label,
            value: row.total_applications,
            participants: row.participants,
          })),
          trends: trendPoints.map((row) => ({
            label: row.label,
            value: row.total_applications,
            participants: row.participants,
          })),
          applications: eventItems.map((row) => ({
            label: row.title || row.event_name || 'Event',
            value: row.total_applications,
            participants: row.participants,
          })),
          drillDown: detailItems,
          insights: Array.isArray(insightsData.insights) ? insightsData.insights : [],
        },
      },
    }

    const normalized = normalizeDashboardResponse(payload)
    if (normalized) {
      return normalized
    }
  } catch (error) {
    if (!error.status || error.status !== 404) {
      throw error
    }
  }

  const legacyPaths = [`/admin/analytics${suffix}`, `/analytics/dashboard${suffix}`, `/analytics${suffix}`]

  for (const path of legacyPaths) {
    try {
      const res = await api.get(path, { token })
      const normalized = normalizeDashboardResponse(res)
      if (normalized) {
        return normalized
      }
    } catch (error) {
      if (!error.status || error.status !== 404) {
        throw error
      }
    }
  }

  return null
}
