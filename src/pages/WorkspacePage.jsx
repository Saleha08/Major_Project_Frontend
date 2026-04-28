import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, Bookmark, BookmarkCheck, Briefcase, CalendarPlus2, CheckCircle,
  Compass, Edit3, LayoutDashboard, Mail, SearchCode, Send,
  ShieldCheck, Trash2, UserRound, XCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell.jsx'
import {
  AlertBanner, Avatar, Divider, EmptyState, Field, Input,
  Pill, PrimaryButton, SearchInput, SectionCard, SecondaryButton,
  Select, SkillTag, StatCard, Textarea,
} from '../components/ui.jsx'
import { useApp } from '../context/useApp.js'
import { formatDate, formatDateTime, toArray } from '../lib/api.js'

const defaultEventForm = {
  title: '', event_name: '', category: 'TECH',
  number_of_positions: 1, deadline: '', description: '', required_skills: '',
}

const defaultProfileForm = {
  bio: '', department: '', year: '', profile_picture: '', skills: '', interests: '',
}

const defaultEmailForm = { subject: '', message: '', target: 'ALL' }

function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function mapRecordToEventForm(record) {
  return {
    title: record?.title || '',
    event_name: record?.event_name || '',
    category: record?.category || 'TECH',
    number_of_positions: record?.number_of_positions || 1,
    deadline: toDateTimeLocal(record?.deadline),
    description: record?.description || '',
    required_skills: toArray(record?.required_skills).join(', '),
  }
}

