import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  CalendarPlus2,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  Mail,
  MessageSquare,
  PieChart,
  SearchCode,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SimpleLineChart, SimplePieChart } from '../components/charts/SimpleCharts.jsx'
import { AppShell } from '../components/AppShell.jsx'
import {
  EventCard,
  InsightPanel,
  SnapshotList,
  TrendPanel,
  BreakdownPanel,
} from '../components/workspace/analyticsPanels.jsx'
import {
  AlertBanner,
  AppModal,
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Field,
  Input,
  Pill,
  PrimaryButton,
  SearchInput,
  SectionCard,
  SecondaryButton,
  Select,
  SkeletonCard,
  StatCard,
  Textarea,
} from '../components/ui.jsx'
import { useApp } from '../context/useApp.js'
import { formatDate, formatDateTime, toArray } from '../lib/api.js'
import { mergeDerivedIntoNormalized } from '../lib/dashboardNormalize.js'
import { buildDerivedAnalytics, buildStudentDerivedAnalytics } from '../lib/workspaceDerived.js'
import * as adminService from '../services/admin.js'
import * as applicationsService from '../services/applications.js'
import * as authService from '../services/auth.js'
import * as chatService from '../services/chat.js'
import * as dashboardService from '../services/dashboard.js'
import * as eventsService from '../services/events.js'
import * as notificationsService from '../services/notifications.js'
import * as profileService from '../services/profile.js'
import * as studentsService from '../services/students.js'

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

const CHAT_ELIGIBLE_STATUSES = ['PENDING', 'SHORTLISTED', 'SELECTED', 'COMPLETED']
const BRANCH_OPTIONS = ['CSE', 'IT', 'MECH', 'CIVIL', 'ENTC', 'ECE', 'AIML']
const YEAR_OPTIONS = ['1', '2', '3', '4']

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

function buildChatKey(eventId, otherUserId) {
  return `${eventId}:${otherUserId}`
}

function toChatSelection({ event, otherUser }) {
  if (!event?.id || !otherUser?.id) {
    return null
  }

  return {
    key: buildChatKey(event.id, otherUser.id),
    eventId: event.id,
    eventTitle: event.title || event.event_name || 'Untitled event',
    otherUserId: otherUser.id,
    otherUserName: otherUser.full_name || 'Participant',
  }
}

