import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { AlertBanner, AppLogo, Field, Input, PrimaryButton, SecondaryButton, Select } from '../components/ui.jsx'

const initialForms = {
  login: { email: '', password: '' },
  register: { full_name: '', email: '', password: '', role: 'STUDENT', secret_key: '' },
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
        if (forms.register.role === 'COLLEGE_ADMIN') {
          await api.post('/admin/register', {
            full_name: forms.register.full_name,
            email: forms.register.email,
            password: forms.register.password,
            secret_key: forms.register.secret_key,
          })
          setActiveTab('admin')
          updateForm('admin', 'email', forms.register.email)
          updateForm('admin', 'password', forms.register.password)
          setBanner({ tone: 'success', message: 'Admin account created successfully. You can sign in now.' })
        } else {
          await api.post('/auth/register', {
            full_name: forms.register.full_name,
            email: forms.register.email,
            password: forms.register.password,
            role: forms.register.role,
          })
          setActiveTab('verify')
          updateForm('verify', 'email', forms.register.email)
          setBanner({ tone: 'success', message: 'Registration complete. Check your email for the OTP, then verify here.' })
        }
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
      <main className="mx-auto grid min-h-screen w-full max-w-[1720px] items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(600px,760px)] lg:px-12 xl:px-14 2xl:px-16">
        <div className="space-y-10">
          <Link to="/" className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white/75 px-4 py-2 text-[0.98rem] font-semibold text-slate-900 shadow-sm transition hover:border-brand-300 hover:text-brand-600">
            <ArrowLeft className="h-5 w-5" />
            Back to home
          </Link>
          <div className="origin-left lg:scale-[1.06]">
            <AppLogo />
          </div>
          <div className="max-w-3xl">
            <h1 className="font-display text-[2.8rem] leading-[0.98] font-semibold tracking-tight text-slate-950 md:text-[3.7rem] xl:text-[4.45rem]">
              Sign in to the CampusConnect workspace.
            </h1>
            <p className="mt-6 max-w-[48rem] text-[1.08rem] leading-8 text-soft">
              Students can discover and apply. Organizers can create events and review applications. Admins can moderate the queue.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoBlock title="Student and organizer access" icon={LogIn} text="Login, register, verify email, and manage your profile in one place." />
            <InfoBlock title="Admin moderation" icon={ShieldCheck} text="Dedicated sign-in for campus admins reviewing event approvals." />
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel enterprise-strip mx-auto w-full max-w-[760px] p-6 md:p-8 xl:p-9"
        >
          <div className="mb-8 grid grid-cols-2 gap-2 rounded-lg bg-slate-900 p-2 text-white md:grid-cols-4">
            {['login', 'register', 'verify', 'admin'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-h-12 rounded-md px-4 py-3 text-[0.98rem] font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-100/85 hover:bg-white/12 hover:text-white'
                }`}
              >
                {tab === 'admin' ? 'Admin' : tab === 'verify' ? 'Verify' : tab === 'register' ? 'Register' : 'Login'}
              </button>
            ))}
          </div>

          <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

          <form onSubmit={handleSubmit} className="grid gap-6">
            {activeTab === 'login' ? (
              <div className="grid gap-5">
                <Field label="Email">
                  <Input type="email" value={forms.login.email} onChange={(event) => updateForm('login', 'email', event.target.value)} required />
                </Field>
                <Field label="Password">
                  <Input type="password" value={forms.login.password} onChange={(event) => updateForm('login', 'password', event.target.value)} required />
                </Field>
              </div>
            ) : null}

            {activeTab === 'register' ? (
              <div className="grid gap-5">
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
                    <option value="COLLEGE_ADMIN">Admin</option>
                  </Select>
                </Field>
                {forms.register.role === 'COLLEGE_ADMIN' ? (
                  <Field label="Admin secret">
                    <Input
                      type="password"
                      value={forms.register.secret_key}
                      onChange={(event) => updateForm('register', 'secret_key', event.target.value)}
                      required
                    />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {activeTab === 'verify' ? (
              <div className="grid gap-5">
                <Field label="Email used during registration">
                  <Input type="email" value={forms.verify.email} onChange={(event) => updateForm('verify', 'email', event.target.value)} required />
                </Field>
                <Field label="OTP">
                  <Input value={forms.verify.otp} onChange={(event) => updateForm('verify', 'otp', event.target.value)} required />
                </Field>
                <div className="flex flex-wrap gap-4">
                  <SecondaryButton type="button" onClick={resendOtp} disabled={!forms.verify.email}>
                    Resend OTP
                  </SecondaryButton>
                </div>
              </div>
            ) : null}

            {activeTab === 'admin' ? (
              <div className="grid gap-5">
                <Field label="Admin email">
                  <Input type="email" value={forms.admin.email} onChange={(event) => updateForm('admin', 'email', event.target.value)} required />
                </Field>
                <Field label="Password">
                  <Input type="password" value={forms.admin.password} onChange={(event) => updateForm('admin', 'password', event.target.value)} required />
                </Field>
              </div>
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
    <div className="glass-panel elevated-hover enterprise-strip p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mb-3 font-display text-[1.45rem] leading-tight font-semibold text-slate-950">{title}</h2>
      <p className="mb-0 text-[0.98rem] leading-7 text-soft">{text}</p>
    </div>
  )
}

export default AuthPage