function WorkspacePage() {
  const navigate = useNavigate()
  const { api, logout, persistSession, token, user } = useApp()
  const isAdmin = user?.role === 'COLLEGE_ADMIN'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState('overview')
  const [banner, setBanner] = useState({ tone: 'info', message: '' })
  const [busy, setBusy] = useState('')
  const [eventForm, setEventForm] = useState(defaultEventForm)
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [emailForm, setEmailForm] = useState(defaultEmailForm)
  const [eventMode, setEventMode] = useState('create')
  const [editingEventId, setEditingEventId] = useState('')
  const [editingDraftId, setEditingDraftId] = useState('')
  const [studentFilters, setStudentFilters] = useState({ search: '', department: '', year: '', skills: '' })
  const [applyModal, setApplyModal] = useState({ open: false, eventId: '', eventTitle: '' })
  const [applyMessage, setApplyMessage] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [workspace, setWorkspace] = useState({
    events: [], myEvents: [], myApplications: [], notifications: [],
    pendingEvents: [], allAdminEvents: [], savedEvents: [], eventDrafts: [],
    students: [], profile: null, experiences: [], eventApplications: [],
  })

  const sections = isAdmin
    ? [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'admin', label: 'Admin Queue', icon: ShieldCheck },
        { key: 'notifications', label: 'Notifications', icon: Bell },
      ]
    : [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'discover', label: 'Discover', icon: Compass },
        { key: 'saved', label: 'Saved', icon: Bookmark },
        { key: 'events', label: 'My Events', icon: CalendarPlus2 },
        { key: 'applications', label: 'Applications', icon: Briefcase },
        { key: 'students', label: 'Students', icon: SearchCode },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'profile', label: 'Profile', icon: UserRound },
      ]

  const unreadCount = workspace.notifications.filter(n => !n.is_read).length

  const refreshWorkspace = useCallback(async () => {
    try {
      const [me, publicEvents, myEvents, myApplications, notifications,
        savedEventsResult, draftsResult, profileResult, pendingEventsResult, allAdminEventsResult,
      ] = await Promise.allSettled([
        api.get('/auth/me', { token }),
        api.get('/events?limit=12', { token }),
        api.get('/events/my-events?limit=20', { token }),
        api.get('/applications/my-applications?limit=20', { token }),
        api.get('/notifications?limit=20', { token }),
        user?.role !== 'COLLEGE_ADMIN' ? api.get('/events/saved?limit=30', { token }) : Promise.resolve(null),
        user?.role !== 'COLLEGE_ADMIN' ? api.get('/event-drafts/my-drafts?limit=20', { token }) : Promise.resolve(null),
        api.get('/profile', { token }),
        user?.role === 'COLLEGE_ADMIN' ? api.get('/admin/events/pending?limit=20', { token }) : Promise.resolve(null),
        user?.role === 'COLLEGE_ADMIN' ? api.get('/admin/events?limit=20', { token }) : Promise.resolve(null),
      ])

      const required = [me, publicEvents, myEvents, myApplications, notifications]
        .filter(r => r.status === 'rejected')
      if (required.length > 0) throw required[0].reason

      const meData = me.value
      const nextUser = meData.data?.user || user
      if (nextUser && nextUser.id !== user?.id) persistSession(token, nextUser)

      setWorkspace(cur => ({
        ...cur,
        events: publicEvents.value?.data?.events || [],
        myEvents: myEvents.value?.data?.events || [],
        myApplications: myApplications.value?.data?.applications || [],
        notifications: notifications.value?.data?.notifications || [],
        savedEvents: savedEventsResult.status === 'fulfilled' ? (savedEventsResult.value?.data?.events || []) : [],
        eventDrafts: draftsResult.status === 'fulfilled' ? (draftsResult.value?.data?.drafts || []) : [],
        pendingEvents: pendingEventsResult.status === 'fulfilled' ? (pendingEventsResult.value?.data?.events || []) : [],
        allAdminEvents: allAdminEventsResult.status === 'fulfilled' ? (allAdminEventsResult.value?.data?.events || []) : [],
        profile: profileResult.status === 'fulfilled' ? (profileResult.value?.data?.profile || null) : null,
        experiences: profileResult.status === 'fulfilled' ? (profileResult.value?.data?.experiences || []) : [],
      }))

      const profileData = profileResult.status === 'fulfilled' ? profileResult.value?.data : null
      if (profileData?.profile) {
        setProfileForm({
          bio: profileData.profile.bio || '',
          department: profileData.profile.department || '',
          year: profileData.profile.year || '',
          profile_picture: profileData.profile.profile_picture || '',
          skills: toArray(profileData.profile.skills).join(', '),
          interests: toArray(profileData.profile.interests).join(', '),
        })
      }
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
      if (error.status === 401) { logout(); navigate('/auth') }
    }
  }, [api, logout, navigate, persistSession, token, user])

  const searchStudents = useCallback(async (event) => {
    if (event) event.preventDefault()
    setBusy('students')
    const query = new URLSearchParams()
    if (studentFilters.search) query.set('search', studentFilters.search)
    if (studentFilters.department) query.set('department', studentFilters.department)
    if (studentFilters.year) query.set('year', studentFilters.year)
    toArray(studentFilters.skills).forEach(s => query.append('skills', s))
    try {
      const response = await api.get(`/students/search?${query.toString()}`, { token })
      setWorkspace(cur => ({ ...cur, students: response.data?.students || [] }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }, [api, studentFilters, token])

  const fetchEventApplications = useCallback(async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/applications?limit=20`, { token })
      setWorkspace(cur => ({ ...cur, eventApplications: response.data?.applications || [] }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    }
  }, [api, token])

  useEffect(() => {
    const t = window.setTimeout(() => refreshWorkspace(), 0)
    return () => window.clearTimeout(t)
  }, [refreshWorkspace])

  useEffect(() => {
    if (currentSection === 'students' && token) {
      const t = window.setTimeout(() => searchStudents(), 0)
      return () => window.clearTimeout(t)
    }
  }, [currentSection, searchStudents, token])

  useEffect(() => {
    if (selectedEventId && token) {
      const t = window.setTimeout(() => fetchEventApplications(selectedEventId), 0)
      return () => window.clearTimeout(t)
    }
  }, [fetchEventApplications, selectedEventId, token])

  useEffect(() => {
    if (isAdmin && ['discover','saved','events','applications','students','profile'].includes(currentSection)) {
      const t = window.setTimeout(() => setCurrentSection('overview'), 0)
      return () => window.clearTimeout(t)
    }
  }, [currentSection, isAdmin])

  function resetEventComposer() {
    setEventForm(defaultEventForm)
    setEventMode('create')
    setEditingEventId('')
    setEditingDraftId('')
  }

  function buildEventPayload({ allowPartial = false } = {}) {
    if (!allowPartial) {
      return {
        ...eventForm,
        title: eventForm.title.trim(),
        event_name: eventForm.event_name.trim(),
        description: eventForm.description.trim(),
        number_of_positions: Number(eventForm.number_of_positions),
        required_skills: toArray(eventForm.required_skills),
      }
    }
    const payload = {}
    if (eventForm.title.trim()) payload.title = eventForm.title.trim()
    if (eventForm.event_name.trim()) payload.event_name = eventForm.event_name.trim()
    if (eventForm.description.trim()) payload.description = eventForm.description.trim()
    if (eventForm.deadline) payload.deadline = eventForm.deadline
    if (eventForm.category) payload.category = eventForm.category
    if (eventForm.number_of_positions !== '' && Number(eventForm.number_of_positions) > 0)
      payload.number_of_positions = Number(eventForm.number_of_positions)
    const skills = toArray(eventForm.required_skills)
    if (skills.length) payload.required_skills = skills
    return payload
  }

  async function handleEventSubmit(event) {
    event.preventDefault()
    const isEditEvent = eventMode === 'edit-event'
    const isEditDraft = eventMode === 'edit-draft'
    setBusy(isEditEvent ? 'event-update' : isEditDraft ? 'draft-submit' : 'event')
    try {
      if (isEditEvent) {
        await api.put(`/events/${editingEventId}`, buildEventPayload(), { token })
        setBanner({ tone: 'success', message: 'Event updated and sent for admin review.' })
      } else if (isEditDraft) {
        await api.post(`/event-drafts/${editingDraftId}/submit`, {}, { token })
        setBanner({ tone: 'success', message: 'Draft submitted for admin approval.' })
      } else {
        await api.post('/events', buildEventPayload(), { token })
        setBanner({ tone: 'success', message: 'Event submitted for admin approval.' })
      }
      resetEventComposer()
      await refreshWorkspace()
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map(e => e.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally { setBusy('') }
  }

  async function handleSaveDraft() {
    const payload = buildEventPayload({ allowPartial: true })
    if (Object.keys(payload).length === 0) {
      setBanner({ tone: 'danger', message: 'Add at least one field before saving a draft.' })
      return
    }
    setBusy(eventMode === 'edit-draft' ? 'draft-update' : 'draft')
    try {
      if (eventMode === 'edit-draft') {
        await api.put(`/event-drafts/${editingDraftId}`, payload, { token })
        setBanner({ tone: 'success', message: 'Draft updated.' })
      } else {
        await api.post('/event-drafts', payload, { token })
        setBanner({ tone: 'success', message: 'Draft saved.' })
      }
      resetEventComposer()
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleDeleteDraft(draftId) {
    setBusy(`draft-delete-${draftId}`)
    try {
      await api.delete(`/event-drafts/${draftId}`, { token })
      if (editingDraftId === draftId) resetEventComposer()
      setBanner({ tone: 'success', message: 'Draft deleted.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleQuickSubmitDraft(draftId) {
    setBusy(`draft-submit-${draftId}`)
    try {
      await api.post(`/event-drafts/${draftId}/submit`, {}, { token })
      if (editingDraftId === draftId) resetEventComposer()
      setBanner({ tone: 'success', message: 'Draft submitted for approval.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleUpdateProfile(event) {
    event.preventDefault()
    setBusy('profile')
    try {
      const payload = {}
      if (profileForm.bio.trim()) payload.bio = profileForm.bio.trim()
      if (profileForm.department.trim()) payload.department = profileForm.department.trim()
      if (profileForm.year !== '') payload.year = Number(profileForm.year)
      if (profileForm.profile_picture.trim()) payload.profile_picture = profileForm.profile_picture.trim()
      if (toArray(profileForm.skills).length) payload.skills = toArray(profileForm.skills)
      if (toArray(profileForm.interests).length) payload.interests = toArray(profileForm.interests)
      if (Object.keys(payload).length === 0) {
        setBanner({ tone: 'danger', message: 'Add at least one profile field.' })
        setBusy(''); return
      }
      await api.put('/profile', payload, { token })
      setBanner({ tone: 'success', message: 'Profile saved.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleApplyToEvent() {
    setBusy('apply')
    try {
      await api.post('/applications', { event_id: applyModal.eventId, message: applyMessage }, { token })
      setApplyModal({ open: false, eventId: '', eventTitle: '' })
      setApplyMessage('')
      setBanner({ tone: 'success', message: 'Application submitted.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleStatusUpdate(applicationId, status) {
    setBusy(applicationId)
    try {
      await api.patch(`/applications/${applicationId}/status`, { status }, { token })
      setBanner({ tone: 'success', message: `Moved to ${status}.` })
      await refreshWorkspace()
      if (selectedEventId) await fetchEventApplications(selectedEventId)
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleAdminReview(eventId, decision) {
    setBusy(eventId + decision)
    try {
      if (decision === 'approve') {
        await api.patch(`/admin/events/${eventId}/approve`, {}, { token })
      } else {
        await api.patch(`/admin/events/${eventId}/reject`, { reason: 'Needs revision.' }, { token })
      }
      setBanner({ tone: 'success', message: `Event ${decision}d.` })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleNotificationAction(id, action) {
    setBusy(id + action)
    try {
      if (action === 'read') await api.patch(`/notifications/${id}/read`, {}, { token })
      if (action === 'delete') await api.delete(`/notifications/${id}`, { token })
      if (action === 'read-all') await api.patch('/notifications/read-all', {}, { token })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleToggleSavedEvent(eventId, shouldSave) {
    setBusy(`save-${eventId}`)
    try {
      if (shouldSave) {
        await api.post(`/events/${eventId}/save`, {}, { token })
      } else {
        await api.delete(`/events/${eventId}/save`, { token })
      }
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  async function handleEmailApplicants(event) {
    event.preventDefault()
    if (!selectedEventId) { setBanner({ tone: 'danger', message: 'Select an event first.' }); return }
    setBusy('email')
    try {
      const response = await api.post(`/events/${selectedEventId}/email-applicants`, {
        subject: emailForm.subject.trim(),
        message: emailForm.message.trim(),
        target: emailForm.target,
      }, { token })
      setBanner({ tone: 'success', message: response.message || 'Email sent.' })
      setEmailForm(defaultEmailForm)
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally { setBusy('') }
  }

  const savedEventIds = new Set(workspace.savedEvents.map(e => e.id))
  const selectedEvent = workspace.myEvents.find(e => e.id === selectedEventId) || null

  const stats = isAdmin
    ? [
        { label: 'Pending Approvals', value: workspace.pendingEvents.length, helper: 'Events awaiting moderation', icon: ShieldCheck },
        { label: 'Total Events', value: workspace.allAdminEvents.length, helper: 'All events in the system', icon: CalendarPlus2 },
        { label: 'Unread Alerts', value: unreadCount, helper: 'Recent admin notifications', icon: Bell },
      ]
    : [
        { label: 'Open Events', value: workspace.events.length, helper: 'Live opportunities to explore', icon: Compass },
        { label: 'My Events', value: workspace.myEvents.length, helper: 'Events you are organizing', icon: CalendarPlus2 },
        { label: 'Applications', value: workspace.myApplications.length, helper: 'Total submitted applications', icon: Briefcase },
      ]

  return (
    <AppShell
      currentSection={currentSection}
      onLogout={() => { logout(); navigate('/auth') }}
      onSectionChange={setCurrentSection}
      sections={sections}
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      user={user}
      unreadCount={unreadCount}
    >
      <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

      {/* ───── OVERVIEW ───── */}
      {currentSection === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">{isAdmin ? 'Admin Dashboard' : 'My Workspace'}</h1>
            <p className="page-subtitle">
              {isAdmin ? 'Monitor platform activity and manage event approvals.' : 'Manage your events, applications, and profile from one place.'}
            </p>
          </div>

          <div className="grid-3 mb-6">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <SectionCard title={isAdmin ? 'Pending Review' : 'Recent Events'} description="Latest items requiring attention">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(isAdmin ? workspace.pendingEvents : workspace.events).slice(0, 5).map(item => (
                  <div key={item.id} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.event_name} · {formatDate(item.deadline)}</p>
                    </div>
                    <Pill tone={item.approval_status === 'APPROVED' ? 'success' : item.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                      {item.approval_status || item.status}
                    </Pill>
                  </div>
                ))}
                {(isAdmin ? workspace.pendingEvents : workspace.events).length === 0 && (
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', padding: '12px 0' }}>Nothing here yet.</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Notifications" description="Recent platform activity">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workspace.notifications.slice(0, 5).map(n => (
                  <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                    {!n.is_read && <div className="notif-dot" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.message}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{formatDateTime(n.created_at)}</p>
                    </div>
                  </div>
                ))}
                {workspace.notifications.length === 0 && (
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', padding: '12px 0' }}>No notifications yet.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </motion.div>
      )}

      {/* ───── DISCOVER ───── */}
      {!isAdmin && currentSection === 'discover' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">Discover Events</h1>
            <p className="page-subtitle">Browse open opportunities and find your next challenge.</p>
          </div>
          <div className="grid-3">
            {workspace.events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isSaved={savedEventIds.has(event.id)}
                saveBusy={busy === `save-${event.id}`}
                onToggleSaved={(s) => handleToggleSavedEvent(event.id, s)}
                onApply={() => setApplyModal({ open: true, eventId: event.id, eventTitle: event.title })}
              />
            ))}
            {workspace.events.length === 0 && (
              <div style={{ gridColumn: '1/-1' }}>
                <EmptyState title="No events available" message="Check back soon for new opportunities." icon={Compass} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ───── SAVED ───── */}
      {!isAdmin && currentSection === 'saved' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">Saved Events</h1>
            <p className="page-subtitle">Events you bookmarked for later review.</p>
          </div>
          <div className="grid-3">
            {workspace.savedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isSaved
                saveBusy={busy === `save-${event.id}`}
                onToggleSaved={(s) => handleToggleSavedEvent(event.id, s)}
                onApply={() => setApplyModal({ open: true, eventId: event.id, eventTitle: event.title })}
              />
            ))}
            {workspace.savedEvents.length === 0 && (
              <div style={{ gridColumn: '1/-1' }}>
                <EmptyState title="No saved events" message="Save events from Discover to track them here." icon={Bookmark} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ───── MY EVENTS ───── */}
      {!isAdmin && currentSection === 'events' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">My Events</h1>
            <p className="page-subtitle">Create, manage, and track your event submissions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
            {/* Form */}
            <SectionCard
              title={eventMode === 'edit-event' ? 'Edit Event' : eventMode === 'edit-draft' ? 'Finish Draft' : 'Create New Event'}
              description={eventMode === 'edit-event'
                ? 'Changes require admin re-approval.'
                : 'Submit when ready, or save a draft to continue later.'}
            >
              <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Title">
                    <Input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="e.g. Frontend Developer" required />
                  </Field>
                  <Field label="Event Name">
                    <Input value={eventForm.event_name} onChange={e => setEventForm({...eventForm, event_name: e.target.value})} placeholder="e.g. HackFest 2025" required />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <Field label="Category">
                    <Select value={eventForm.category} onChange={e => setEventForm({...eventForm, category: e.target.value})}>
                      <option value="TECH">Technology</option>
                      <option value="CULTURAL">Cultural</option>
                      <option value="SPORTS">Sports</option>
                    </Select>
                  </Field>
                  <Field label="Open Positions">
                    <Input type="number" min="1" value={eventForm.number_of_positions}
                      onChange={e => setEventForm({...eventForm, number_of_positions: e.target.value})} required />
                  </Field>
                  <Field label="Application Deadline">
                    <Input type="datetime-local" value={eventForm.deadline}
                      onChange={e => setEventForm({...eventForm, deadline: e.target.value})} required />
                  </Field>
                </div>
                <Field label="Required Skills" hint="Comma-separated: React, Node.js, Figma">
                  <Input value={eventForm.required_skills} onChange={e => setEventForm({...eventForm, required_skills: e.target.value})} placeholder="React, TypeScript, UI/UX" />
                </Field>
                <Field label="Description">
                  <Textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required placeholder="Describe the role, responsibilities, and what you're looking for..." />
                </Field>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <PrimaryButton type="submit" busy={busy === 'event' || busy === 'event-update' || busy === 'draft-submit'}>
                    {eventMode === 'edit-event' ? 'Save Changes' : eventMode === 'edit-draft' ? 'Submit Draft' : 'Submit Event'}
                  </PrimaryButton>
                  {eventMode !== 'edit-event' && (
                    <SecondaryButton type="button" onClick={handleSaveDraft}
                      disabled={busy === 'draft' || busy === 'draft-update'}>
                      Save Draft
                    </SecondaryButton>
                  )}
                  {eventMode !== 'create' && (
                    <SecondaryButton type="button" onClick={resetEventComposer}>Cancel</SecondaryButton>
                  )}
                </div>
              </form>
            </SectionCard>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Drafts */}
              <SectionCard title="Drafts" description={`${workspace.eventDrafts.length} saved`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {workspace.eventDrafts.map(draft => (
                    <div key={draft.id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {draft.title || 'Untitled Draft'}
                        </p>
                        <Pill tone="default">Draft</Pill>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                        Updated {formatDateTime(draft.updated_at)}
                      </p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => startEditDraft(draft)}>
                          <Edit3 size={12} /> Edit
                        </button>
                        <button type="button" className="btn btn-sm btn-primary"
                          onClick={() => handleQuickSubmitDraft(draft.id)}
                          disabled={busy === `draft-submit-${draft.id}`}>
                          <Send size={12} /> Submit
                        </button>
                        <button type="button" className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={busy === `draft-delete-${draft.id}`}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {workspace.eventDrafts.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No drafts yet.</p>
                  )}
                </div>
              </SectionCard>

              {/* Published events */}
              <SectionCard title="Published Events" description="Your submitted listings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {workspace.myEvents.map(event => (
                    <div key={event.id} style={{
                      padding: '12px 14px', borderRadius: 10, border: `1px solid ${selectedEventId === event.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: selectedEventId === event.id ? '#fafaff' : 'var(--bg-surface-2)',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }} onClick={() => { setSelectedEventId(event.id); setEmailForm(defaultEmailForm) }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{event.title}</p>
                        <Pill tone={event.approval_status === 'APPROVED' ? 'success' : event.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                          {event.approval_status}
                        </Pill>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>Deadline {formatDate(event.deadline)}</p>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); startEditEvent(event) }}>
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>
                  ))}
                  {workspace.myEvents.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No published events yet.</p>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Applications + Email panel */}
          {selectedEventId && (
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
              <SectionCard title="Applications" description={`${workspace.eventApplications.length} received for ${selectedEvent?.title || 'this event'}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {workspace.eventApplications.map(app => (
                    <div key={app.id} className="application-row">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={app.student?.full_name} size={32} />
                          <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{app.student?.full_name}</p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                              {app.student?.profile?.department || '—'} · Year {app.student?.profile?.year || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Pill tone={app.status === 'PENDING' ? 'warn' : app.status === 'REJECTED' ? 'danger' : 'success'}>
                          {app.status}
                        </Pill>
                      </div>
                      {app.message && (
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5, padding: '8px 12px', background: 'var(--bg-surface-3)', borderRadius: 8 }}>
                          {app.message}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['SHORTLISTED', 'SELECTED', 'REJECTED', 'COMPLETED'].map(status => (
                          <button key={status} type="button"
                            className={`btn btn-sm ${status === 'REJECTED' ? 'btn-danger' : status === 'SELECTED' || status === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleStatusUpdate(app.id, status)}
                            disabled={busy === app.id}>
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {workspace.eventApplications.length === 0 && (
                    <EmptyState title="No applications yet" message="Applications will appear here once students respond." icon={Briefcase} />
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Email Applicants" description="Send a message to your applicants">
                <form onSubmit={handleEmailApplicants} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Audience">
                    <Select value={emailForm.target} onChange={e => setEmailForm({...emailForm, target: e.target.value})}>
                      <option value="ALL">All applicants</option>
                      <option value="SHORTLISTED">Shortlisted & selected</option>
                    </Select>
                  </Field>
                  <Field label="Subject">
                    <Input value={emailForm.subject} onChange={e => setEmailForm({...emailForm, subject: e.target.value})}
                      placeholder="Important update..." required minLength={3} />
                  </Field>
                  <Field label="Message">
                    <Textarea value={emailForm.message} onChange={e => setEmailForm({...emailForm, message: e.target.value})}
                      placeholder="Write your message..." required minLength={10} style={{ minHeight: 120 }} />
                  </Field>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <PrimaryButton type="submit" busy={busy === 'email'} style={{ flex: 1 }}>
                      <Mail size={14} /> Send Email
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => setEmailForm(defaultEmailForm)}>Clear</SecondaryButton>
                  </div>
                </form>
              </SectionCard>
            </div>
          )}
        </motion.div>
      )}

      {/* ───── APPLICATIONS ───── */}
      {!isAdmin && currentSection === 'applications' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track the status of all your event applications.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workspace.myApplications.map(app => (
              <div key={app.id} className="application-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.event?.title}
                    </p>
                    <Pill tone={app.status === 'PENDING' ? 'warn' : app.status === 'REJECTED' ? 'danger' : 'success'}>
                      {app.status}
                    </Pill>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{app.event?.organizer?.full_name}</p>
                  {app.message && (
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>{app.message}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Applied {formatDate(app.created_at)}</p>
                </div>
              </div>
            ))}
            {workspace.myApplications.length === 0 && (
              <EmptyState title="No applications yet" message="Discover events and submit your first application." icon={Briefcase} />
            )}
          </div>
        </motion.div>
      )}

      {/* ───── STUDENTS ───── */}
      {!isAdmin && currentSection === 'students' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">Student Directory</h1>
            <p className="page-subtitle">Search and discover students by skills, department, and year.</p>
          </div>
          <SectionCard className="mb-5">
            <form onSubmit={searchStudents} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <SearchInput value={studentFilters.search} onChange={e => setStudentFilters({...studentFilters, search: e.target.value})} placeholder="Name or email" />
              <Input placeholder="Department" value={studentFilters.department} onChange={e => setStudentFilters({...studentFilters, department: e.target.value})} />
              <Input placeholder="Year" value={studentFilters.year} onChange={e => setStudentFilters({...studentFilters, year: e.target.value})} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Input placeholder="Skills" value={studentFilters.skills} onChange={e => setStudentFilters({...studentFilters, skills: e.target.value})} style={{ flex: 1 }} />
                <PrimaryButton type="submit" busy={busy === 'students'}>Search</PrimaryButton>
              </div>
            </form>
          </SectionCard>
          <div className="grid-3">
            {workspace.students.map(student => (
              <div key={student.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <Avatar name={student.full_name} size={42} />
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{student.full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{student.email}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {student.profile?.department || '—'} · Year {student.profile?.year || 'N/A'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {toArray(student.profile?.skills).slice(0, 5).map(skill => (
                    <SkillTag key={skill}>{skill}</SkillTag>
                  ))}
                </div>
              </div>
            ))}
            {workspace.students.length === 0 && (
              <div style={{ gridColumn: '1/-1' }}>
                <EmptyState title="No students found" message="Try broader search terms or wait for more users to complete profiles." icon={SearchCode} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ───── NOTIFICATIONS ───── */}
      {currentSection === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">{unreadCount} unread · {workspace.notifications.length} total</p>
            </div>
            {unreadCount > 0 && (
              <SecondaryButton onClick={() => handleNotificationAction('', 'read-all')}>
                <CheckCircle size={14} /> Mark all read
              </SecondaryButton>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workspace.notifications.map(item => (
              <div key={item.id} className={`notif-item ${!item.is_read ? 'unread' : ''}`}>
                {!item.is_read && <div className="notif-dot" />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{item.message}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{formatDateTime(item.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!item.is_read && (
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleNotificationAction(item.id, 'read')}>
                      Mark read
                    </button>
                  )}
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleNotificationAction(item.id, 'delete')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {workspace.notifications.length === 0 && (
              <EmptyState title="All caught up" message="New activity and status updates will appear here." icon={Bell} />
            )}
          </div>
        </motion.div>
      )}

      {/* ───── PROFILE ───── */}
      {!isAdmin && currentSection === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">Profile Settings</h1>
            <p className="page-subtitle">Keep your academic profile and skills up to date.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
            <SectionCard title="Edit Profile">
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Bio">
                  <Textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="Tell organizers and collaborators about yourself..." />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Department">
                    <Input value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} placeholder="e.g. Computer Science" />
                  </Field>
                  <Field label="Year of Study">
                    <Input type="number" min="1" max="5" value={profileForm.year} onChange={e => setProfileForm({...profileForm, year: e.target.value})} placeholder="1–5" />
                  </Field>
                </div>
                <Field label="Profile Picture URL">
                  <Input value={profileForm.profile_picture} onChange={e => setProfileForm({...profileForm, profile_picture: e.target.value})} placeholder="https://..." />
                </Field>
                <Field label="Skills" hint="Comma-separated values">
                  <Input value={profileForm.skills} onChange={e => setProfileForm({...profileForm, skills: e.target.value})} placeholder="React, Python, Figma, etc." />
                </Field>
                <Field label="Interests" hint="Comma-separated values">
                  <Input value={profileForm.interests} onChange={e => setProfileForm({...profileForm, interests: e.target.value})} placeholder="Machine Learning, Design, etc." />
                </Field>
                <PrimaryButton type="submit" busy={busy === 'profile'} style={{ alignSelf: 'flex-start' }}>Save Changes</PrimaryButton>
              </form>
            </SectionCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionCard title="Profile Preview" description="What others see">
                <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                  <Avatar name={user?.full_name} size={60} />
                  <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 12, marginBottom: 2 }}>{user?.full_name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                    {workspace.profile?.department || 'No department'} · Year {workspace.profile?.year || 'N/A'}
                  </p>
                  {workspace.profile?.bio && (
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14, textAlign: 'left' }}>
                      {workspace.profile.bio}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {toArray(workspace.profile?.skills).map(skill => (
                      <SkillTag key={skill}>{skill}</SkillTag>
                    ))}
                  </div>
                </div>
                {workspace.experiences.length > 0 && (
                  <>
                    <Divider label="Experiences" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {workspace.experiences.map(exp => (
                        <div key={exp.id} style={{ padding: '10px 12px', background: 'var(--bg-surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{exp.title}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 3 }}>{exp.event_name} · {formatDate(exp.completed_at)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>
            </div>
          </div>
        </motion.div>
      )}

      {/* ───── ADMIN ───── */}
      {isAdmin && currentSection === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title">Admin Review Queue</h1>
            <p className="page-subtitle">Approve or reject event submissions from organizers.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SectionCard title="Pending Review" description={`${workspace.pendingEvents.length} events awaiting decision`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {workspace.pendingEvents.map(event => (
                  <div key={event.id} style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{event.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{event.organizer?.full_name}</p>
                      </div>
                      <Pill tone="warn">{event.approval_status}</Pill>
                    </div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {event.description}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <PrimaryButton busy={busy === `${event.id}approve`} onClick={() => handleAdminReview(event.id, 'approve')}>
                        <CheckCircle size={14} /> Approve
                      </PrimaryButton>
                      <SecondaryButton onClick={() => handleAdminReview(event.id, 'reject')}>
                        <XCircle size={14} /> Reject
                      </SecondaryButton>
                    </div>
                  </div>
                ))}
                {workspace.pendingEvents.length === 0 && (
                  <EmptyState title="Queue is clear" message="No pending events to review right now." icon={CheckCircle} />
                )}
              </div>
            </SectionCard>

            <SectionCard title="All Events" description="Complete moderation ledger">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {workspace.allAdminEvents.map(event => (
                  <div key={event.id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{event.organizer?.full_name} · {formatDate(event.created_at)}</p>
                    </div>
                    <Pill tone={event.approval_status === 'APPROVED' ? 'success' : event.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                      {event.approval_status}
                    </Pill>
                  </div>
                ))}
                {workspace.allAdminEvents.length === 0 && (
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)' }}>No events in the system yet.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </motion.div>
      )}

      {/* Apply Modal */}
      {applyModal.open && (
        <div className="modal-backdrop" onClick={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })}>
          <motion.div
            className="modal-box"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="modal-title">Apply to Event</h2>
            <p className="modal-subtitle">
              Submitting application for <strong>{applyModal.eventTitle}</strong>
            </p>
            <div style={{ marginBottom: 16 }}>
              <Field label="Message to Organizer">
                <Textarea
                  value={applyMessage}
                  onChange={e => setApplyMessage(e.target.value)}
                  placeholder="Tell them why you're a strong fit for this role..."
                  style={{ minHeight: 110 }}
                />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <SecondaryButton onClick={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })}>
                Cancel
              </SecondaryButton>
              <PrimaryButton busy={busy === 'apply'} onClick={handleApplyToEvent}>
                <Send size={14} /> Submit Application
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )

  function startEditEvent(eventRecord) {
    setEventMode('edit-event')
    setEditingEventId(eventRecord.id)
    setEditingDraftId('')
    setEventForm(mapRecordToEventForm(eventRecord))
  }

  function startEditDraft(draft) {
    setEventMode('edit-draft')
    setEditingDraftId(draft.id)
    setEditingEventId('')
    setEventForm(mapRecordToEventForm(draft))
  }
}

function EventCard({ event, isSaved = false, onToggleSaved, onApply, saveBusy = false }) {
  const SaveIcon = isSaved ? BookmarkCheck : Bookmark
  const catTone = event.category === 'TECH' ? 'info' : event.category === 'SPORTS' ? 'warn' : 'success'

  return (
    <motion.div whileHover={{ y: -3 }} className="event-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Pill tone={catTone}>{event.category}</Pill>
          <Pill tone={event.status === 'OPEN' ? 'success' : 'default'}>{event.status}</Pill>
        </div>
        {onToggleSaved && (
          <button
            type="button"
            onClick={() => onToggleSaved(!isSaved)}
            disabled={saveBusy}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${isSaved ? 'var(--accent-border)' : 'var(--border)'}`,
              background: isSaved ? 'var(--accent-light)' : 'var(--bg-surface)',
              color: isSaved ? 'var(--accent)' : 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            <SaveIcon size={14} />
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{event.title}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14, flex: 1 }}>{event.description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Organizer:</span> {event.organizer?.full_name || 'Campus team'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Deadline:</span> {formatDate(event.deadline)}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
        {toArray(event.required_skills).slice(0, 4).map(skill => (
          <SkillTag key={skill}>{skill}</SkillTag>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        {onToggleSaved && (
          <SecondaryButton onClick={() => onToggleSaved(!isSaved)} disabled={saveBusy} style={{ minWidth: 80 }}>
            {isSaved ? 'Saved' : 'Save'}
          </SecondaryButton>
        )}
        <PrimaryButton onClick={onApply} style={{ flex: 1 }}>Apply Now</PrimaryButton>
      </div>
    </motion.div>
  )
}

export default WorkspacePage