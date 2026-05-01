import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarCheck2, LogIn, ShieldCheck, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import * as authService from '../services/auth.js'
import { AlertBanner, AppLogo, Field, Input, PrimaryButton, SecondaryButton, Select } from '../components/ui.jsx'

const initialForms = {
  login: { email: '', password: '' },
  register: { full_name: '', email: '', password: '', role: 'STUDENT', secret_key: '' },
  verify: { email: '', otp: '' },
  admin: { email: '', password: '' },
}

const TABS = [
  { key: 'login', label: 'Sign in' },
  { key: 'register', label: 'Register' },
  { key: 'verify', label: 'Verify' },
  { key: 'admin', label: 'Admin' },
]

function AuthPage() {
  const navigate = useNavigate()
  const { persistSession } = useApp()
  const [activeTab, setActiveTab] = useState('login')
  const [forms, setForms] = useState(initialForms)
  const [banner, setBanner] = useState({ tone: 'info', message: '' })
  const [busy, setBusy] = useState('')

  function updateForm(name, field, value) {
    setForms((c) => ({ ...c, [name]: { ...c[name], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBanner({ tone: 'info', message: '' })
    setBusy(activeTab)
    try {
      if (activeTab === 'login') {
        const r = await authService.login(forms.login)
        persistSession(r.data.token, r.data.user)
        navigate('/app')
      }
      if (activeTab === 'register') {
        if (forms.register.role === 'COLLEGE_ADMIN') {
          await authService.registerAdmin({ full_name: forms.register.full_name, email: forms.register.email, password: forms.register.password, secret_key: forms.register.secret_key })
          setActiveTab('admin')
          updateForm('admin', 'email', forms.register.email)
          updateForm('admin', 'password', forms.register.password)
          setBanner({ tone: 'success', message: 'Admin account created. You can sign in now.' })
        } else {
          await authService.registerStudent({ full_name: forms.register.full_name, email: forms.register.email, password: forms.register.password, role: forms.register.role })
          setActiveTab('verify')
          updateForm('verify', 'email', forms.register.email)
          setBanner({ tone: 'success', message: 'Registration complete. Check your email for the OTP.' })
        }
      }
      if (activeTab === 'verify') {
        await authService.verifyEmail(forms.verify)
        setBanner({ tone: 'success', message: 'Email verified. You can sign in now.' })
        setActiveTab('login')
      }
      if (activeTab === 'admin') {
        const r = await authService.adminLogin(forms.admin)
        persistSession(r.data.token, r.data.user)
        navigate('/app')
      }
    } catch (err) {
      setBanner({ tone: 'danger', message: err.message })
    } finally {
      setBusy('')
    }
  }

  async function resendOtp() {
    setBusy('resend')
    setBanner({ tone: 'info', message: '' })
    try {
      await authService.resendOtp({ email: forms.verify.email })
      setBanner({ tone: 'success', message: 'A fresh OTP is on its way.' })
    } catch (err) {
      setBanner({ tone: 'danger', message: err.message })
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Full-width two-column grid — no max-width cap */}
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_580px]">

        {/* ── Left — branding panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          className="hidden flex-col justify-center gap-10 px-10 py-12 lg:flex xl:px-16"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-slate-600 transition hover:text-brand-600">
            <ArrowLeft className="h-5 w-5" />
            Back to home
          </Link>

          <AppLogo />

          <div>
            <h1
              className="font-display font-bold tracking-tight text-slate-900"
              style={{ fontSize: 'clamp(2.4rem, 3.5vw, 3.5rem)', lineHeight: 1.1 }}
            >
              Your campus,<br />
              <span className="gradient-text">all in one place.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-500">
              Students can discover and apply. Organizers can create events and review applications. Admins can moderate the queue.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock icon={LogIn} title="Student & organizer" text="Login, register, verify email, and manage your profile." color="from-brand-400 to-brand-600" />
            <InfoBlock icon={ShieldCheck} title="Admin access" text="Dedicated sign-in for campus admins reviewing event approvals." color="from-violet-500 to-violet-700" />
            <InfoBlock icon={CalendarCheck2} title="Event lifecycle" text="Create, submit, and track events through the approval pipeline." color="from-sky-400 to-sky-600" />
            <InfoBlock icon={Users} title="Student discovery" text="Search peers by skills, department, and year of study." color="from-amber-400 to-amber-600" />
          </div>
        </motion.div>

        {/* ── Right — auth form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          className="flex items-center justify-center bg-white/95 px-6 py-10 sm:px-10 lg:border-l lg:border-sky-100"
          style={{ boxShadow: '-8px 0 40px rgba(15,23,42,0.06)' }}
        >
          <div className="w-full max-w-[480px]">

            {/* Mobile back + logo */}
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-base font-semibold text-slate-600 transition hover:text-brand-600 lg:hidden">
              <ArrowLeft className="h-5 w-5" /> Back to home
            </Link>
            <div className="mb-7 lg:hidden"><AppLogo /></div>

            {/* Heading */}
            <h2 className="mb-1 font-display text-2xl font-bold text-slate-900">
              {activeTab === 'login' && 'Welcome back'}
              {activeTab === 'register' && 'Create your account'}
              {activeTab === 'verify' && 'Verify your email'}
              {activeTab === 'admin' && 'Admin sign in'}
            </h2>
            <p className="mb-7 text-base text-slate-500">
              {activeTab === 'login' && 'Sign in to access your workspace.'}
              {activeTab === 'register' && 'Join the CampusConnect community.'}
              {activeTab === 'verify' && 'Enter the OTP sent to your email.'}
              {activeTab === 'admin' && 'Restricted to college administrators.'}
            </p>

            {/* Tab switcher */}
            <div className="mb-7 grid grid-cols-4 gap-1 rounded-[14px] border border-slate-200 bg-slate-50 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-[10px] px-2 py-3 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === 'login' && (
                <>
                  <Field label="Email address">
                    <Input type="email" value={forms.login.email} onChange={(e) => updateForm('login', 'email', e.target.value)} placeholder="you@university.edu" required />
                  </Field>
                  <Field label="Password">
                    <Input type="password" value={forms.login.password} onChange={(e) => updateForm('login', 'password', e.target.value)} placeholder="••••••••" required />
                  </Field>
                </>
              )}

              {activeTab === 'register' && (
                <>
                  <Field label="Full name">
                    <Input value={forms.register.full_name} onChange={(e) => updateForm('register', 'full_name', e.target.value)} placeholder="Your full name" required />
                  </Field>
                  <Field label="Email address">
                    <Input type="email" value={forms.register.email} onChange={(e) => updateForm('register', 'email', e.target.value)} placeholder="you@university.edu" required />
                  </Field>
                  <Field label="Password">
                    <Input type="password" value={forms.register.password} onChange={(e) => updateForm('register', 'password', e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
                  </Field>
                  <Field label="Role">
                    <Select value={forms.register.role} onChange={(e) => updateForm('register', 'role', e.target.value)}>
                      <option value="STUDENT">Student</option>
                      <option value="COLLEGE_ADMIN">College Admin</option>
                    </Select>
                  </Field>
                  {forms.register.role === 'COLLEGE_ADMIN' && (
                    <Field label="Admin secret key">
                      <Input type="password" value={forms.register.secret_key} onChange={(e) => updateForm('register', 'secret_key', e.target.value)} placeholder="Provided by your institution" required />
                    </Field>
                  )}
                </>
              )}

              {activeTab === 'verify' && (
                <>
                  <Field label="Email used during registration">
                    <Input type="email" value={forms.verify.email} onChange={(e) => updateForm('verify', 'email', e.target.value)} placeholder="you@university.edu" required />
                  </Field>
                  <Field label="One-time password (OTP)">
                    <Input value={forms.verify.otp} onChange={(e) => updateForm('verify', 'otp', e.target.value)} placeholder="6-digit code" required />
                  </Field>
                  <SecondaryButton type="button" onClick={resendOtp} disabled={!forms.verify.email || busy === 'resend'} className="w-full">
                    Resend OTP
                  </SecondaryButton>
                </>
              )}

              {activeTab === 'admin' && (
                <>
                  <Field label="Admin email">
                    <Input type="email" value={forms.admin.email} onChange={(e) => updateForm('admin', 'email', e.target.value)} placeholder="admin@university.edu" required />
                  </Field>
                  <Field label="Password">
                    <Input type="password" value={forms.admin.password} onChange={(e) => updateForm('admin', 'password', e.target.value)} placeholder="••••••••" required />
                  </Field>
                </>
              )}

              <PrimaryButton type="submit" busy={busy === activeTab} className="mt-2 w-full py-3.5 text-base">
                {activeTab === 'register' ? 'Create account' : activeTab === 'verify' ? 'Verify email' : activeTab === 'admin' ? 'Sign in as admin' : 'Sign in'}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              {activeTab === 'login' && (
                <>No account?{' '}<button type="button" onClick={() => setActiveTab('register')} className="font-semibold text-brand-600 hover:underline">Register here</button></>
              )}
              {activeTab === 'register' && (
                <>Already have an account?{' '}<button type="button" onClick={() => setActiveTab('login')} className="font-semibold text-brand-600 hover:underline">Sign in</button></>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function InfoBlock({ icon: Icon, title, text, color }) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1.5 font-display text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  )
}

export default AuthPage
