import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, LogIn, RefreshCw, Send, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { AlertBanner, Field, Input, PrimaryButton, Select } from '../components/ui.jsx'

const C = {
  bg: '#050915',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.13)',
  accent: '#6366f1',
  text: '#f1f5f9',
  muted: 'rgba(241,245,249,0.52)',
}

const initialForms = {
  login: { email: '', password: '' },
  register: { full_name: '', email: '', password: '', role: 'STUDENT', secret_key: '' },
  verify: { email: '', otp: '' },
  admin: { email: '', password: '' },
}

const TABS = [
  { key: 'login',    label: 'Sign In',   icon: <LogIn size={14}/> },
  { key: 'register', label: 'Register',  icon: <CheckCircle2 size={14}/> },
  { key: 'verify',   label: 'Verify',    icon: <Send size={14}/> },
  { key: 'admin',    label: 'Admin',     icon: <ShieldCheck size={14}/> },
]

function AuthPage() {
  const navigate = useNavigate()
  const { api, persistSession } = useApp()
  const [activeTab, setActiveTab] = useState('login')
  const [forms, setForms] = useState(initialForms)
  const [banner, setBanner] = useState({ tone: 'info', message: '' })
  const [busy, setBusy] = useState('')

  function updateForm(name, field, value) {
    setForms(cur => ({ ...cur, [name]: { ...cur[name], [field]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBanner({ tone: 'info', message: '' })
    setBusy(activeTab)
    try {
      if (activeTab === 'login') {
        const r = await api.post('/auth/login', forms.login)
        persistSession(r.data.token, r.data.user)
        navigate('/app')
      }
      if (activeTab === 'register') {
        if (forms.register.role === 'COLLEGE_ADMIN') {
          await api.post('/admin/register', {
            full_name: forms.register.full_name, email: forms.register.email,
            password: forms.register.password, secret_key: forms.register.secret_key,
          })
          setActiveTab('admin')
          updateForm('admin', 'email', forms.register.email)
          updateForm('admin', 'password', forms.register.password)
          setBanner({ tone: 'success', message: 'Admin account created. You can sign in now.' })
        } else {
          await api.post('/auth/register', {
            full_name: forms.register.full_name, email: forms.register.email,
            password: forms.register.password, role: forms.register.role,
          })
          setActiveTab('verify')
          updateForm('verify', 'email', forms.register.email)
          setBanner({ tone: 'success', message: 'Account created! Check your email for the OTP.' })
        }
      }
      if (activeTab === 'verify') {
        await api.post('/auth/verify-email', forms.verify)
        setBanner({ tone: 'success', message: 'Email verified. You can sign in now.' })
        setActiveTab('login')
      }
      if (activeTab === 'admin') {
        const r = await api.post('/admin/login', forms.admin)
        persistSession(r.data.token, r.data.user)
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
      setBanner({ tone: 'success', message: 'A fresh OTP has been sent.' })
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  const submitLabel = {
    login: 'Sign In',
    register: 'Create Account',
    verify: 'Verify Email',
    admin: 'Admin Sign In',
  }[activeTab]

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Background glow */}
      <div style={{ position:'fixed', top:'-20%', right:'-10%', width:600, height:600, background:'radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-15%', left:'-10%', width:500, height:500, background:'radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }} />

      {/* Left panel — visible on large screens */}
      <div style={{
        flex: 1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'80px 64px', position:'relative', zIndex:1,
      }} className="auth-left-panel">
        <Link to="/" style={{
          display:'inline-flex', alignItems:'center', gap:8, marginBottom:48,
          color:'rgba(255,255,255,0.45)', fontSize:'0.85rem', fontWeight:500, transition:'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
          <ArrowLeft size={15}/> Back to home
        </Link>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:48 }}>
          <div style={{
            width:44, height:44, borderRadius:13,
            background:'linear-gradient(135deg,#6366f1,#818cf8)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 6px 20px rgba(99,102,241,0.5)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'Sora,sans-serif', fontSize:'1.15rem', fontWeight:800, color:'white', letterSpacing:'-0.02em' }}>CampusConnect</div>
            <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:1 }}>Platform</div>
          </div>
        </div>

        <h1 style={{
          fontFamily:'Sora,sans-serif',
          fontSize:'clamp(2.2rem,3.5vw,3.4rem)',
          fontWeight:800, color:'white',
          letterSpacing:'-0.04em', lineHeight:1.08,
          marginBottom:20,
        }}>
          Your campus<br/>
          <span style={{
            background:'linear-gradient(135deg,#818cf8,#22d3ee)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>career starts here.</span>
        </h1>

        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'1.05rem', lineHeight:1.75, maxWidth:440, marginBottom:48 }}>
          Discover events, build your portfolio, and find collaborators — all in one intelligent platform built for modern campus life.
        </p>

        {/* Feature list */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { icon:<CheckCircle2 size={16}/>, text:'Apply to events in seconds' },
            { icon:<CheckCircle2 size={16}/>, text:'Smart student directory & networking' },
            { icon:<CheckCircle2 size={16}/>, text:'Auto-build your experience portfolio' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ color:'#818cf8', flexShrink:0 }}>{icon}</span>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.9rem', fontWeight:500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width:'100%', maxWidth:520,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px 32px',
        position:'relative', zIndex:1,
        borderLeft:`1px solid ${C.border}`,
        background:'rgba(8,14,29,0.6)',
        backdropFilter:'blur(24px)',
        minHeight:'100vh',
      }}>
        <motion.div
          initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.4 }}
          style={{ width:'100%', maxWidth:420 }}
        >
          {/* Mobile back link */}
          <Link to="/" style={{
            display:'inline-flex', alignItems:'center', gap:6, marginBottom:28,
            color:'rgba(255,255,255,0.4)', fontSize:'0.82rem',
          }} className="mobile-back-link">
            <ArrowLeft size={13}/> Home
          </Link>

          {/* Heading */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'white', letterSpacing:'-0.03em', marginBottom:6 }}>
              {activeTab === 'login' ? 'Welcome back' :
               activeTab === 'register' ? 'Create your account' :
               activeTab === 'verify' ? 'Verify your email' :
               'Admin sign in'}
            </h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', lineHeight:1.6 }}>
              {activeTab === 'login' ? 'Sign in to your CampusConnect workspace.' :
               activeTab === 'register' ? 'Join thousands of students on the platform.' :
               activeTab === 'verify' ? 'Enter the OTP sent to your email address.' :
               'Access the admin moderation dashboard.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(4,1fr)',
            background:'rgba(255,255,255,0.04)',
            borderRadius:14, padding:4,
            border:`1px solid ${C.border}`,
            marginBottom:24, gap:2,
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding:'8px 4px', borderRadius:10,
                  border:'none', cursor:'pointer',
                  background: activeTab === tab.key
                    ? 'linear-gradient(135deg,#6366f1,#818cf8)'
                    : 'transparent',
                  color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.4)',
                  fontSize:'0.72rem', fontWeight:700,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  transition:'all 0.15s',
                  boxShadow: activeTab === tab.key ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alert */}
          <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone:'info', message:'' })} />

          {/* Form */}
          <motion.form
            key={activeTab}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            onSubmit={handleSubmit}
            style={{ display:'flex', flexDirection:'column', gap:14 }}
          >
            {activeTab === 'login' && <>
              <DarkField label="Email address">
                <DarkInput type="email" value={forms.login.email} onChange={e => updateForm('login','email',e.target.value)} placeholder="you@university.edu" required />
              </DarkField>
              <DarkField label="Password">
                <DarkInput type="password" value={forms.login.password} onChange={e => updateForm('login','password',e.target.value)} placeholder="••••••••" required />
              </DarkField>
            </>}

            {activeTab === 'register' && <>
              <DarkField label="Full name">
                <DarkInput value={forms.register.full_name} onChange={e => updateForm('register','full_name',e.target.value)} placeholder="Your full name" required />
              </DarkField>
              <DarkField label="Email address">
                <DarkInput type="email" value={forms.register.email} onChange={e => updateForm('register','email',e.target.value)} placeholder="you@university.edu" required />
              </DarkField>
              <DarkField label="Password">
                <DarkInput type="password" value={forms.register.password} onChange={e => updateForm('register','password',e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
              </DarkField>
              <DarkField label="Account type">
                <DarkSelect value={forms.register.role} onChange={e => updateForm('register','role',e.target.value)}>
                  <option value="STUDENT">Student</option>
                  <option value="COLLEGE_ADMIN">College Admin</option>
                </DarkSelect>
              </DarkField>
              {forms.register.role === 'COLLEGE_ADMIN' && (
                <DarkField label="Admin secret key">
                  <DarkInput type="password" value={forms.register.secret_key} onChange={e => updateForm('register','secret_key',e.target.value)} placeholder="Enter secret key" required />
                </DarkField>
              )}
            </>}

            {activeTab === 'verify' && <>
              <DarkField label="Registered email">
                <DarkInput type="email" value={forms.verify.email} onChange={e => updateForm('verify','email',e.target.value)} placeholder="you@university.edu" required />
              </DarkField>
              <DarkField label="One-time password (OTP)">
                <DarkInput value={forms.verify.otp} onChange={e => updateForm('verify','otp',e.target.value)} placeholder="6-digit OTP" required />
              </DarkField>
              <button type="button" onClick={resendOtp} disabled={!forms.verify.email || busy === 'resend'}
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background:'transparent', border:`1px solid ${C.border}`,
                  color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', fontWeight:500,
                  padding:'8px 14px', borderRadius:9, cursor:'pointer', alignSelf:'flex-start',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.color='#818cf8' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color='rgba(255,255,255,0.5)' }}>
                <RefreshCw size={13}/> Resend OTP
              </button>
            </>}

            {activeTab === 'admin' && <>
              <DarkField label="Admin email">
                <DarkInput type="email" value={forms.admin.email} onChange={e => updateForm('admin','email',e.target.value)} placeholder="admin@university.edu" required />
              </DarkField>
              <DarkField label="Password">
                <DarkInput type="password" value={forms.admin.password} onChange={e => updateForm('admin','password',e.target.value)} placeholder="••••••••" required />
              </DarkField>
            </>}

            <motion.button
              whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
              type="submit"
              disabled={!!busy}
              style={{
                width:'100%', padding:'13px', borderRadius:13, marginTop:4,
                background:'linear-gradient(135deg,#6366f1,#818cf8)',
                color:'white', fontSize:'0.92rem', fontWeight:700,
                border:'none', cursor:busy?'not-allowed':'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity:busy?0.7:1, transition:'opacity 0.15s',
                boxShadow:'0 6px 20px rgba(99,102,241,0.4)',
                letterSpacing:'-0.01em',
              }}>
              {busy === activeTab ? (
                <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
              ) : null}
              {submitLabel}
            </motion.button>
          </motion.form>

          {/* Switch tab hint */}
          <p style={{ textAlign:'center', marginTop:20, fontSize:'0.8rem', color:'rgba(255,255,255,0.3)' }}>
            {activeTab === 'login' ? (
              <> No account? {' '}
                <button type="button" onClick={() => setActiveTab('register')}
                  style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontWeight:600, fontSize:'0.8rem' }}>
                  Create one
                </button>
              </>
            ) : (
              <> Already have an account? {' '}
                <button type="button" onClick={() => setActiveTab('login')}
                  style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontWeight:600, fontSize:'0.8rem' }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 800px) {
          .auth-left-panel { display: none !important; }
        }
        @media (min-width: 800px) {
          .mobile-back-link { display: none !important; }
        }
      `}</style>
    </div>
  )
}

/* Dark-themed form primitives */
function DarkField({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:'0.78rem', fontWeight:600, color:'rgba(255,255,255,0.55)', letterSpacing:'0.02em' }}>{label}</label>
      {children}
    </div>
  )
}

function DarkInput({ className='', ...props }) {
  return (
    <input
      {...props}
      style={{
        width:'100%', padding:'11px 14px', borderRadius:11,
        background:'rgba(255,255,255,0.05)',
        border:'1px solid rgba(255,255,255,0.1)',
        color:'white', fontSize:'0.88rem',
        outline:'none', transition:'border-color 0.15s, box-shadow 0.15s',
        fontFamily:'inherit',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.55)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)' }}
      onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.boxShadow='none' }}
      placeholder={props.placeholder}
    />
  )
}

function DarkSelect({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width:'100%', padding:'11px 14px', borderRadius:11,
        background:'rgba(255,255,255,0.05)',
        border:'1px solid rgba(255,255,255,0.1)',
        color:'white', fontSize:'0.88rem',
        outline:'none', transition:'border-color 0.15s',
        fontFamily:'inherit', cursor:'pointer',
        appearance:'none',
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center',
        paddingRight:36,
      }}
    >
      {children}
    </select>
  )
}

export default AuthPage