function WorkspacePage() {
  const navigate = useNavigate()
  const { logout, persistSession, token, user } = useApp()
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
  const [chatConversations, setChatConversations] = useState([])
  const [chatSelection, setChatSelection] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatDraft, setChatDraft] = useState('')
  const [chatPagination, setChatPagination] = useState(null)
  const [chatLoading, setChatLoading] = useState({ conversations: false, messages: false })
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null)
  const [dashboardFilters, setDashboardFilters] = useState({
    department: '',
    year: '',
    from: '',
    to: '',
  })
  const [dashboardLoading, setDashboardLoading] = useState(false)
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

  const workspaceRef = useRef(workspace)
  useEffect(() => {
    workspaceRef.current = workspace
  }, [workspace])

  const sections = isAdmin
    ? [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        { key: 'admin', label: 'Admin Queue', icon: ShieldCheck },
        { key: 'notifications', label: 'Notifications', icon: Bell },
      ]
    : [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'dashboard', label: 'Dashboard', icon: PieChart },
        { key: 'discover', label: 'Discover', icon: Compass },
        { key: 'saved', label: 'Saved', icon: Bookmark },
        { key: 'events', label: 'My Events', icon: CalendarPlus2 },
        { key: 'applications', label: 'Applications', icon: Briefcase },
        { key: 'chats', label: 'Chats', icon: MessageSquare },
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
        analyticsResult,
      ] = await Promise.allSettled([
        authService.fetchMe(token),
        eventsService.fetchPublicEvents(token, { limit: 12 }),
        eventsService.fetchMyEvents(token, 20),
        applicationsService.fetchMyApplications(token, 20),
        notificationsService.fetchNotifications(token, 20),
        userRole !== 'COLLEGE_ADMIN' ? eventsService.fetchSavedEvents(token, 30) : Promise.resolve(null),
        userRole !== 'COLLEGE_ADMIN' ? eventsService.fetchEventDrafts(token, 20) : Promise.resolve(null),
        profileService.fetchProfile(token),
        userRole === 'COLLEGE_ADMIN' ? adminService.fetchPendingEvents(token, 20) : Promise.resolve(null),
        userRole === 'COLLEGE_ADMIN' ? adminService.fetchAllAdminEvents(token, 20) : Promise.resolve(null),
        dashboardService.fetchDashboardAnalytics(token, {}),
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

      const myApps = myApplicationsData.data?.applications || []
      const eventsList = publicEventsData.data?.events || []
      const savedList = savedEventsData?.data?.events || []
      const notifList = notificationsData.data?.notifications || []
      const adminEventsList = allAdminEventsData?.data?.events || []

      const dashNorm = analyticsResult.status === 'fulfilled' ? analyticsResult.value : null

      if (userRole === 'COLLEGE_ADMIN') {
        const derived = buildDerivedAnalytics({
          notifications: notifList,
          allAdminEvents: adminEventsList,
        })
        setDashboardAnalytics(dashNorm ? mergeDerivedIntoNormalized(dashNorm, derived) : derived)
      } else {
        const derived = buildStudentDerivedAnalytics({
          myApplications: myApps,
          events: eventsList,
          savedEvents: savedList,
          notifications: notifList,
        })
        setDashboardAnalytics(dashNorm ? mergeDerivedIntoNormalized(dashNorm, derived) : derived)
      }

      const nextUser = meData.data?.user || user
      if (
        nextUser
        && (
          nextUser.id !== user?.id
          || nextUser.role !== user?.role
          || nextUser.full_name !== user?.full_name
          || nextUser.email !== user?.email
          || nextUser.status !== user?.status
        )
      ) {
        persistSession(token, nextUser)
      }
      setWorkspace((current) => ({
        ...current,
        events: publicEventsData.data?.events || [],
        myEvents: myEventsData.data?.events || [],
        myApplications: myApps,
        notifications: notifList,
        savedEvents: savedList,
        eventDrafts: draftsData?.data?.drafts || [],
        pendingEvents: pendingEventsData?.data?.events || [],
        allAdminEvents: adminEventsList,
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
  }, [logout, navigate, persistSession, token, user, userRole])

  const reloadDashboard = useCallback(async () => {
    setDashboardLoading(true)
    try {
      const dashNorm = await dashboardService.fetchDashboardAnalytics(token, {
        department: dashboardFilters.department || undefined,
        year: dashboardFilters.year || undefined,
        from: dashboardFilters.from || undefined,
        to: dashboardFilters.to || undefined,
      })

      const ws = workspaceRef.current

      if (userRole === 'COLLEGE_ADMIN') {
        const derived = buildDerivedAnalytics({
          notifications: ws.notifications,
          allAdminEvents: ws.allAdminEvents,
        })
        setDashboardAnalytics(dashNorm ? mergeDerivedIntoNormalized(dashNorm, derived) : derived)
      } else {
        const derived = buildStudentDerivedAnalytics(ws)
        setDashboardAnalytics(dashNorm ? mergeDerivedIntoNormalized(dashNorm, derived) : derived)
      }
    } catch {
      setBanner({ tone: 'danger', message: 'Could not refresh dashboard filters.' })
    } finally {
      setDashboardLoading(false)
    }
  }, [dashboardFilters, token, userRole])

  const searchStudents = useCallback(async (event) => {
    if (event) event.preventDefault()
    setBusy('students')

    const query = new URLSearchParams()
    if (studentFilters.search) query.set('search', studentFilters.search)
    if (studentFilters.department) query.set('department', studentFilters.department)
    if (studentFilters.year) query.set('year', studentFilters.year)
    toArray(studentFilters.skills).forEach((skill) => query.append('skills', skill))

    try {
      const response = await studentsService.searchStudents(query.toString(), token)
      setWorkspace((current) => ({
        ...current,
        students: response.data?.students || [],
      }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }, [studentFilters, token])

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
        await eventsService.updateEvent(editingEventId, buildEventPayload(), token)
        setBanner({ tone: 'success', message: 'Event updated and sent back for admin review.' })
      } else if (isEditDraft) {
        await eventsService.submitDraft(editingDraftId, token)
        setBanner({ tone: 'success', message: 'Draft submitted. It is now waiting for admin approval.' })
      } else {
        await eventsService.createEvent(buildEventPayload(), token)
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
        await eventsService.updateDraft(editingDraftId, payload, token)
        setBanner({ tone: 'success', message: 'Draft updated successfully.' })
      } else {
        await eventsService.saveDraft(payload, token)
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
      await eventsService.deleteDraft(draftId, token)
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
      await eventsService.submitDraft(draftId, token)
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

      await profileService.updateProfile(payload, token)
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
      await applicationsService.createApplication({
        event_id: applyModal.eventId,
        message: applyMessage,
      }, token)
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
      const response = await eventsService.fetchEventApplications(eventId, token, 20)
      setWorkspace((current) => ({
        ...current,
        eventApplications: response.data?.applications || [],
      }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    }
  }, [token])

  const loadChatConversations = useCallback(async () => {
    setChatLoading((current) => ({ ...current, conversations: true }))

    try {
      const response = await chatService.fetchConversations(token)
      const conversations = response.data?.conversations || []
      setChatConversations(conversations)
      setChatSelection((current) => {
        if (!current) {
          return current
        }

        const match = conversations.find((item) => buildChatKey(item.event?.id, item.other_user?.id) === current.key)
        return match ? toChatSelection({ event: match.event, otherUser: match.other_user }) : current
      })
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setChatLoading((current) => ({ ...current, conversations: false }))
    }
  }, [token])

  const loadChatHistory = useCallback(async (selection) => {
    if (!selection) {
      setChatMessages([])
      setChatPagination(null)
      return
    }

    setChatLoading((current) => ({ ...current, messages: true }))

    try {
      const response = await chatService.fetchChatHistory({
        eventId: selection.eventId,
        otherUserId: selection.otherUserId,
        page: 1,
        limit: 50,
      }, token)

      setChatMessages(response.data?.messages || [])
      setChatPagination(response.data?.pagination || null)
    } catch (error) {
      setChatMessages([])
      setChatPagination(null)
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setChatLoading((current) => ({ ...current, messages: false }))
    }
  }, [token])

  function openChatThread(selection) {
    if (!selection) {
      return
    }

    setChatSelection(selection)
    setChatDraft('')
    setCurrentSection('chats')
  }

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
    if (currentSection === 'chats' && token) {
      const timer = window.setTimeout(() => {
        loadChatConversations()
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [currentSection, loadChatConversations, token])

  useEffect(() => {
    if (chatSelection && token) {
      const timer = window.setTimeout(() => {
        loadChatHistory(chatSelection)
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [chatSelection, loadChatHistory, token])

  useEffect(() => {
    if (isAdmin && ['discover', 'saved', 'events', 'applications', 'chats', 'students', 'profile', 'dashboard'].includes(currentSection)) {
      const timer = window.setTimeout(() => {
        setCurrentSection('overview')
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [currentSection, isAdmin])

  async function handleStatusUpdate(applicationId, status) {
    setBusy(applicationId)

    try {
      await applicationsService.updateApplicationStatus(applicationId, status, token)
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
        await adminService.approveEvent(eventId, token)
      } else {
        await adminService.rejectEvent(eventId, token)
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
        await notificationsService.markNotificationRead(id, token)
      }
      if (action === 'delete') {
        await notificationsService.deleteNotification(id, token)
      }
      if (action === 'read-all') {
        await notificationsService.markAllRead(token)
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
        await eventsService.saveEvent(eventId, token)
        setBanner({ tone: 'success', message: 'Event saved for later.' })
      } else {
        await eventsService.unsaveEvent(eventId, token)
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
      const response = await eventsService.emailApplicants(selectedEventId, {
        subject: emailForm.subject.trim(),
        message: emailForm.message.trim(),
        target: emailForm.target,
      }, token)
      setBanner({ tone: 'success', message: response.message || 'Email sent successfully.' })
      setEmailForm(defaultEmailForm)
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleSendChatMessage(event) {
    event.preventDefault()

    if (!chatSelection) {
      setBanner({ tone: 'danger', message: 'Choose a conversation first.' })
      return
    }

    if (!chatDraft.trim()) {
      setBanner({ tone: 'danger', message: 'Write a message before sending.' })
      return
    }

    setBusy('chat-send')

    try {
      const response = await chatService.sendMessage({
        receiver_id: chatSelection.otherUserId,
        event_id: chatSelection.eventId,
        message: chatDraft.trim(),
      }, token)

      const createdMessage = response.data?.message
      if (createdMessage) {
        setChatMessages((current) => [...current, createdMessage])
      }
      setChatDraft('')
      await loadChatConversations()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  const da = dashboardAnalytics
  const summary = da?.summary || {}

  const stats = isAdmin
    ? [
        { label: 'Pending approvals', value: workspace.pendingEvents.length, helper: 'Events waiting for moderation.', icon: ShieldCheck },
        { label: 'Total events', value: workspace.allAdminEvents.length, helper: 'Full moderation ledger.', icon: CalendarPlus2 },
        { label: 'Unread notifications', value: workspace.notifications.filter((item) => !item.is_read).length, helper: 'Operational updates.', icon: Bell },
      ]
    : [
        { label: 'Open opportunities', value: workspace.events.length, helper: 'Approved events you can explore.', icon: Compass },
        { label: 'Events you manage', value: workspace.myEvents.length, helper: 'Your organizer pipeline.', icon: CalendarPlus2 },
        { label: 'Unread notifications', value: workspace.notifications.filter((item) => !item.is_read).length, helper: 'Replies and approvals.', icon: Bell },
      ]

  const adminMetricCards = da
    ? [
        { label: 'Total applications', value: summary.totalApplications ?? 0, helper: 'Across measured events.', icon: Users },
        { label: 'Total participants', value: summary.totalParticipants ?? summary.engagementTotal ?? 0, helper: 'Engagement context.', icon: Users },
        { label: 'Participation rate', value: `${summary.participationRate ?? summary.approvalRate ?? 0}%`, helper: 'Reporting window.', icon: Activity },
        { label: 'Active events', value: summary.activeEvents ?? summary.totalEvents ?? workspace.allAdminEvents.length, helper: 'Currently tracked.', icon: CalendarPlus2 },
      ]
    : []

  const studentMetricCards = da
    ? [
        { label: 'My applications', value: summary.totalApplications ?? workspace.myApplications.length, helper: 'Submitted across events.', icon: Briefcase },
        { label: 'Participation', value: summary.totalParticipants ?? da.myStats?.eventsJoined ?? 0, helper: 'Shortlisted / selected / completed.', icon: CheckCircle2 },
        { label: 'Participation rate', value: `${summary.participationRate ?? 0}%`, helper: 'Of your applications.', icon: Activity },
        { label: 'Active events', value: summary.activeEvents ?? workspace.events.length, helper: 'Open listings.', icon: CalendarPlus2 },
      ]
    : []

  const drillColumns = (da?.drillDown?.length && typeof da.drillDown[0] === 'object')
    ? Object.keys(da.drillDown[0]).filter((k) => k !== 'id').slice(0, 6).map((key) => ({
        key,
        label: key.replace(/_/g, ' '),
        render: (row) => {
          const v = row[key]
          if (v === null || v === undefined) return '—'
          if (typeof v === 'object') return JSON.stringify(v)
          return String(v)
        },
      }))
    : []

  const selectedEvent = workspace.myEvents.find((item) => item.id === selectedEventId) || null
  const savedEventIds = new Set(workspace.savedEvents.map((item) => item.id))
  const conversationKeys = new Set(chatConversations.map((item) => buildChatKey(item.event?.id, item.other_user?.id)))
  const applicationChatStarters = workspace.myApplications
    .filter((application) => CHAT_ELIGIBLE_STATUSES.includes(application.status))
    .map((application) => ({
      selection: toChatSelection({
        event: application.event,
        otherUser: application.event?.organizer,
      }),
      status: application.status,
    }))
    .filter((item) => item.selection && !conversationKeys.has(item.selection.key))

  const filterToolbar = (
    <div className="mb-6 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-slate-200 bg-slate-50/90 p-4 md:flex-row md:flex-wrap md:items-end">
      <Field label="Department">
        <Select
          value={dashboardFilters.department}
          onChange={(e) => setDashboardFilters({ ...dashboardFilters, department: e.target.value })}
          className="min-h-11"
        >
          <option value="">All branches</option>
          {BRANCH_OPTIONS.map((branch) => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </Select>
      </Field>
      <Field label="Year">
        <Select
          value={dashboardFilters.year}
          onChange={(e) => setDashboardFilters({ ...dashboardFilters, year: e.target.value })}
          className="min-h-11"
        >
          <option value="">All years</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
      </Field>
      <Field label="From">
        <Input
          type="date"
          value={dashboardFilters.from}
          onChange={(e) => setDashboardFilters({ ...dashboardFilters, from: e.target.value })}
          className="min-h-11"
        />
      </Field>
      <Field label="To">
        <Input
          type="date"
          value={dashboardFilters.to}
          onChange={(e) => setDashboardFilters({ ...dashboardFilters, to: e.target.value })}
          className="min-h-11"
        />
      </Field>
      <div className="flex gap-2 pb-1">
        <PrimaryButton type="button" busy={dashboardLoading} onClick={() => reloadDashboard()}>
          Apply filters
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => {
            setDashboardFilters({ department: '', year: '', from: '', to: '' })
          }}
        >
          Reset
        </SecondaryButton>
      </div>
    </div>
  )

  const insightsList = (da?.insights?.length ? da.insights : [
    'Connect the analytics API for department and year breakdowns.',
    'Filters above map to GET /api/dashboard query parameters.',
  ])

  return (
    <AppShell
      currentSection={currentSection}
      headerSearchPlaceholder="Filter events, applications, people…"
      onLogout={handleLogout}
      onSectionChange={setCurrentSection}
      sections={sections}
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      unreadNotifications={workspace.notifications.filter((item) => !item.is_read).length}
      user={user}
    >
      <div className="space-y-6">
        <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

        {currentSection === 'overview' ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>
            <SectionCard title="Today’s pulse" description="Recent activity across your workspace.">
              <div className="grid gap-6 lg:grid-cols-2">
                <SnapshotList title={isAdmin ? 'Pending review' : 'Recent events'} items={(isAdmin ? workspace.pendingEvents : workspace.events).slice(0, 4)} type="event" />
                <SnapshotList title="Latest notifications" items={workspace.notifications.slice(0, 4)} type="notification" />
              </div>
            </SectionCard>
          </>
        ) : null}

        {!isAdmin && currentSection === 'dashboard' && !da ? (
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : null}

        {!isAdmin && currentSection === 'dashboard' && da ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {studentMetricCards.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>
            {filterToolbar}
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <TrendPanel
                title="Department-wise"
                description="Applications or participation by department."
                items={(da.departmentWise?.length ? da.departmentWise : [{ label: 'All departments', value: summary.totalApplications || 0 }]).map((x) => ({
                  label: x.label,
                  value: Number(x.value),
                }))}
                colorClass="bg-violet-500"
              />
              <Card padding="md" className="border-brand-100 bg-gradient-to-br from-brand-50/80 to-white">
                <h3 className="mb-2 font-display text-lg font-semibold text-slate-900">My stats</h3>
                <ul className="mb-0 space-y-2 text-sm text-slate-700">
                  <li className="flex justify-between gap-2"><span>Applications sent</span><Badge variant="brand">{da.myStats?.applicationsSubmitted ?? workspace.myApplications.length}</Badge></li>
                  <li className="flex justify-between gap-2"><span>Events joined</span><Badge variant="success">{da.myStats?.eventsJoined ?? '—'}</Badge></li>
                  <li className="flex justify-between gap-2"><span>Saved events</span><Badge variant="info">{da.myStats?.savedEvents ?? workspace.savedEvents.length}</Badge></li>
                </ul>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <SimplePieChart
                title="Year-wise distribution"
                description="Participation or applications by academic year."
                items={da.yearWise?.length ? da.yearWise : [{ label: 'Year data pending', value: 1 }]}
              />
              <SimpleLineChart
                title="Trends"
                description="Activity over the selected period."
                items={da.trends?.length ? da.trends : (da.activitySeries || []).map((row) => ({
                  label: row.label,
                  value: row.events ?? row.value ?? row.applications ?? 0,
                }))}
              />
            </div>
            <SectionCard title="Insights" description="Generated signals from the analytics service.">
              <InsightPanel title="Highlights" items={insightsList} />
            </SectionCard>
          </>
        ) : null}

        {isAdmin && currentSection === 'analytics' && !da ? (
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : null}

        {isAdmin && currentSection === 'analytics' && da ? (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {adminMetricCards.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>
            {filterToolbar}
            <SectionCard
              title="Analytics dashboard"
              description={da?.source === 'api'
                ? 'Live reporting via GET /api/dashboard (with legacy fallbacks).'
                : 'Derived from workspace data until the analytics API is available.'}
            >
              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <TrendPanel
                  title="Department-wise (bar)"
                  description="Volume by department when provided by the API."
                  items={(da.departmentWise?.length ? da.departmentWise : (da.activitySeries || []).map((row) => ({
                    label: row.label,
                    value: Number(row.events ?? row.value ?? 0),
                  }))).map((x) => ({ label: x.label, value: Number(x.value) }))}
                  colorClass="bg-indigo-500"
                />
                <SimplePieChart
                  title="Year-wise"
                  description="Share by academic year."
                  items={da.yearWise?.length ? da.yearWise : (da.approvals || []).map((a) => ({ label: a.label, value: a.value }))}
                />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <SimpleLineChart
                  title="Trends (line)"
                  description="Time-series from dashboard payload."
                  items={da.trends?.length ? da.trends : (da.activitySeries || []).map((row) => ({
                    label: row.label,
                    value: row.events ?? row.applications ?? row.value ?? 0,
                  }))}
                />
                <BreakdownPanel
                  title="Approval mix"
                  description="Moderation distribution."
                  items={da.approvals?.length ? da.approvals : []}
                />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <BreakdownPanel
                  title="Engagement signals"
                  description="Operational indicators."
                  items={da.engagement?.length ? da.engagement : []}
                />
                <TrendPanel
                  title="Application activity"
                  description="Applications over recent buckets."
                  items={(da.applications || []).map((item) => ({
                    label: item.label,
                    value: Number(item.value ?? item.applications ?? 0),
                  }))}
                  colorClass="bg-emerald-500"
                />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <InsightPanel title="Insights" items={insightsList} />
                <InsightPanel
                  title="Coverage"
                  items={da?.source === 'api'
                    ? [
                        'Primary path: /api/dashboard with department, year, from, to.',
                        'Charts adapt to departmentWise, yearWise, and trends arrays.',
                        'Drill-down table renders when drillDown rows are returned.',
                      ]
                    : [
                        'Showing derived metrics from admin events and notifications.',
                        'Backend /api/dashboard will enrich charts automatically.',
                      ]}
                />
              </div>

              {drillColumns.length ? (
                <div className="mt-8">
                  <h3 className="mb-3 font-display text-xl font-semibold text-slate-900">Drill-down</h3>
                  <DataTable columns={drillColumns} rows={da.drillDown} pageSize={6} emptyMessage="No drill-down rows." />
                </div>
              ) : null}
            </SectionCard>
          </>
        ) : null}

        {!isAdmin && currentSection === 'discover' ? (
          <SectionCard title="Discover events" description="Approved campus events open for applications.">
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
          <SectionCard title="Saved events" description="Shortlisted opportunities.">
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
              )) : <EmptyState title="No saved events yet" message="Save events from Discover to build your shortlist." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'events' ? (
          <div className="grid gap-7 xl:grid-cols-[1.18fr_0.82fr]">
            <SectionCard
              title={eventMode === 'edit-event' ? 'Edit event' : eventMode === 'edit-draft' ? 'Finish your draft' : 'Create a new event'}
              description={eventMode === 'edit-event'
                ? 'Updates go back through admin approval.'
                : eventMode === 'edit-draft'
                  ? 'Submit when ready.'
                  : 'Submissions require admin approval.'}
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

            <SectionCard title="Managed events" description="Drafts and submitted listings.">
              <div className="mb-6">
                <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">Drafts</h3>
                <div className="space-y-3">
                  {workspace.eventDrafts.length ? workspace.eventDrafts.map((draft) => (
                    <div key={draft.id} className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="mb-1 font-display text-lg font-semibold text-slate-950">{draft.title || 'Untitled draft'}</p>
                          <p className="mb-0 text-sm text-slate-600">
                            Last updated {formatDateTime(draft.updated_at)}
                          </p>
                        </div>
                        <Pill tone="default">Draft</Pill>
                      </div>
                      <p className="mb-4 text-sm leading-7 text-slate-600">
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
                  )) : <EmptyState title="No drafts yet" message="Use Save draft to build an event before submitting." />}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">Published and submitted</h3>
                <div className="space-y-3">
                  {workspace.myEvents.length ? workspace.myEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`rounded-[var(--radius-xl)] border p-6 transition ${
                        selectedEventId === event.id
                          ? 'border-brand-400 bg-brand-50/60 shadow-sm'
                          : 'border-slate-200 bg-white'
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
                        <h3 className="mb-2 font-display text-xl font-semibold text-slate-950">{event.title}</h3>
                        <p className="mb-3 text-sm leading-7 text-slate-600">{event.description}</p>
                        <p className="mb-0 text-xs font-medium text-slate-500">Deadline {formatDate(event.deadline)}</p>
                      </button>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <SecondaryButton type="button" onClick={() => startEditEvent(event)}>
                          Edit event
                        </SecondaryButton>
                      </div>
                    </div>
                  )) : <EmptyState title="No managed events yet" message="Create your first opportunity." />}
                </div>
              </div>

              {selectedEventId ? (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">Applications</h3>
                  <div className="space-y-3">
                    {workspace.eventApplications.length ? workspace.eventApplications.map((application) => (
                      <div key={application.id} className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="mb-1 text-base font-semibold text-slate-950">{application.student?.full_name}</p>
                            <p className="mb-0 text-sm text-slate-600">{application.student?.profile?.department || 'Department pending'} • Year {application.student?.profile?.year || 'NA'}</p>
                          </div>
                          <Pill tone={application.status === 'PENDING' ? 'warn' : application.status === 'REJECTED' ? 'danger' : 'success'}>
                            {application.status}
                          </Pill>
                        </div>
                        <p className="text-sm leading-7 text-slate-600">{application.message || 'No note attached.'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['SHORTLISTED', 'SELECTED', 'REJECTED', 'COMPLETED'].map((status) => (
                            <Button
                              key={status}
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(application.id, status)}
                              disabled={busy === application.id}
                            >
                              {status}
                            </Button>
                          ))}
                          {CHAT_ELIGIBLE_STATUSES.includes(application.status) ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openChatThread(toChatSelection({
                                event: selectedEvent,
                                otherUser: application.student,
                              }))}
                            >
                              Open chat
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )) : <EmptyState title="No applications yet" message="Applications appear here after students apply." />}
                  </div>

                  <div className="mt-6 rounded-[var(--radius-xl)] border border-slate-200 bg-slate-50/80 p-6">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-display text-lg font-semibold text-slate-950">Email applicants</h3>
                        <p className="mb-0 text-sm leading-7 text-slate-600">
                          Send an update for {selectedEvent?.title || 'this event'}.
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
          <SectionCard title="My applications" description="Status of every application you have submitted.">
            {workspace.myApplications.length ? (
              <DataTable
                columns={[
                  {
                    key: 'event',
                    label: 'Event',
                    render: (row) => row.event?.title || '—',
                  },
                  {
                    key: 'organizer',
                    label: 'Organizer',
                    render: (row) => row.event?.organizer?.full_name || '—',
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => (
                      <Pill tone={row.status === 'PENDING' ? 'warn' : row.status === 'REJECTED' ? 'danger' : 'success'}>{row.status}</Pill>
                    ),
                  },
                  {
                    key: 'message',
                    label: 'Note',
                    render: (row) => row.message || '—',
                  },
                  {
                    key: 'chat',
                    label: 'Chat',
                    render: (row) => (
                      CHAT_ELIGIBLE_STATUSES.includes(row.status) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChatThread(toChatSelection({
                            event: row.event,
                            otherUser: row.event?.organizer,
                          }))}
                        >
                          Message organizer
                        </Button>
                      ) : 'Unavailable'
                    ),
                  },
                ]}
                rows={workspace.myApplications}
                pageSize={8}
              />
            ) : (
              <EmptyState title="No applications yet" message="Discover an event and send your first application." />
            )}
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'chats' ? (
          <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr]">
            <SectionCard
              title="Conversations"
              description="Event-specific messaging between organizers and applicants."
              action={(
                <SecondaryButton onClick={loadChatConversations} disabled={chatLoading.conversations}>
                  Refresh
                </SecondaryButton>
              )}
            >
              <div className="space-y-3">
                {chatConversations.map((conversation) => {
                  const selection = toChatSelection({
                    event: conversation.event,
                    otherUser: conversation.other_user,
                  })
                  const active = selection?.key === chatSelection?.key

                  return (
                    <button
                      key={selection?.key || `${conversation.event?.id}-${conversation.other_user?.id}`}
                      type="button"
                      onClick={() => openChatThread(selection)}
                      className={`w-full rounded-[var(--radius-xl)] border p-5 text-left transition ${
                        active
                          ? 'border-brand-400 bg-brand-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-brand-200'
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="mb-0 font-display text-lg font-semibold text-slate-950">{conversation.other_user?.full_name}</h3>
                        <span className="text-xs font-medium text-slate-500">{formatDateTime(conversation.last_message?.created_at)}</span>
                      </div>
                      <p className="mb-1 text-sm font-medium text-slate-700">{conversation.event?.title || conversation.event?.event_name}</p>
                      <p className="mb-0 line-clamp-2 text-sm leading-7 text-slate-600">{conversation.last_message?.message || 'Start the conversation.'}</p>
                    </button>
                  )
                })}

                {!chatConversations.length && chatLoading.conversations ? <SkeletonCard /> : null}

                {!chatConversations.length && !chatLoading.conversations ? (
                  <EmptyState
                    title="No conversations yet"
                    message="Open chat from an eligible application or applicant card to start messaging."
                  />
                ) : null}
              </div>

              {applicationChatStarters.length ? (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">Available to start</h3>
                  <div className="space-y-3">
                    {applicationChatStarters.map((item) => (
                      <Card key={item.selection.key} padding="md" className="border-slate-200/90">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="mb-1 text-base font-semibold text-slate-950">{item.selection.otherUserName}</p>
                            <p className="mb-0 text-sm text-slate-600">{item.selection.eventTitle}</p>
                          </div>
                          <Pill tone={item.status === 'PENDING' ? 'warn' : 'success'}>{item.status}</Pill>
                        </div>
                        <SecondaryButton type="button" onClick={() => openChatThread(item.selection)}>
                          Start chat
                        </SecondaryButton>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title={chatSelection ? chatSelection.otherUserName : 'Choose a conversation'}
              description={chatSelection ? `About ${chatSelection.eventTitle}` : 'Select a thread to view message history.'}
            >
              {chatSelection ? (
                <>
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Pill tone="info">{chatSelection.eventTitle}</Pill>
                    {chatPagination?.total ? <Pill tone="default">{chatPagination.total} messages</Pill> : null}
                  </div>

                  <div className="space-y-3">
                    {chatLoading.messages ? <SkeletonCard /> : null}

                    {!chatLoading.messages && chatMessages.length ? chatMessages.map((item) => {
                      const mine = item.sender_id === user?.id

                      return (
                        <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-[20px] px-5 py-4 shadow-sm ${mine ? 'bg-brand-500 text-white' : 'border border-slate-200 bg-white text-slate-900'}`}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                              {mine ? 'You' : chatSelection.otherUserName}
                            </p>
                            <p className="mb-2 whitespace-pre-wrap text-sm leading-7">{item.message}</p>
                            <p className={`mb-0 text-xs ${mine ? 'text-white/80' : 'text-slate-500'}`}>{formatDateTime(item.created_at)}</p>
                          </div>
                        </div>
                      )
                    }) : null}

                    {!chatLoading.messages && !chatMessages.length ? (
                      <EmptyState
                        title="No messages yet"
                        message="Send the first message to start this event conversation."
                      />
                    ) : null}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="mt-6 border-t border-slate-200 pt-6">
                    <Field label="Message">
                      <Textarea
                        value={chatDraft}
                        onChange={(event) => setChatDraft(event.target.value)}
                        placeholder={`Write to ${chatSelection.otherUserName}`}
                        className="min-h-32"
                      />
                    </Field>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <PrimaryButton type="submit" busy={busy === 'chat-send'}>Send message</PrimaryButton>
                      <SecondaryButton type="button" onClick={() => setChatDraft('')} disabled={busy === 'chat-send'}>
                        Clear
                      </SecondaryButton>
                    </div>
                  </form>
                </>
              ) : (
                <EmptyState
                  title="Pick a chat"
                  message="Choose an existing conversation on the left, or start one from your applications and applicant lists."
                />
              )}
            </SectionCard>
          </div>
        ) : null}

        {!isAdmin && currentSection === 'students' ? (
          <SectionCard title="Student search" description="Find peers by skills, department, and year.">
            <form onSubmit={searchStudents} className="mb-6 grid gap-5 md:grid-cols-4">
              <SearchInput value={studentFilters.search} onChange={(event) => setStudentFilters({ ...studentFilters, search: event.target.value })} placeholder="Name or email" />
              <Select value={studentFilters.department} onChange={(event) => setStudentFilters({ ...studentFilters, department: event.target.value })}>
                <option value="">All branches</option>
                {BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </Select>
              <Select value={studentFilters.year} onChange={(event) => setStudentFilters({ ...studentFilters, year: event.target.value })}>
                <option value="">All years</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
              <div className="flex gap-3">
                <Input placeholder="Skills" value={studentFilters.skills} onChange={(event) => setStudentFilters({ ...studentFilters, skills: event.target.value })} />
                <PrimaryButton type="submit" busy={busy === 'students'}>Search</PrimaryButton>
              </div>
            </form>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workspace.students.length ? workspace.students.map((student) => (
                <Card key={student.id} interactive className="border-slate-200/90">
                  <h3 className="mb-1 font-display text-lg font-semibold text-slate-950">{student.full_name}</h3>
                  <p className="mb-2 text-sm text-slate-600">{student.email}</p>
                  <p className="mb-4 text-sm text-slate-600">{student.profile?.department || 'Department pending'} • Year {student.profile?.year || 'NA'}</p>
                  <div className="flex flex-wrap gap-2">
                    {toArray(student.profile?.skills).map((skill) => (
                      <Badge key={skill} variant="neutral">{skill}</Badge>
                    ))}
                  </div>
                </Card>
              )) : <EmptyState title="No students found" message="Try broader filters or encourage peers to complete profiles." />}
            </div>
          </SectionCard>
        ) : null}

        {currentSection === 'notifications' ? (
          <SectionCard
            title="Notifications"
            description="Application updates, approvals, and system messages."
            action={(
              <SecondaryButton onClick={() => handleNotificationAction('', 'read-all')}>
                Mark all read
              </SecondaryButton>
            )}
          >
            <div className="space-y-3">
              {workspace.notifications.length ? workspace.notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 rounded-[var(--radius-xl)] border p-5 md:flex-row md:items-center md:justify-between ${
                    item.is_read ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/40'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.is_read ? 'bg-slate-100 text-slate-500' : 'bg-brand-500 text-white'}`} aria-hidden>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Pill tone={item.is_read ? 'default' : 'info'}>{item.is_read ? 'Read' : 'Unread'}</Pill>
                        <span className="text-xs font-medium text-slate-500">{formatDateTime(item.created_at)}</span>
                      </div>
                      <p className="mb-0 text-sm leading-7 text-slate-900">{item.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!item.is_read ? <SecondaryButton onClick={() => handleNotificationAction(item.id, 'read')}>Mark read</SecondaryButton> : null}
                    <SecondaryButton onClick={() => handleNotificationAction(item.id, 'delete')}>Delete</SecondaryButton>
                  </div>
                </div>
              )) : <EmptyState title="No notifications" message="New activity will appear here." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'profile' ? (
          <div className="grid gap-7 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="Profile settings" description="Bio, academics, skills, and interests.">
              <form onSubmit={handleUpdateProfile} className="grid gap-5">
                <Field label="Bio"><Textarea value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} /></Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Department">
                    <Select value={profileForm.department} onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })}>
                      <option value="">Select branch</option>
                      {BRANCH_OPTIONS.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Year">
                    <Select value={profileForm.year} onChange={(event) => setProfileForm({ ...profileForm, year: event.target.value })}>
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Profile picture URL"><Input value={profileForm.profile_picture} onChange={(event) => setProfileForm({ ...profileForm, profile_picture: event.target.value })} /></Field>
                <Field label="Skills" hint="Comma-separated"><Input value={profileForm.skills} onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })} /></Field>
                <Field label="Interests" hint="Comma-separated"><Input value={profileForm.interests} onChange={(event) => setProfileForm({ ...profileForm, interests: event.target.value })} /></Field>
                <PrimaryButton type="submit" busy={busy === 'profile'}>Save profile</PrimaryButton>
              </form>
            </SectionCard>

            <SectionCard title="Preview" description="What organizers see when they view your profile.">
              <Card className="overflow-hidden border-slate-200/90">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-bold text-white shadow-md">
                    {(user?.full_name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-display text-2xl font-semibold text-slate-950">{user?.full_name}</h3>
                    <p className="mb-3 text-sm text-slate-600">{workspace.profile?.department || 'Department'} • Year {workspace.profile?.year || '—'}</p>
                    <p className="mb-4 text-sm leading-7 text-slate-700">{workspace.profile?.bio || 'Add a short bio.'}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {toArray(workspace.profile?.skills).map((skill) => (
                        <Badge key={skill} variant="brand">{skill}</Badge>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="mb-2 font-display text-lg font-semibold text-slate-900">Experiences</h4>
                      <div className="space-y-2">
                        {workspace.experiences.length ? workspace.experiences.map((experience) => (
                          <div key={experience.id} className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="mb-0.5 text-sm font-semibold text-slate-900">{experience.title}</p>
                            <p className="mb-0 text-xs text-slate-600">{experience.event_name} • {formatDate(experience.completed_at)}</p>
                          </div>
                        )) : <p className="mb-0 text-sm text-slate-500">Completed events will appear here.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </SectionCard>
          </div>
        ) : null}

        {isAdmin && currentSection === 'admin' ? (
          <div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard title="Pending approvals" description="Events awaiting review.">
              <div className="space-y-3">
                {workspace.pendingEvents.length ? workspace.pendingEvents.map((event) => (
                  <Card key={event.id} padding="md">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="mb-1 font-display text-lg font-semibold text-slate-950">{event.title}</h3>
                        <p className="mb-0 text-sm text-slate-600">{event.organizer?.full_name}</p>
                      </div>
                      <Pill tone="warn">{event.approval_status}</Pill>
                    </div>
                    <p className="mb-3 text-sm leading-7 text-slate-600">{event.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <PrimaryButton busy={busy === `${event.id}approve`} onClick={() => handleAdminReview(event.id, 'approve')}>Approve</PrimaryButton>
                      <SecondaryButton onClick={() => handleAdminReview(event.id, 'reject')}>Reject</SecondaryButton>
                    </div>
                  </Card>
                )) : <EmptyState title="Queue is clear" message="No pending events." />}
              </div>
            </SectionCard>

            <SectionCard title="Moderation ledger" description="All events by state.">
              <DataTable
                columns={[
                  { key: 'title', label: 'Title', render: (row) => row.title },
                  { key: 'organizer', label: 'Organizer', render: (row) => row.organizer?.full_name || '—' },
                  {
                    key: 'approval_status',
                    label: 'Status',
                    render: (row) => (
                      <Pill tone={row.approval_status === 'APPROVED' ? 'success' : row.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                        {row.approval_status}
                      </Pill>
                    ),
                  },
                  { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
                ]}
                rows={workspace.allAdminEvents}
                pageSize={6}
              />
            </SectionCard>
          </div>
        ) : null}
      </div>

      <AppModal
        show={applyModal.open}
        onHide={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })}
        title={`Apply to ${applyModal.eventTitle}`}
        footer={(
          <>
            <SecondaryButton onClick={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })}>Cancel</SecondaryButton>
            <PrimaryButton busy={busy === 'apply'} onClick={handleApplyToEvent}>Send application</PrimaryButton>
          </>
        )}
      >
        <Field label="Message to the organizer">
          <Textarea value={applyMessage} onChange={(event) => setApplyMessage(event.target.value)} placeholder="Tell them why you are a strong fit." />
        </Field>
      </AppModal>
    </AppShell>
  )
}

export default WorkspacePage
