function getMonthBucketLabel(date) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
  }).format(date)
}

export function extractApplicationCount(item) {
  return Number(
    item?.applications_count
    ?? item?.application_count
    ?? item?.applicant_count
    ?? item?.applicants_count
    ?? item?.total_applications
    ?? item?.metrics?.applications
    ?? item?.applications?.length
    ?? 0,
  )
}

export function extractEngagementCount(item) {
  return Number(
    item?.saved_count
    ?? item?.bookmark_count
    ?? item?.views_count
    ?? item?.view_count
    ?? item?.engagement_count
    ?? item?.metrics?.engagement
    ?? item?.metrics?.views
    ?? 0,
  )
}

export function buildDerivedAnalytics(workspace) {
  const allEvents = workspace.allAdminEvents || []
  const monthMap = new Map()

  for (let offset = 5; offset >= 0; offset -= 1) {
    const bucketDate = new Date()
    bucketDate.setMonth(bucketDate.getMonth() - offset)
    bucketDate.setDate(1)
    const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`
    monthMap.set(key, {
      label: getMonthBucketLabel(bucketDate),
      events: 0,
      applications: 0,
    })
  }

  allEvents.forEach((event) => {
    const sourceDate = event?.created_at || event?.updated_at || event?.deadline
    const parsed = sourceDate ? new Date(sourceDate) : null
    if (parsed && !Number.isNaN(parsed.getTime())) {
      const key = `${parsed.getFullYear()}-${parsed.getMonth()}`
      if (monthMap.has(key)) {
        const bucket = monthMap.get(key)
        bucket.events += 1
        bucket.applications += extractApplicationCount(event)
      }
    }
  })

  const approved = allEvents.filter((event) => event.approval_status === 'APPROVED').length
  const pending = allEvents.filter((event) => event.approval_status === 'PENDING').length
  const rejected = allEvents.filter((event) => event.approval_status === 'REJECTED').length
  const totalApplications = allEvents.reduce((sum, event) => sum + extractApplicationCount(event), 0)
  const engagementTotal = allEvents.reduce((sum, event) => sum + extractEngagementCount(event), 0)
  const activeNotifications = (workspace.notifications || []).filter((item) => !item.is_read).length
  const avgApplications = allEvents.length ? (totalApplications / allEvents.length).toFixed(1) : '0.0'

  return {
    summary: {
      totalEvents: allEvents.length,
      totalApplications,
      totalParticipants: 0,
      participationRate: 0,
      activeEvents: allEvents.filter((e) => e.status === 'OPEN').length,
      approvalRate: allEvents.length ? Math.round((approved / allEvents.length) * 100) : 0,
      engagementTotal,
      activeNotifications,
      avgApplications,
    },
    activitySeries: Array.from(monthMap.values()),
    approvals: [
      { label: 'Approved', value: approved, tone: 'success' },
      { label: 'Pending', value: pending, tone: 'warn' },
      { label: 'Rejected', value: rejected, tone: 'danger' },
    ],
    engagement: [
      { label: 'Notifications', value: activeNotifications, tone: 'info' },
      { label: 'Bookmarks / views', value: engagementTotal, tone: 'success' },
      { label: 'Applications', value: totalApplications, tone: 'warn' },
    ],
    applications: Array.from(monthMap.values()).map((bucket) => ({
      label: bucket.label,
      value: bucket.applications,
    })),
    departmentWise: [],
    yearWise: [],
    trends: [],
    insights: [],
    drillDown: [],
    myStats: null,
    source: 'derived',
  }
}

export function buildStudentDerivedAnalytics(workspace) {
  const apps = workspace.myApplications || []
  const joined = apps.filter((a) => ['SHORTLISTED', 'SELECTED', 'COMPLETED'].includes(a.status)).length

  return {
    summary: {
      totalApplications: apps.length,
      totalParticipants: joined,
      participationRate: apps.length ? Math.round((joined / apps.length) * 100) : 0,
      activeEvents: workspace.events?.length ?? 0,
      totalEvents: workspace.events?.length ?? 0,
      approvalRate: 0,
      engagementTotal: workspace.savedEvents?.length ?? 0,
      activeNotifications: (workspace.notifications || []).filter((n) => !n.is_read).length,
      avgApplications: apps.length ? (apps.length / Math.max(workspace.events?.length || 1, 1)).toFixed(1) : '0.0',
    },
    activitySeries: [],
    approvals: [],
    engagement: [],
    applications: [],
    departmentWise: [],
    yearWise: [],
    trends: [],
    insights: [
      'Figures below reflect your saved workspace data when live analytics are unavailable.',
    ],
    drillDown: [],
    myStats: {
      applicationsSubmitted: apps.length,
      eventsJoined: joined,
      savedEvents: workspace.savedEvents?.length ?? 0,
    },
    source: 'derived',
  }
}
