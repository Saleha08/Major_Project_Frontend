import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from 'react-bootstrap/Modal'
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CalendarPlus2,
  Compass,
  LayoutDashboard,
  Mail,
  SearchCode,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell.jsx'
import {
  AlertBanner,
  EmptyState,
  Field,
  Input,
  Pill,
  PrimaryButton,
  SearchInput,
  SectionCard,
  SecondaryButton,
  Select,
  StatCard,
  Textarea,
} from '../components/ui.jsx'
import { useApp } from '../context/useApp.js'
import { formatDate, formatDateTime, toArray } from '../lib/api.js'

const defaultEventForm = {
  title: '',
  event_name: '',
  category: 'TECH',
  number_of_positions: 1,
  deadline: '',
  description: '',
  required_skills: '',
}

const defaultProfileForm = {
  bio: '',
  department: '',
  year: '',
  profile_picture: '',
  skills: '',
  interests: '',
}

const defaultEmailForm = {
  subject: '',
  message: '',
  target: 'ALL',
}

function toDateTimeLocal(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (item) => String(item).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
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
  const userRole = user?.role
  const isAdmin = userRole === 'COLLEGE_ADMIN'
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
    events: [],
    myEvents: [],
    myApplications: [],
    notifications: [],
    pendingEvents: [],
    allAdminEvents: [],
    savedEvents: [],
    eventDrafts: [],
    students: [],
    profile: null,
    experiences: [],
    eventApplications: [],
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

  const refreshWorkspace = useCallback(async () => {
    try {
      const [
        me,
        publicEvents,
        myEvents,
        myApplications,
        notifications,
        savedEventsResult,
        draftsResult,
        profileResult,
        pendingEventsResult,
        allAdminEventsResult,
      ] = await Promise.allSettled([
        api.get('/auth/me', { token }),
        api.get('/events?limit=12', { token }),
        api.get('/events/my-events?limit=20', { token }),
        api.get('/applications/my-applications?limit=20', { token }),
        api.get('/notifications?limit=20', { token }),
        userRole !== 'COLLEGE_ADMIN' ? api.get('/events/saved?limit=30', { token }) : Promise.resolve(null),
        userRole !== 'COLLEGE_ADMIN' ? api.get('/event-drafts/my-drafts?limit=20', { token }) : Promise.resolve(null),
        api.get('/profile', { token }),
        userRole === 'COLLEGE_ADMIN' ? api.get('/admin/events/pending?limit=20', { token }) : Promise.resolve(null),
        userRole === 'COLLEGE_ADMIN' ? api.get('/admin/events?limit=20', { token }) : Promise.resolve(null),
      ])

      const requiredFailures = [me, publicEvents, myEvents, myApplications, notifications]
        .filter((result) => result.status === 'rejected')

      if (requiredFailures.length > 0) {
        throw requiredFailures[0].reason
      }

      const meData = me.value
      const publicEventsData = publicEvents.value
      const myEventsData = myEvents.value
      const myApplicationsData = myApplications.value
      const notificationsData = notifications.value
      const savedEventsData = savedEventsResult.status === 'fulfilled' ? savedEventsResult.value : null
      const draftsData = draftsResult.status === 'fulfilled' ? draftsResult.value : null
      const profileData = profileResult.status === 'fulfilled' ? profileResult.value : null
      const pendingEventsData = pendingEventsResult.status === 'fulfilled' ? pendingEventsResult.value : null
      const allAdminEventsData = allAdminEventsResult.status === 'fulfilled' ? allAdminEventsResult.value : null

      const nextUser = meData.data?.user || user
      if (
        nextUser &&
        (
          nextUser.id !== user?.id ||
          nextUser.role !== user?.role ||
          nextUser.full_name !== user?.full_name ||
          nextUser.email !== user?.email ||
          nextUser.status !== user?.status
        )
      ) {
        persistSession(token, nextUser)
      }
      setWorkspace((current) => ({
        ...current,
        events: publicEventsData.data?.events || [],
        myEvents: myEventsData.data?.events || [],
        myApplications: myApplicationsData.data?.applications || [],
        notifications: notificationsData.data?.notifications || [],
        savedEvents: savedEventsData?.data?.events || [],
        eventDrafts: draftsData?.data?.drafts || [],
        pendingEvents: pendingEventsData?.data?.events || [],
        allAdminEvents: allAdminEventsData?.data?.events || [],
        profile: profileData?.data?.profile || null,
        experiences: profileData?.data?.experiences || [],
      }))

      if (profileData?.data?.profile) {
        setProfileForm({
          bio: profileData.data.profile.bio || '',
          department: profileData.data.profile.department || '',
          year: profileData.data.profile.year || '',
          profile_picture: profileData.data.profile.profile_picture || '',
          skills: toArray(profileData.data.profile.skills).join(', '),
          interests: toArray(profileData.data.profile.interests).join(', '),
        })
      }
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
      if (error.status === 401) {
        logout()
        navigate('/auth')
      }
    }
  }, [api, logout, navigate, persistSession, token, user, userRole])

  const searchStudents = useCallback(async (event) => {
    if (event) event.preventDefault()
    setBusy('students')

    const query = new URLSearchParams()
    if (studentFilters.search) query.set('search', studentFilters.search)
    if (studentFilters.department) query.set('department', studentFilters.department)
    if (studentFilters.year) query.set('year', studentFilters.year)
    toArray(studentFilters.skills).forEach((skill) => query.append('skills', skill))

    try {
      const response = await api.get(`/students/search?${query.toString()}`, { token })
      setWorkspace((current) => ({
        ...current,
        students: response.data?.students || [],
      }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }, [api, studentFilters, token])

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
    if (eventForm.number_of_positions !== '' && Number(eventForm.number_of_positions) > 0) {
      payload.number_of_positions = Number(eventForm.number_of_positions)
    }

    const skills = toArray(eventForm.required_skills)
    if (skills.length) {
      payload.required_skills = skills
    }

    return payload
  }

  function startEditEvent(eventRecord) {
    setEventMode('edit-event')
    setEditingEventId(eventRecord.id)
    setEditingDraftId('')
    setEventForm(mapRecordToEventForm(eventRecord))
    setCurrentSection('events')
  }

  function startEditDraft(draft) {
    setEventMode('edit-draft')
    setEditingDraftId(draft.id)
    setEditingEventId('')
    setEventForm(mapRecordToEventForm(draft))
    setCurrentSection('events')
  }

  async function handleEventSubmit(event) {
    event.preventDefault()

    const isEditEvent = eventMode === 'edit-event'
    const isEditDraft = eventMode === 'edit-draft'
    setBusy(isEditEvent ? 'event-update' : isEditDraft ? 'draft-submit' : 'event')

    try {
      if (isEditEvent) {
        await api.put(`/events/${editingEventId}`, buildEventPayload(), { token })
        setBanner({ tone: 'success', message: 'Event updated and sent back for admin review.' })
      } else if (isEditDraft) {
        await api.post(`/event-drafts/${editingDraftId}/submit`, {}, { token })
        setBanner({ tone: 'success', message: 'Draft submitted. It is now waiting for admin approval.' })
      } else {
        await api.post('/events', buildEventPayload(), { token })
        setBanner({ tone: 'success', message: 'Event submitted. It is now waiting for admin approval.' })
      }

      resetEventComposer()
      await refreshWorkspace()
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleSaveDraft() {
    const payload = buildEventPayload({ allowPartial: true })

    if (Object.keys(payload).length === 0) {
      setBanner({ tone: 'danger', message: 'Add at least one event field before saving a draft.' })
      return
    }

    setBusy(eventMode === 'edit-draft' ? 'draft-update' : 'draft')

    try {
      if (eventMode === 'edit-draft') {
        await api.put(`/event-drafts/${editingDraftId}`, payload, { token })
        setBanner({ tone: 'success', message: 'Draft updated successfully.' })
      } else {
        await api.post('/event-drafts', payload, { token })
        setBanner({ tone: 'success', message: 'Draft saved successfully.' })
      }

      resetEventComposer()
      await refreshWorkspace()
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleDeleteDraft(draftId) {
    setBusy(`draft-delete-${draftId}`)

    try {
      await api.delete(`/event-drafts/${draftId}`, { token })
      if (editingDraftId === draftId) {
        resetEventComposer()
      }
      setBanner({ tone: 'success', message: 'Draft deleted successfully.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleQuickSubmitDraft(draftId) {
    setBusy(`draft-submit-${draftId}`)

    try {
      await api.post(`/event-drafts/${draftId}/submit`, {}, { token })
      if (editingDraftId === draftId) {
        resetEventComposer()
      }
      setBanner({ tone: 'success', message: 'Draft submitted. It is now waiting for admin approval.' })
      await refreshWorkspace()
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
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
        setBanner({ tone: 'danger', message: 'Add at least one valid profile field before saving.' })
        setBusy('')
        return
      }

      await api.put('/profile', payload, { token })
      setBanner({ tone: 'success', message: 'Profile updated successfully.' })
      await refreshWorkspace()
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleApplyToEvent() {
    setBusy('apply')

    try {
      await api.post('/applications', {
        event_id: applyModal.eventId,
        message: applyMessage,
      }, { token })
      setApplyModal({ open: false, eventId: '', eventTitle: '' })
      setApplyMessage('')
      setBanner({ tone: 'success', message: 'Application submitted successfully.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  const fetchEventApplications = useCallback(async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/applications?limit=20`, { token })
      setWorkspace((current) => ({
        ...current,
        eventApplications: response.data?.applications || [],
      }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    }
  }, [api, token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshWorkspace()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refreshWorkspace])

  useEffect(() => {
    if (currentSection === 'students' && token) {
      const timer = window.setTimeout(() => {
        searchStudents()
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [currentSection, searchStudents, token])

  useEffect(() => {
    if (selectedEventId && token) {
      const timer = window.setTimeout(() => {
        fetchEventApplications(selectedEventId)
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [fetchEventApplications, selectedEventId, token])

  useEffect(() => {
    if (isAdmin && ['discover', 'saved', 'events', 'applications', 'students', 'profile'].includes(currentSection)) {
      const timer = window.setTimeout(() => {
        setCurrentSection('overview')
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [currentSection, isAdmin])

  async function handleStatusUpdate(applicationId, status) {
    setBusy(applicationId)

    try {
      await api.patch(`/applications/${applicationId}/status`, { status }, { token })
      setBanner({ tone: 'success', message: `Application moved to ${status}.` })
      await refreshWorkspace()
      if (selectedEventId) {
        await fetchEventApplications(selectedEventId)
      }
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleAdminReview(eventId, decision) {
    setBusy(eventId + decision)

    try {
      if (decision === 'approve') {
        await api.patch(`/admin/events/${eventId}/approve`, {}, { token })
      } else {
        await api.patch(`/admin/events/${eventId}/reject`, { reason: 'Needs revision before approval.' }, { token })
      }
      setBanner({ tone: 'success', message: `Event ${decision}d successfully.` })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleNotificationAction(id, action) {
    setBusy(id + action)

    try {
      if (action === 'read') {
        await api.patch(`/notifications/${id}/read`, {}, { token })
      }
      if (action === 'delete') {
        await api.delete(`/notifications/${id}`, { token })
      }
      if (action === 'read-all') {
        await api.patch('/notifications/read-all', {}, { token })
      }
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  async function handleToggleSavedEvent(eventId, shouldSave) {
    setBusy(`save-${eventId}`)

    try {
      if (shouldSave) {
        await api.post(`/events/${eventId}/save`, {}, { token })
        setBanner({ tone: 'success', message: 'Event saved for later.' })
      } else {
        await api.delete(`/events/${eventId}/save`, { token })
        setBanner({ tone: 'success', message: 'Event removed from saved list.' })
      }

      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  function handleSelectEvent(eventId) {
    setSelectedEventId(eventId)
    setEmailForm(defaultEmailForm)
  }

  async function handleEmailApplicants(event) {
    event.preventDefault()

    if (!selectedEventId) {
      setBanner({ tone: 'danger', message: 'Choose one of your events before sending email.' })
      return
    }

    setBusy('email')

    try {
      const response = await api.post(`/events/${selectedEventId}/email-applicants`, {
        subject: emailForm.subject.trim(),
        message: emailForm.message.trim(),
        target: emailForm.target,
      }, { token })
      setBanner({ tone: 'success', message: response.message || 'Email sent successfully.' })
      setEmailForm(defaultEmailForm)
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
  }

  const stats = isAdmin
    ? [
        { label: 'Pending approvals', value: workspace.pendingEvents.length, helper: 'Events currently waiting for moderation.', icon: ShieldCheck },
        { label: 'Total events', value: workspace.allAdminEvents.length, helper: 'Full moderation ledger across all states.', icon: CalendarPlus2 },
        { label: 'Unread notifications', value: workspace.notifications.filter((item) => !item.is_read).length, helper: 'Recent operational updates for the admin workspace.', icon: Bell },
      ]
    : [
        { label: 'Open opportunities', value: workspace.events.length, helper: 'Approved events students can act on right now.', icon: Compass },
        { label: 'Events you manage', value: workspace.myEvents.length, helper: 'Your personal organizer pipeline.', icon: CalendarPlus2 },
        { label: 'Unread notifications', value: workspace.notifications.filter((item) => !item.is_read).length, helper: 'Keep replies and approvals from stalling.', icon: Bell },
      ]
  const selectedEvent = workspace.myEvents.find((item) => item.id === selectedEventId) || null
  const savedEventIds = new Set(workspace.savedEvents.map((item) => item.id))

  return (
    <AppShell
      currentSection={currentSection}
      onLogout={handleLogout}
      onSectionChange={setCurrentSection}
      sections={sections}
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      user={user}
    >
      <div className="space-y-6">
        <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

        {currentSection === 'overview' ? (
          <>
            <section className="grid gap-6 xl:grid-cols-3">
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>
            <SectionCard title="What’s moving today" description="A quick pulse across activity in your workspace.">
              <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
                <SnapshotList title={isAdmin ? 'Pending review' : 'Recent events'} items={(isAdmin ? workspace.pendingEvents : workspace.events).slice(0, 4)} type="event" />
                <SnapshotList title="Latest notifications" items={workspace.notifications.slice(0, 4)} type="notification" />
              </div>
            </SectionCard>
          </>
        ) : null}

        {!isAdmin && currentSection === 'discover' ? (
          <SectionCard title="Discover events" description="Public approved events from the backend, ready for students to explore and apply.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workspace.events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSaved={savedEventIds.has(event.id)}
                  saveBusy={busy === `save-${event.id}`}
                  onToggleSaved={(shouldSave) => handleToggleSavedEvent(event.id, shouldSave)}
                  onApply={() => setApplyModal({ open: true, eventId: event.id, eventTitle: event.title })}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'saved' ? (
          <SectionCard title="Saved events" description="Keep interesting opportunities here so you can revisit and compare them later.">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workspace.savedEvents.length ? workspace.savedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSaved
                  saveBusy={busy === `save-${event.id}`}
                  onToggleSaved={(shouldSave) => handleToggleSavedEvent(event.id, shouldSave)}
                  onApply={() => setApplyModal({ open: true, eventId: event.id, eventTitle: event.title })}
                />
              )) : <EmptyState title="No saved events yet" message="Save events from Discover to build your own shortlist." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'events' ? (
          <div className="grid gap-7 2xl:grid-cols-[1.18fr_0.82fr]">
            <SectionCard
              title={eventMode === 'edit-event' ? 'Edit event' : eventMode === 'edit-draft' ? 'Finish your draft' : 'Create a new event'}
              description={eventMode === 'edit-event'
                ? 'Any updates you save will go back through admin approval before becoming public again.'
                : eventMode === 'edit-draft'
                  ? 'Drafts let you work in stages. Submit when everything looks ready.'
                  : 'Submissions go through admin approval before becoming public.'}
            >
              <form onSubmit={handleEventSubmit} className="grid gap-5">
                <Field label="Title"><Input value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} required /></Field>
                <Field label="Event name"><Input value={eventForm.event_name} onChange={(event) => setEventForm({ ...eventForm, event_name: event.target.value })} required /></Field>
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Category">
                    <Select value={eventForm.category} onChange={(event) => setEventForm({ ...eventForm, category: event.target.value })}>
                      <option value="TECH">Tech</option>
                      <option value="CULTURAL">Cultural</option>
                      <option value="SPORTS">Sports</option>
                    </Select>
                  </Field>
                  <Field label="Positions">
                    <Input type="number" min="1" value={eventForm.number_of_positions} onChange={(event) => setEventForm({ ...eventForm, number_of_positions: event.target.value })} required />
                  </Field>
                  <Field label="Deadline">
                    <Input type="datetime-local" value={eventForm.deadline} onChange={(event) => setEventForm({ ...eventForm, deadline: event.target.value })} required />
                  </Field>
                </div>
                <Field label="Required skills" hint="Comma-separated values such as React, Node.js, Design">
                  <Input value={eventForm.required_skills} onChange={(event) => setEventForm({ ...eventForm, required_skills: event.target.value })} />
                </Field>
                <Field label="Description">
                  <Textarea value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} required />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton
                    type="submit"
                    busy={busy === 'event' || busy === 'event-update' || busy === 'draft-submit'}
                  >
                    {eventMode === 'edit-event' ? 'Save changes' : eventMode === 'edit-draft' ? 'Submit draft' : 'Submit event'}
                  </PrimaryButton>
                  {eventMode !== 'edit-event' ? (
                    <SecondaryButton
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={busy === 'draft' || busy === 'draft-update' || busy === 'draft-submit'}
                    >
                      {eventMode === 'edit-draft' ? 'Save draft changes' : 'Save draft'}
                    </SecondaryButton>
                  ) : null}
                  {eventMode !== 'create' ? (
                    <SecondaryButton type="button" onClick={resetEventComposer} disabled={busy !== ''}>
                      Cancel
                    </SecondaryButton>
                  ) : null}
                </div>
              </form>
            </SectionCard>

            <SectionCard title="Managed events" description="Track approval status and review applications for your listings.">
              <div className="mb-6">
                <h3 className="mb-3 font-display text-[1.35rem] font-semibold text-slate-950">Drafts</h3>
                <div className="space-y-3">
                  {workspace.eventDrafts.length ? workspace.eventDrafts.map((draft) => (
                    <div key={draft.id} className="rounded-[20px] border border-slate-200 p-5 dark:border-slate-700">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="mb-1 font-display text-[1.25rem] font-semibold text-slate-950">{draft.title || 'Untitled draft'}</p>
                          <p className="mb-0 text-[0.98rem] text-soft">
                            Last updated {formatDateTime(draft.updated_at)}
                          </p>
                        </div>
                        <Pill tone="default">Draft</Pill>
                      </div>
                      <p className="mb-4 text-[1rem] leading-7 text-soft">
                        {draft.description || 'Keep building this event when you are ready.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <PrimaryButton type="button" onClick={() => startEditDraft(draft)}>Edit draft</PrimaryButton>
                        <SecondaryButton
                          type="button"
                          onClick={() => handleQuickSubmitDraft(draft.id)}
                          disabled={busy === `draft-submit-${draft.id}`}
                        >
                          Quick submit
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={busy === `draft-delete-${draft.id}`}
                        >
                          Delete
                        </SecondaryButton>
                      </div>
                    </div>
                  )) : <EmptyState title="No drafts yet" message="Use Save draft to start building an event without submitting it yet." />}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                <h3 className="mb-3 font-display text-[1.35rem] font-semibold text-slate-950">Published and submitted events</h3>
              <div className="space-y-3">
                {workspace.myEvents.length ? workspace.myEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-[20px] border p-6 transition ${
                      selectedEventId === event.id
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectEvent(event.id)}
                      className="w-full text-left"
                    >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Pill tone="info">{event.category}</Pill>
                      <Pill tone={event.approval_status === 'APPROVED' ? 'success' : event.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                        {event.approval_status}
                      </Pill>
                    </div>
                    <h3 className="mb-2 font-display text-[1.45rem] font-semibold text-slate-950">{event.title}</h3>
                    <p className="mb-3 text-[1rem] leading-7 text-soft">{event.description}</p>
                    <p className="mb-0 text-[0.95rem] font-medium text-soft">Deadline {formatDate(event.deadline)}</p>
                    </button>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <SecondaryButton type="button" onClick={() => startEditEvent(event)}>
                        Edit event
                      </SecondaryButton>
                    </div>
                  </div>
                )) : <EmptyState title="No managed events yet" message="Create your first opportunity to start receiving applications." />}
              </div>
              </div>

              {selectedEventId ? (
                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <h3 className="mb-3 font-display text-lg font-semibold">Applications</h3>
                  <div className="space-y-3">
                    {workspace.eventApplications.length ? workspace.eventApplications.map((application) => (
                      <div key={application.id} className="rounded-[20px] border border-slate-200 p-5 dark:border-slate-700">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                              <p className="mb-1 text-[1.05rem] font-semibold text-slate-950">{application.student?.full_name}</p>
                              <p className="mb-0 text-[0.98rem] text-soft">{application.student?.profile?.department || 'Department pending'} • Year {application.student?.profile?.year || 'NA'}</p>
                          </div>
                          <Pill tone={application.status === 'PENDING' ? 'warn' : application.status === 'REJECTED' ? 'danger' : 'success'}>
                            {application.status}
                          </Pill>
                        </div>
                        <p className="text-[1rem] leading-7 text-soft">{application.message || 'No note attached.'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['SHORTLISTED', 'SELECTED', 'REJECTED', 'COMPLETED'].map((status) => (
                            <SecondaryButton
                              key={status}
                              onClick={() => handleStatusUpdate(application.id, status)}
                              disabled={busy === application.id}
                              className="text-[0.92rem]"
                            >
                              {status}
                            </SecondaryButton>
                          ))}
                        </div>
                      </div>
                    )) : <EmptyState title="No applications yet" message="Applications will appear here after students respond to your event." />}
                  </div>

                  <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-display text-[1.4rem] font-semibold text-slate-950">Email applicants</h3>
                        <p className="mb-0 text-[1rem] leading-7 text-soft">
                          Send an update for {selectedEvent?.title || 'this event'} to all applicants or only shortlisted candidates.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleEmailApplicants} className="grid gap-5">
                      <Field label="Audience">
                        <Select value={emailForm.target} onChange={(event) => setEmailForm({ ...emailForm, target: event.target.value })}>
                          <option value="ALL">All applicants</option>
                          <option value="SHORTLISTED">Shortlisted and selected applicants</option>
                        </Select>
                      </Field>
                      <Field label="Subject">
                        <Input
                          value={emailForm.subject}
                          onChange={(event) => setEmailForm({ ...emailForm, subject: event.target.value })}
                          placeholder="Important update for applicants"
                          required
                          minLength={3}
                        />
                      </Field>
                      <Field label="Message">
                        <Textarea
                          value={emailForm.message}
                          onChange={(event) => setEmailForm({ ...emailForm, message: event.target.value })}
                          placeholder="Share your update, next steps, or schedule details."
                          required
                          minLength={10}
                        />
                      </Field>
                      <div className="flex flex-wrap gap-3">
                        <PrimaryButton type="submit" busy={busy === 'email'}>Send email</PrimaryButton>
                        <SecondaryButton type="button" onClick={() => setEmailForm(defaultEmailForm)} disabled={busy === 'email'}>
                          Clear
                        </SecondaryButton>
                      </div>
                    </form>
                  </div>
                </div>
              ) : null}
            </SectionCard>
          </div>
        ) : null}

        {!isAdmin && currentSection === 'applications' ? (
          <SectionCard title="My applications" description="Track where you stand across your submitted applications.">
            <div className="space-y-4">
              {workspace.myApplications.length ? workspace.myApplications.map((application) => (
                <div key={application.id} className="glass-panel rounded-[20px] p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="mb-1 font-display text-[1.35rem] font-semibold text-slate-950">{application.event?.title}</h3>
                      <p className="mb-0 text-[1rem] text-soft">{application.event?.organizer?.full_name}</p>
                    </div>
                    <Pill tone={application.status === 'PENDING' ? 'warn' : application.status === 'REJECTED' ? 'danger' : 'success'}>
                      {application.status}
                    </Pill>
                  </div>
                  <p className="mb-0 text-[1rem] leading-7 text-soft">{application.message || 'No application note submitted.'}</p>
                </div>
              )) : <EmptyState title="No applications yet" message="You have not applied to any events yet. Discover one and send your first application." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'students' ? (
          <SectionCard title="Student search" description="Discover student profiles by skill, department, year, and keyword.">
            <form onSubmit={searchStudents} className="mb-6 grid gap-5 md:grid-cols-4">
              <SearchInput value={studentFilters.search} onChange={(event) => setStudentFilters({ ...studentFilters, search: event.target.value })} placeholder="Name or email" />
              <Input placeholder="Department" value={studentFilters.department} onChange={(event) => setStudentFilters({ ...studentFilters, department: event.target.value })} />
              <Input placeholder="Year" value={studentFilters.year} onChange={(event) => setStudentFilters({ ...studentFilters, year: event.target.value })} />
              <div className="flex gap-3">
                <Input placeholder="Skills" value={studentFilters.skills} onChange={(event) => setStudentFilters({ ...studentFilters, skills: event.target.value })} />
                <PrimaryButton type="submit" busy={busy === 'students'}>Search</PrimaryButton>
              </div>
            </form>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workspace.students.length ? workspace.students.map((student) => (
                <div key={student.id} className="glass-panel rounded-[20px] p-6">
                  <h3 className="mb-1 font-display text-[1.35rem] font-semibold text-slate-950">{student.full_name}</h3>
                  <p className="mb-2 text-[1rem] text-soft">{student.email}</p>
                  <p className="mb-4 text-[1rem] text-soft">{student.profile?.department || 'Department pending'} • Year {student.profile?.year || 'NA'}</p>
                  <div className="flex flex-wrap gap-2">
                    {toArray(student.profile?.skills).map((skill) => (
                      <span key={skill} className="rounded-full bg-white/90 px-3.5 py-2 text-[0.9rem] font-medium dark:bg-slate-900/70">{skill}</span>
                    ))}
                  </div>
                </div>
              )) : <EmptyState title="No students found" message="Try a broader search, or open this after more users complete their profiles." />}
            </div>
          </SectionCard>
        ) : null}

        {currentSection === 'notifications' ? (
          <SectionCard
            title="Notifications"
            description="Actionable updates from applications, approvals, and status changes."
            action={<SecondaryButton onClick={() => handleNotificationAction('', 'read-all')}>Mark all as read</SecondaryButton>}
          >
            <div className="space-y-3">
              {workspace.notifications.length ? workspace.notifications.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-[20px] border border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Pill tone={item.is_read ? 'default' : 'info'}>{item.is_read ? 'Read' : 'Unread'}</Pill>
                      <span className="text-[0.92rem] font-medium text-soft">{formatDateTime(item.created_at)}</span>
                    </div>
                    <p className="mb-0 text-[1rem] leading-7 text-slate-950">{item.message}</p>
                  </div>
                  <div className="flex gap-2">
                    {!item.is_read ? <SecondaryButton onClick={() => handleNotificationAction(item.id, 'read')}>Mark read</SecondaryButton> : null}
                    <SecondaryButton onClick={() => handleNotificationAction(item.id, 'delete')}>Delete</SecondaryButton>
                  </div>
                </div>
              )) : <EmptyState title="No notifications yet" message="New application activity and moderation updates will show up here." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'profile' ? (
          <div className="grid gap-7 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="Profile settings" description="Keep your public academic and skills profile current.">
              <form onSubmit={handleUpdateProfile} className="grid gap-5">
                <Field label="Bio"><Textarea value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} /></Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Department"><Input value={profileForm.department} onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })} /></Field>
                  <Field label="Year"><Input type="number" min="1" max="5" value={profileForm.year} onChange={(event) => setProfileForm({ ...profileForm, year: event.target.value })} /></Field>
                </div>
                <Field label="Profile picture URL"><Input value={profileForm.profile_picture} onChange={(event) => setProfileForm({ ...profileForm, profile_picture: event.target.value })} /></Field>
                <Field label="Skills" hint="Comma-separated values"><Input value={profileForm.skills} onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })} /></Field>
                <Field label="Interests" hint="Comma-separated values"><Input value={profileForm.interests} onChange={(event) => setProfileForm({ ...profileForm, interests: event.target.value })} /></Field>
                <PrimaryButton type="submit" busy={busy === 'profile'}>Save profile</PrimaryButton>
              </form>
            </SectionCard>

            <SectionCard title="Profile preview" description="A quick read of what collaborators and organizers can see.">
              <div className="glass-panel rounded-[32px] p-7">
                <h3 className="mb-2 font-display text-[2.7rem] leading-tight font-semibold text-slate-950 dark:text-slate-50">{user?.full_name}</h3>
                <p className="mb-3 text-[1rem] font-medium text-soft">{workspace.profile?.department || 'Department pending'} • Year {workspace.profile?.year || 'NA'}</p>
                <p className="mb-5 text-[1.05rem] leading-8 text-slate-800 dark:text-slate-300">{workspace.profile?.bio || 'Add a bio so people understand your interests and strengths.'}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {toArray(workspace.profile?.skills).map((skill) => (
                    <span key={skill} className="rounded-full bg-white/90 px-3.5 py-2 text-[0.9rem] font-medium dark:bg-slate-900/70">{skill}</span>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                  <h4 className="mb-3 font-display text-2xl font-semibold text-slate-950 dark:text-slate-50">Experiences</h4>
                  <div className="space-y-3">
                    {workspace.experiences.length ? workspace.experiences.map((experience) => (
                      <div key={experience.id} className="rounded-[18px] bg-slate-50/80 p-5 dark:bg-slate-900/60">
                        <p className="mb-1 text-[1.02rem] font-semibold text-slate-950">{experience.title}</p>
                        <p className="mb-0 text-[0.98rem] text-soft">{experience.event_name} • {formatDate(experience.completed_at)}</p>
                      </div>
                    )) : <p className="mb-0 text-[1rem] text-soft">Completed events will become profile experiences automatically.</p>}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {isAdmin && currentSection === 'admin' ? (
          <div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard title="Pending approvals" description="Events currently waiting for moderation.">
              <div className="space-y-3">
                {workspace.pendingEvents.length ? workspace.pendingEvents.map((event) => (
                  <div key={event.id} className="rounded-[20px] border border-slate-200 p-5 dark:border-slate-700">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="mb-1 font-display text-[1.35rem] font-semibold text-slate-950">{event.title}</h3>
                        <p className="mb-0 text-[1rem] text-soft">{event.organizer?.full_name}</p>
                      </div>
                      <Pill tone="warn">{event.approval_status}</Pill>
                    </div>
                    <p className="mb-3 text-[1rem] leading-7 text-soft">{event.description}</p>
                    <div className="flex gap-2">
                      <PrimaryButton busy={busy === `${event.id}approve`} onClick={() => handleAdminReview(event.id, 'approve')}>Approve</PrimaryButton>
                      <SecondaryButton onClick={() => handleAdminReview(event.id, 'reject')}>Reject</SecondaryButton>
                    </div>
                  </div>
                )) : <EmptyState title="Queue is clear" message="No pending events are waiting for review right now." />}
              </div>
            </SectionCard>

            <SectionCard title="Moderation ledger" description="All events across approval states.">
              <div className="space-y-3">
                {workspace.allAdminEvents.map((event) => (
                  <div key={event.id} className="glass-panel rounded-[20px] p-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="mb-0 font-display text-[1.3rem] font-semibold text-slate-950">{event.title}</h3>
                      <Pill tone={event.approval_status === 'APPROVED' ? 'success' : event.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                        {event.approval_status}
                      </Pill>
                    </div>
                    <p className="mb-1 text-[1rem] text-soft">{event.organizer?.full_name}</p>
                    <p className="mb-0 text-[0.98rem] text-soft">Created {formatDate(event.created_at)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        ) : null}
      </div>

      <Modal show={applyModal.open} onHide={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-display text-2xl font-semibold">Apply to {applyModal.eventTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Field label="Message to the organizer">
            <Textarea value={applyMessage} onChange={(event) => setApplyMessage(event.target.value)} placeholder="Tell them why you are a strong fit." />
          </Field>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <SecondaryButton onClick={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })}>Cancel</SecondaryButton>
          <PrimaryButton busy={busy === 'apply'} onClick={handleApplyToEvent}>Send application</PrimaryButton>
        </Modal.Footer>
      </Modal>
    </AppShell>
  )
}

function EventCard({ event, isSaved = false, onToggleSaved, onApply, saveBusy = false }) {
  const SaveIcon = isSaved ? BookmarkCheck : Bookmark

  return (
    <motion.article whileHover={{ y: -4 }} className="glass-panel elevated-hover flex h-full flex-col rounded-[20px] p-6">
      <div className="mb-5 flex items-center justify-between">
        <Pill tone={event.category === 'TECH' ? 'info' : event.category === 'CULTURAL' ? 'success' : 'warn'}>
          {event.category}
        </Pill>
        <div className="flex items-center gap-2">
          <Pill tone={event.status === 'OPEN' ? 'success' : 'default'}>{event.status}</Pill>
          {onToggleSaved ? (
            <button
              type="button"
              onClick={() => onToggleSaved(!isSaved)}
              disabled={saveBusy}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                isSaved
                  ? 'border-brand-200 bg-brand-50 text-brand-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600'
              } disabled:cursor-not-allowed disabled:opacity-60`}
              aria-label={isSaved ? 'Remove event from saved list' : 'Save event'}
            >
              <SaveIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <h3 className="mb-3 font-display text-[1.45rem] font-semibold text-slate-950">{event.title}</h3>
      <p className="mb-5 text-[1rem] leading-7 text-soft">{event.description}</p>
      <div className="mb-5 space-y-3 text-[1rem] text-soft">
        <p className="mb-0"><span className="font-semibold text-slate-900 dark:text-slate-200">Event name:</span> {event.event_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-900 dark:text-slate-200">Organizer:</span> {event.organizer?.full_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-900 dark:text-slate-200">Deadline:</span> {formatDate(event.deadline)}</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {toArray(event.required_skills).slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-white/90 px-3.5 py-2 text-[0.9rem] font-medium dark:bg-slate-900/70">{skill}</span>
        ))}
      </div>
      <div className="mt-auto flex gap-3">
        {onToggleSaved ? (
          <SecondaryButton className="min-w-[150px]" onClick={() => onToggleSaved(!isSaved)} disabled={saveBusy}>
            {isSaved ? 'Saved' : 'Save'}
          </SecondaryButton>
        ) : null}
        <PrimaryButton className="w-full" onClick={onApply}>Apply now</PrimaryButton>
      </div>
    </motion.article>
  )
}

function SnapshotList({ title, items, type }) {
  return (
    <div className="rounded-[20px] border border-slate-200/90 bg-white/80 p-8">
      <h3 className="mb-6 font-display text-[2rem] font-semibold text-slate-950">{title}</h3>
      <div className="space-y-4">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[18px] bg-slate-100 p-5">
            {type === 'event' ? (
              <>
                <p className="mb-1 text-[1.2rem] font-semibold text-slate-950">{item.title}</p>
                <p className="mb-0 text-[1rem] text-soft">{item.event_name} • {formatDate(item.deadline)}</p>
              </>
            ) : (
              <>
                <p className="mb-1 text-[1.05rem] font-semibold text-slate-900">{item.message}</p>
                <p className="mb-0 text-[0.98rem] text-soft">{formatDateTime(item.created_at)}</p>
              </>
            )}
          </div>
        )) : <p className="mb-0 text-[1rem] text-slate-700">Nothing here yet.</p>}
      </div>
    </div>
  )
}

export default WorkspacePage
