import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { AlertBanner, AppLogo, Field, Input, PrimaryButton, SecondaryButton, Select } from '../components/ui.jsx'

const initialForms = {
  login: { email: '', password: '' },
  register: { full_name: '', email: '', password: '', role: 'STUDENT' },
  verify: { email: '', otp: '' },
  admin: { email: '', password: '' },
}

function AuthPage() {
  const navigate = useNavigate()
  const { api, persistSession } = useApp()
  const [activeTab, setActiveTab] = useState('login')
  const [forms, setForms] = useState(initialForms)
  const [banner, setBanner] = useState({ tone: 'info', message: '' })
  const [busy, setBusy] = useState('')

  function updateForm(name, field, value) {
    setForms((current) => ({
      ...current,
      [name]: {
        ...current[name],
        [field]: value,
      },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBanner({ tone: 'info', message: '' })
    setBusy(activeTab)

    try {
      if (activeTab === 'login') {
        const response = await api.post('/auth/login', forms.login)
        persistSession(response.data.token, response.data.user)
        navigate('/app')
      }

      if (activeTab === 'register') {
        await api.post('/auth/register', forms.register)
        setActiveTab('verify')
        updateForm('verify', 'email', forms.register.email)
        setBanner({ tone: 'success', message: 'Registration complete. Check your email for the OTP, then verify here.' })
      }

      if (activeTab === 'verify') {
        await api.post('/auth/verify-email', forms.verify)
        setBanner({ tone: 'success', message: 'Email verified. You can sign in now.' })
        setActiveTab('login')
      }

      if (activeTab === 'admin') {
        const response = await api.post('/admin/login', forms.admin)
        persistSession(response.data.token, response.data.user)
        navigate('/app')
      }
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function resendOtp() {
    setBusy('resend')
    setBanner({ tone: 'info', message: '' })

    try {
      await api.post('/auth/resend-otp', { email: forms.verify.email })
      setBanner({ tone: 'success', message: 'A fresh OTP is on its way.' })
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="min-h-screen hero-gradient">
      <main className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-soft transition hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <AppLogo />
          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Sign in to the CampusConnect workspace.
            </h1>
            <p className="mt-4 text-base leading-7 text-soft">
              Students can discover and apply. Organizers can create events and review applications. Admins can moderate the queue.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock title="Student and organizer access" icon={LogIn} text="Login, register, verify email, and manage your profile in one place." />
            <InfoBlock title="Admin moderation" icon={ShieldCheck} text="Dedicated sign-in for campus admins reviewing event approvals." />
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel rounded-[32px] p-6 md:p-8"
        >
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-[24px] bg-slate-200/90 p-2 dark:bg-slate-900/80 md:grid-cols-4">
            {['login', 'register', 'verify', 'admin'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                }`}
              >
                {tab === 'admin' ? 'Admin' : tab}
              </button>
            ))}
          </div>

          <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'login' ? (
              <>
                <Field label="Email">
                  <Input type="email" value={forms.login.email} onChange={(event) => updateForm('login', 'email', event.target.value)} required />
                </Field>
                <Field label="Password">
                  <Input type="password" value={forms.login.password} onChange={(event) => updateForm('login', 'password', event.target.value)} required />
                </Field>
              </>
            ) : null}

            {activeTab === 'register' ? (
              <>
                <Field label="Full name">
                  <Input value={forms.register.full_name} onChange={(event) => updateForm('register', 'full_name', event.target.value)} required />
                </Field>
                <Field label="Email">
                  <Input type="email" value={forms.register.email} onChange={(event) => updateForm('register', 'email', event.target.value)} required />
                </Field>
                <Field label="Password">
                  <Input type="password" value={forms.register.password} onChange={(event) => updateForm('register', 'password', event.target.value)} required minLength={6} />
                </Field>
                <Field label="Role">
                  <Select
                    value={forms.register.role}
                    onChange={(event) => updateForm('register', 'role', event.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                  </Select>
                </Field>
              </>
            ) : null}

            {activeTab === 'verify' ? (
              <>
                <Field label="Email used during registration">
                  <Input type="email" value={forms.verify.email} onChange={(event) => updateForm('verify', 'email', event.target.value)} required />
                </Field>
                <Field label="OTP">
                  <Input value={forms.verify.otp} onChange={(event) => updateForm('verify', 'otp', event.target.value)} required />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <SecondaryButton type="button" onClick={resendOtp} disabled={!forms.verify.email}>
                    Resend OTP
                  </SecondaryButton>
                </div>
              </>
            ) : null}

            {activeTab === 'admin' ? (
              <>
                <Field label="Admin email">
                  <Input type="email" value={forms.admin.email} onChange={(event) => updateForm('admin', 'email', event.target.value)} required />
                </Field>
                <Field label="Password">
                  <Input type="password" value={forms.admin.password} onChange={(event) => updateForm('admin', 'password', event.target.value)} required />
                </Field>
              </>
            ) : null}

            <PrimaryButton type="submit" busy={busy === activeTab} className="w-full">
              {activeTab === 'register' ? 'Create account' : activeTab === 'verify' ? 'Verify email' : activeTab === 'admin' ? 'Login as admin' : 'Sign in'}
            </PrimaryButton>
          </form>
        </motion.section>
      </main>
    </div>
  )
}

function InfoBlock({ icon: Icon, title, text }) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mb-2 font-display text-lg font-semibold">{title}</h2>
      <p className="mb-0 text-sm text-soft">{text}</p>
    </div>
  )
}

export default AuthPage
