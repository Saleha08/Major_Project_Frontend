/**
 * Normalizes various backend dashboard/analytics payload shapes into a stable UI model.
 */

function num(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeDashboardResponse(payload) {
  const data = payload?.data ?? payload ?? {}
  const raw = data.dashboard ?? data.analytics ?? data

  if (!raw || typeof raw !== 'object') {
    return null
  }

  const summary = raw.summary ?? raw.metrics ?? {}
  const insights = Array.isArray(raw.insights)
    ? raw.insights
    : Array.isArray(raw.insight_messages)
      ? raw.insight_messages
      : typeof raw.insights === 'string'
        ? [raw.insights]
        : []

  const departmentWise =
    raw.departmentWise ??
    raw.byDepartment ??
    raw.department_breakdown ??
    raw.departments ??
    []

  const yearWise =
    raw.yearWise ??
    raw.byYear ??
    raw.year_breakdown ??
    raw.years ??
    []

  const trends =
    raw.trends ??
    raw.trendSeries ??
    raw.activitySeries ??
    raw.events_over_time ??
    raw.lineSeries ??
    []

  const myStats = raw.myStats ?? raw.student_stats ?? raw.me ?? null

  const drillDown =
    raw.drillDown ??
    raw.drill_down ??
    raw.rows ??
    raw.table ??
    []

  const activitySeries =
    raw.activitySeries ?? raw.eventActivity ?? raw.events_over_time ?? []

  const approvals =
    raw.approvals ?? raw.approvalBreakdown ?? raw.approval_status ?? []

  const engagement =
    raw.engagement ?? raw.engagementBreakdown ?? raw.channels ?? []

  const applications =
    raw.applications ?? raw.applicationSeries ?? raw.applicationActivity ?? []

  return {
    summary: {
      totalApplications: num(summary.totalApplications ?? summary.total_applications),
      totalParticipants: num(summary.totalParticipants ?? summary.total_participants),
      participationRate: num(summary.participationRate ?? summary.participation_rate),
      activeEvents: num(summary.activeEvents ?? summary.active_events),
      totalEvents: num(summary.totalEvents ?? summary.total_events),
      approvalRate: num(summary.approvalRate ?? summary.approval_rate),
      engagementTotal: num(summary.engagementTotal ?? summary.engagement_total),
      activeNotifications: num(summary.activeNotifications ?? summary.active_notifications),
      avgApplications: summary.avgApplications ?? summary.avg_applications ?? '0.0',
    },
    insights: insights.filter(Boolean),
    departmentWise: normalizeKeyedSeries(departmentWise, 'department', 'label'),
    yearWise: normalizeKeyedSeries(yearWise, 'year', 'label'),
    trends: normalizeTrends(trends),
    myStats: myStats && typeof myStats === 'object'
      ? {
          applicationsSubmitted: num(myStats.applicationsSubmitted ?? myStats.applications),
          eventsJoined: num(myStats.eventsJoined ?? myStats.events),
          savedEvents: num(myStats.savedEvents ?? myStats.saved),
        }
      : null,
    drillDown: Array.isArray(drillDown)
      ? drillDown.map((row, i) => ({
          id: row.id ?? String(i),
          ...row,
        }))
      : [],
    activitySeries,
    approvals,
    engagement,
    applications,
    source: 'api',
  }
}

function normalizeKeyedSeries(items, keyField, labelField) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    label: String(item[labelField] ?? item.name ?? item[keyField] ?? ''),
    value: num(
      item.value
      ?? item.count
      ?? item.total
      ?? item.total_applications
      ?? item.participants,
    ),
    tone: item.tone,
  })).filter((item) => item.label)
}

function normalizeTrends(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    label: item.label ?? item.date ?? item.month ?? '',
    value: num(
      item.value
      ?? item.count
      ?? item.events
      ?? item.applications
      ?? item.events_count
      ?? item.total_applications
      ?? item.participants,
    ),
  })).filter((item) => item.label)
}

export function mergeDerivedIntoNormalized(normalized, derived) {
  if (!normalized) {
    return derived
  }

  const s = normalized.summary || {}
  const d = derived.summary || {}

  const pick = (a, b) => (a !== undefined && a !== null && a !== '' ? a : b)

  return {
    ...normalized,
    summary: {
      ...d,
      ...s,
      totalApplications: pick(s.totalApplications, d.totalApplications),
      totalParticipants: pick(s.totalParticipants, d.totalParticipants),
      participationRate: pick(s.participationRate, d.participationRate),
      activeEvents: pick(s.activeEvents, d.activeEvents),
      totalEvents: pick(s.totalEvents, d.totalEvents),
      approvalRate: pick(s.approvalRate, d.approvalRate),
      engagementTotal: pick(s.engagementTotal, d.engagementTotal),
      activeNotifications: pick(s.activeNotifications, d.activeNotifications),
      avgApplications: pick(s.avgApplications, d.avgApplications),
    },
    activitySeries: normalized.activitySeries?.length ? normalized.activitySeries : derived.activitySeries,
    approvals: normalized.approvals?.length ? normalized.approvals : derived.approvals,
    engagement: normalized.engagement?.length ? normalized.engagement : derived.engagement,
    applications: normalized.applications?.length ? normalized.applications : derived.applications,
    departmentWise: normalized.departmentWise?.length ? normalized.departmentWise : derived.departmentWise,
    yearWise: normalized.yearWise?.length ? normalized.yearWise : derived.yearWise,
    trends: normalized.trends?.length ? normalized.trends : derived.trends,
    insights: normalized.insights?.length ? normalized.insights : derived.insights,
    drillDown: normalized.drillDown?.length ? normalized.drillDown : derived.drillDown,
    myStats: normalized.myStats || derived.myStats,
  }
}
