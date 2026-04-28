import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, LogIn, ShieldCheck } from 'lucide-react'
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

function AuthPage() {
  const navigate = useNavigate()
  const { persistSession } = useApp()
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
        const response = await authService.login(forms.login)
        persistSession(response.data.token, response.data.user)
        navigate('/app')
      }

      if (activeTab === 'register') {
        if (forms.register.role === 'COLLEGE_ADMIN') {
          await authService.registerAdmin({
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
          await authService.registerStudent({
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
        await authService.verifyEmail(forms.verify)
        setBanner({ tone: 'success', message: 'Email verified. You can sign in now.' })
        setActiveTab('login')
      }

      if (activeTab === 'admin') {
        const response = await authService.adminLogin(forms.admin)
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
      await authService.resendOtp({ email: forms.verify.email })
      setBanner({ tone: 'success', message: 'A fresh OTP is on its way.' })
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="min-h-screen hero-gradient">
      <main className="mx-auto grid min-h-screen w-full max-w-[1720px] items-center gap-14 px-8 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(720px,860px)] lg:px-14 xl:px-16 2xl:px-20">
        <div className="space-y-10">
          <Link to="/" className="inline-flex items-center gap-3 text-[1.08rem] font-medium text-slate-900 transition hover:text-brand-600">
            <ArrowLeft className="h-5 w-5" />
            Back to home
          </Link>
          <AppLogo />
          <div className="max-w-3xl">
            <h1 className="font-display text-[3.4rem] leading-[0.95] font-semibold tracking-tight text-slate-950 md:text-[4rem] xl:text-[4.7rem] 2xl:text-[5.15rem]">
              Sign in to the CampusConnect workspace.
            </h1>
            <p className="mt-7 max-w-[52rem] text-[1.22rem] leading-9 text-slate-800">
              Students can discover and apply. Organizers can create events and review applications. Admins can moderate the queue.
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            <InfoBlock title="Student and organizer access" icon={LogIn} text="Login, register, verify email, and manage your profile in one place." />
            <InfoBlock title="Admin moderation" icon={ShieldCheck} text="Dedicated sign-in for campus admins reviewing event approvals." />
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel mx-auto w-full max-w-[860px] rounded-[24px] p-9 md:p-11 xl:p-12"
        >
          <div className="mb-8 grid grid-cols-2 gap-2 rounded-[var(--radius-xl)] border border-slate-200 bg-slate-50/90 p-2 md:grid-cols-4">
            {['login', 'register', 'verify', 'admin'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-h-14 rounded-[var(--radius-lg)] px-4 py-3 text-sm font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                {tab === 'admin' ? 'Admin' : tab === 'verify' ? 'Verify' : tab === 'register' ? 'Register' : 'Login'}
              </button>
            ))}
          </div>

          <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex flex-wrap gap-4">
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
    <div className="glass-panel elevated-hover rounded-[24px] p-8 xl:p-9">
      <div className="mb-5 flex h-15 w-15 items-center justify-center rounded-[18px] bg-brand-500/10 text-brand-600 dark:text-brand-300">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mb-3 font-display text-[2rem] leading-tight font-semibold text-slate-950 xl:text-[2.2rem]">{title}</h2>
      <p className="mb-0 text-[1.14rem] leading-9 text-slate-800">{text}</p>
    </div>
  )
}

export default AuthPage
