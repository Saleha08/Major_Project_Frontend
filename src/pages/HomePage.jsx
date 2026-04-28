import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CalendarCheck2, ChevronRight, Compass, LayoutPanelTop,
  ShieldCheck, Sparkles, Star, Users, Zap, Globe, Award, TrendingUp,
  CheckCircle2, Play, ExternalLink, Menu, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { formatDate, toArray } from '../lib/api.js'

/* ── colour tokens (scoped to this page) ── */
const C = {
  bg: '#050915',
  bg2: '#080e1d',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6366f1',
  accentGlow: 'rgba(99,102,241,0.35)',
  accentSoft: 'rgba(99,102,241,0.12)',
  cyan: '#22d3ee',
  cyanGlow: 'rgba(34,211,238,0.25)',
  text: '#f1f5f9',
  muted: 'rgba(241,245,249,0.55)',
  dim: 'rgba(241,245,249,0.3)',
}

/* tiny helpers */
const Tag = ({ children, tone = 'indigo' }) => {
  const bg = tone === 'cyan'
    ? 'rgba(34,211,238,0.12)' : tone === 'green'
    ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.14)'
  const color = tone === 'cyan' ? '#22d3ee' : tone === 'green' ? '#10b981' : '#818cf8'
  const border = tone === 'cyan'
    ? 'rgba(34,211,238,0.25)' : tone === 'green'
    ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.28)'
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 12px', borderRadius:20,
      background:bg, color, border:`1px solid ${border}`,
      fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase'
    }}>{children}</span>
  )
}

const GlassCard = ({ children, style = {}, hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -4, borderColor: 'rgba(99,102,241,0.35)' } : undefined}
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      backdropFilter: 'blur(16px)',
      transition: 'border-color 0.2s',
      ...style
    }}
  >
    {children}
  </motion.div>
)

/* grid-dot background */
function GridBg() {
  return (
    <div style={{
      position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
      backgroundImage:`
        linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '52px 52px',
    }} />
  )
}

/* glowing orbs */
function Orbs() {
  return (
    <>
      <div style={{
        position:'fixed', top:'-20%', right:'-10%', width:700, height:700,
        background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
        pointerEvents:'none', zIndex:0,
      }} />
      <div style={{
        position:'fixed', bottom:'-25%', left:'-10%', width:600, height:600,
        background:'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)',
        pointerEvents:'none', zIndex:0,
      }} />
      <div style={{
        position:'fixed', top:'40%', left:'35%', width:400, height:400,
        background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)',
        pointerEvents:'none', zIndex:0,
      }} />
    </>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px',
        background: scrolled ? 'rgba(5,9,21,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'all 0.3s ease',
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:'linear-gradient(135deg,#6366f1,#818cf8)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 14px rgba(99,102,241,0.45)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontFamily:'Sora,sans-serif', fontSize:'1.05rem', fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>
          CampusConnect
        </span>
        <span style={{
          fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
          color:'rgba(255,255,255,0.35)', paddingLeft:2
        }}>
          Platform
        </span>
      </div>

      {/* Desktop nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:32 }} className="desktop-nav">
        {['Features','Events','How it works','Pricing'].map(item => (
          <a key={item} href={`#${item.toLowerCase().replace(/\s+/g,'-')}`}
            style={{ fontSize:'0.85rem', fontWeight:500, color:'rgba(255,255,255,0.55)', transition:'color 0.15s', cursor:'pointer' }}
            onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.95)'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>
            {item}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <Link to="/auth" style={{
          padding:'8px 18px', borderRadius:10,
          border:'1px solid rgba(255,255,255,0.12)',
          color:'rgba(255,255,255,0.75)', fontSize:'0.85rem', fontWeight:500,
          transition:'all 0.15s',
        }}
          onMouseEnter={e => { e.target.style.background='rgba(255,255,255,0.07)'; e.target.style.color='white' }}
          onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='rgba(255,255,255,0.75)' }}>
          Sign in
        </Link>
        <Link to="/auth">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding:'8px 20px', borderRadius:10,
              background:'linear-gradient(135deg,#6366f1,#818cf8)',
              color:'white', fontSize:'0.85rem', fontWeight:600,
              border:'none', cursor:'pointer',
              boxShadow:'0 4px 16px rgba(99,102,241,0.4)',
              display:'flex', alignItems:'center', gap:6,
            }}>
            Get Started <ArrowRight size={14} />
          </motion.button>
        </Link>

        {/* mobile toggle */}
        <button type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background:'transparent', border:`1px solid ${C.border}`, color:'white', borderRadius:8, padding:7, cursor:'pointer', display:'none' }}>
          {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
        </button>
      </div>

      <style>{`
        @media (max-width:768px){
          .desktop-nav { display:none !important; }
          .mobile-menu-btn { display:flex !important; }
        }
      `}</style>
    </motion.nav>
  )
}

/* HERO */
function Hero() {
  return (
    <section style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'120px 40px 80px', position:'relative', textAlign:'center',
    }}>
      {/* Badge */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ position:'absolute', top:0, left:0, right:0, bottom:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28 }}
      >
        <Tag tone="indigo">
          <Sparkles size={10}/> Now in beta · Join 2,400+ students
        </Tag>

        {/* Headline */}
        <div style={{ maxWidth:820 }}>
          <h1 style={{
            fontFamily:'Sora,sans-serif',
            fontSize:'clamp(2.8rem, 6vw, 5rem)',
            fontWeight:800,
            color:'#fff',
            lineHeight:1.08,
            letterSpacing:'-0.04em',
            marginBottom:0,
          }}>
            The{' '}
            <span style={{
              background:'linear-gradient(135deg,#6366f1 0%,#a78bfa 50%,#22d3ee 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>campus platform</span>
            <br/>
            built for ambition.
          </h1>
        </div>

        {/* Sub */}
        <p style={{
          maxWidth:560, fontSize:'clamp(1rem,1.8vw,1.2rem)',
          color:'rgba(241,245,249,0.58)', lineHeight:1.75,
          fontWeight:400,
        }}>
          Discover events, build your portfolio, recruit collaborators — all inside one intelligent workspace designed for modern campus life.
        </p>

        {/* CTA row */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
          <Link to="/auth">
            <motion.button
              whileHover={{ scale:1.03, boxShadow:'0 8px 32px rgba(99,102,241,0.5)' }}
              whileTap={{ scale:0.97 }}
              style={{
                padding:'14px 32px', borderRadius:14, cursor:'pointer',
                background:'linear-gradient(135deg,#6366f1,#818cf8)',
                color:'white', fontSize:'1rem', fontWeight:700,
                border:'none', display:'flex', alignItems:'center', gap:8,
                boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                letterSpacing:'-0.01em',
              }}>
              Launch Workspace <ArrowRight size={16}/>
            </motion.button>
          </Link>
          <a href="#events">
            <motion.button
              whileHover={{ background:'rgba(255,255,255,0.09)' }}
              style={{
                padding:'14px 28px', borderRadius:14, cursor:'pointer',
                background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.82)',
                fontSize:'1rem', fontWeight:500,
                border:`1px solid ${C.border}`,
                display:'flex', alignItems:'center', gap:8,
              }}>
              <Play size={14} fill="currentColor"/> Browse Events
            </motion.button>
          </a>
        </div>

        {/* Trust bar */}
        <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
          {[
            { icon:<CheckCircle2 size={14}/>, text:'Free to join' },
            { icon:<CheckCircle2 size={14}/>, text:'No credit card' },
            { icon:<CheckCircle2 size={14}/>, text:'Instant access' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.38)', fontSize:'0.8rem', fontWeight:500 }}>
              <span style={{ color:'#10b981' }}>{icon}</span>{text}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* STATS BAND */
function StatsBand() {
  const items = [
    { value:'2,400+', label:'Active Students', icon:<Users size={18}/> },
    { value:'340+',   label:'Events Hosted',   icon:<CalendarCheck2 size={18}/> },
    { value:'1,200+', label:'Applications',    icon:<TrendingUp size={18}/> },
    { value:'98%',    label:'Satisfaction',    icon:<Star size={18}/> },
  ]
  return (
    <section style={{ padding:'0 40px 80px', position:'relative', zIndex:1 }}>
      <motion.div
        initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        style={{
          maxWidth:1100, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1,
          background:`linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))`,
          borderRadius:24, border:`1px solid ${C.border}`,
          overflow:'hidden', backdropFilter:'blur(16px)',
        }}
      >
        {items.map((s, i) => (
          <div key={s.label} style={{
            padding:'32px 28px', textAlign:'center',
            borderRight: i < items.length-1 ? `1px solid ${C.border}` : 'none',
            background: C.surface,
          }}>
            <div style={{ color:C.accent, display:'flex', justifyContent:'center', marginBottom:12 }}>{s.icon}</div>
            <div style={{ fontFamily:'Sora,sans-serif', fontSize:'2.2rem', fontWeight:800, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:'0.78rem', color:C.muted, marginTop:8, fontWeight:500, letterSpacing:'0.03em' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* FEATURES */
const features = [
  {
    icon: <Compass size={22}/>,
    title: 'Smart Event Discovery',
    desc: 'AI-powered recommendations match you with events aligned to your skills, interests, and department.',
    tag: 'Discovery', tagTone:'indigo',
    highlight: true,
  },
  {
    icon: <LayoutPanelTop size={22}/>,
    title: 'Role-aware Workspace',
    desc: 'Students, organizers, and admins each get a purpose-built view. No clutter, just what you need.',
    tag: 'UX', tagTone:'cyan',
  },
  {
    icon: <ShieldCheck size={22}/>,
    title: 'Admin Moderation',
    desc: 'A focused approval queue keeps the platform clean. One click to approve or reject submissions.',
    tag: 'Admin', tagTone:'green',
  },
  {
    icon: <Zap size={22}/>,
    title: 'Instant Applications',
    desc: 'Apply to events in seconds. Organizers review, shortlist, and select — all within the platform.',
    tag: 'Workflow', tagTone:'indigo',
  },
  {
    icon: <Globe size={22}/>,
    title: 'Student Directory',
    desc: 'Search peers by skills, department, and year. Build your team before the deadline hits.',
    tag: 'Network', tagTone:'cyan',
  },
  {
    icon: <Award size={22}/>,
    title: 'Portfolio Building',
    desc: 'Completed events auto-add to your experience profile. Your participation tells its own story.',
    tag: 'Profile', tagTone:'green',
  },
]

function Features() {
  return (
    <section id="features" style={{ padding:'80px 40px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:'center', marginBottom:56 }}
        >
          <Tag>Platform Features</Tag>
          <h2 style={{
            fontFamily:'Sora,sans-serif', fontSize:'clamp(2rem,4vw,3rem)',
            fontWeight:800, color:'#fff', letterSpacing:'-0.035em',
            marginTop:20, marginBottom:16, lineHeight:1.1,
          }}>
            Everything you need,<br/>nothing you don't.
          </h2>
          <p style={{ color:C.muted, fontSize:'1.05rem', maxWidth:520, margin:'0 auto', lineHeight:1.75 }}>
            CampusConnect packs years of campus workflow insight into a clean, fast, intelligent platform.
          </p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i * 0.07 }}
              whileHover={{ y:-4, borderColor:'rgba(99,102,241,0.4)' }}
              style={{
                padding:'28px 26px', borderRadius:20,
                background: f.highlight
                  ? 'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.08))'
                  : C.surface,
                border: `1px solid ${f.highlight ? 'rgba(99,102,241,0.28)' : C.border}`,
                transition:'all 0.2s ease',
                position:'relative', overflow:'hidden',
              }}
            >
              {f.highlight && (
                <div style={{
                  position:'absolute', top:-30, right:-30, width:120, height:120,
                  background:'radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)',
                  pointerEvents:'none',
                }} />
              )}
              <div style={{
                width:46, height:46, borderRadius:12, marginBottom:18,
                background: f.highlight ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color: f.highlight ? '#818cf8' : 'rgba(255,255,255,0.7)',
              }}>
                {f.icon}
              </div>
              <Tag tone={f.tagTone}>{f.tag}</Tag>
              <h3 style={{
                fontFamily:'Sora,sans-serif', fontSize:'1.05rem', fontWeight:700,
                color:'#fff', marginTop:12, marginBottom:10, letterSpacing:'-0.02em',
              }}>{f.title}</h3>
              <p style={{ fontSize:'0.85rem', color:C.muted, lineHeight:1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* HOW IT WORKS */
const steps = [
  { step:'01', title:'Create your account', desc:'Sign up as a student or organizer. Verify your email and set up your profile in under two minutes.', icon:<Users size={20}/> },
  { step:'02', title:'Discover or create events', desc:'Browse approved campus events or submit your own through the organizer workflow.', icon:<Compass size={20}/> },
  { step:'03', title:'Apply and collaborate', desc:'Apply to roles, get shortlisted, and coordinate with organizers — all inside the platform.', icon:<Zap size={20}/> },
  { step:'04', title:'Build your portfolio', desc:'Completed events are automatically added to your profile as verifiable experiences.', icon:<Award size={20}/> },
]

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding:'80px 40px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:'center', marginBottom:56 }}
        >
          <Tag tone="cyan">How it works</Tag>
          <h2 style={{
            fontFamily:'Sora,sans-serif', fontSize:'clamp(2rem,4vw,3rem)',
            fontWeight:800, color:'#fff', letterSpacing:'-0.035em',
            marginTop:20, marginBottom:16, lineHeight:1.1,
          }}>
            From signup to selected<br/>in four steps.
          </h2>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, position:'relative' }}>
          {/* connecting line */}
          <div style={{
            position:'absolute', top:52, left:'12.5%', width:'75%', height:1,
            background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.4),rgba(34,211,238,0.4),transparent)',
            pointerEvents:'none', zIndex:0,
          }} />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
              style={{ position:'relative', zIndex:1, textAlign:'center', padding:'0 12px' }}
            >
              <div style={{
                width:64, height:64, borderRadius:18, margin:'0 auto 20px',
                background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12))',
                border:'1px solid rgba(99,102,241,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#818cf8', fontSize:'1rem', fontWeight:800,
                fontFamily:'Sora,sans-serif', flexDirection:'column', gap:4,
                boxShadow:'0 8px 24px rgba(99,102,241,0.15)',
              }}>
                <span style={{ fontSize:'0.6rem', color:'rgba(129,140,248,0.6)', letterSpacing:'0.08em' }}>{s.step}</span>
                {s.icon}
              </div>
              <h3 style={{ fontFamily:'Sora,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#fff', marginBottom:8, letterSpacing:'-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize:'0.8rem', color:C.muted, lineHeight:1.65 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* LIVE EVENTS */
function LiveEvents({ events }) {
  const catColor = { TECH:'#6366f1', CULTURAL:'#10b981', SPORTS:'#f59e0b' }
  const catBg = { TECH:'rgba(99,102,241,0.12)', CULTURAL:'rgba(16,185,129,0.12)', SPORTS:'rgba(245,158,11,0.12)' }

  return (
    <section id="events" style={{ padding:'80px 40px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}
        >
          <div>
            <Tag>Live Opportunities</Tag>
            <h2 style={{
              fontFamily:'Sora,sans-serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)',
              fontWeight:800, color:'#fff', letterSpacing:'-0.035em',
              marginTop:16, marginBottom:8, lineHeight:1.1,
            }}>
              Open events right now.
            </h2>
            <p style={{ color:C.muted, fontSize:'0.9rem' }}>
              Approved and live. Sign in to apply in seconds.
            </p>
          </div>
          <Link to="/auth" style={{ display:'inline-flex', alignItems:'center', gap:6,
            padding:'10px 20px', borderRadius:12,
            background:'rgba(99,102,241,0.14)', border:'1px solid rgba(99,102,241,0.3)',
            color:'#818cf8', fontSize:'0.85rem', fontWeight:600,
            transition:'all 0.15s',
          }}>
            View all <ChevronRight size={14}/>
          </Link>
        </motion.div>

        {events.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:C.muted }}>
            <Compass size={40} style={{ margin:'0 auto 16px', opacity:0.4, display:'block' }}/>
            <p style={{ fontSize:'0.9rem' }}>No events available right now. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {events.slice(0, 6).map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.07 }}
                whileHover={{ y:-4, borderColor:'rgba(99,102,241,0.4)' }}
                style={{
                  padding:'22px', borderRadius:20,
                  background:C.surface, border:`1px solid ${C.border}`,
                  transition:'all 0.2s', display:'flex', flexDirection:'column',
                }}
              >
                {/* Top row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{
                    padding:'4px 11px', borderRadius:20, fontSize:'0.68rem', fontWeight:700,
                    background:catBg[event.category] || 'rgba(99,102,241,0.12)',
                    color:catColor[event.category] || '#818cf8',
                    border:`1px solid ${catColor[event.category] || '#6366f1'}33`,
                  }}>{event.category}</span>
                  <span style={{
                    padding:'3px 10px', borderRadius:20, fontSize:'0.65rem', fontWeight:700,
                    background:'rgba(16,185,129,0.1)', color:'#10b981',
                    border:'1px solid rgba(16,185,129,0.2)',
                  }}>{event.status}</span>
                </div>

                <h3 style={{ fontFamily:'Sora,sans-serif', fontSize:'0.98rem', fontWeight:700, color:'#fff', marginBottom:8, lineHeight:1.3 }}>{event.title}</h3>
                <p style={{ fontSize:'0.78rem', color:C.muted, lineHeight:1.6, marginBottom:14, flex:1 }}>{event.description}</p>

                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:'0.72rem', color:C.dim, marginBottom:4 }}>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Event: </span>{event.event_name}
                  </p>
                  <p style={{ fontSize:'0.72rem', color:C.dim }}>
                    <span style={{ color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Deadline: </span>{formatDate(event.deadline)}
                  </p>
                </div>

                {toArray(event.required_skills).length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                    {toArray(event.required_skills).slice(0,3).map(skill => (
                      <span key={skill} style={{
                        padding:'3px 9px', borderRadius:6, fontSize:'0.65rem', fontWeight:600,
                        background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)',
                        border:'1px solid rgba(255,255,255,0.08)',
                      }}>{skill}</span>
                    ))}
                  </div>
                )}

                <Link to="/auth" style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  padding:'10px', borderRadius:12,
                  background:'rgba(99,102,241,0.14)', border:'1px solid rgba(99,102,241,0.28)',
                  color:'#818cf8', fontSize:'0.8rem', fontWeight:600,
                  transition:'all 0.15s', marginTop:'auto',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.26)'; e.currentTarget.style.color='white' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(99,102,241,0.14)'; e.currentTarget.style.color='#818cf8' }}
                >
                  Apply Now <ArrowRight size={13}/>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* TESTIMONIALS */
const testimonials = [
  { name:'Priya Sharma', role:'CS · Year 3', text:'I found my hackathon team through CampusConnect. The student search is incredibly powerful.', avatar:'PS' },
  { name:'Arjun Mehta', role:'Event Organizer', text:'Managing applicants used to take hours. Now the shortlisting flow saves me half a day per event.', avatar:'AM' },
  { name:'Riya Patel', role:'Design · Year 2', text:'Applied to three design internships in one morning. The platform just makes it so frictionless.', avatar:'RP' },
]

function Testimonials() {
  return (
    <section style={{ padding:'80px 40px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:'center', marginBottom:48 }}
        >
          <Tag tone="green">Testimonials</Tag>
          <h2 style={{
            fontFamily:'Sora,sans-serif', fontSize:'clamp(2rem,4vw,2.8rem)',
            fontWeight:800, color:'#fff', letterSpacing:'-0.035em',
            marginTop:20, marginBottom:0, lineHeight:1.1,
          }}>
            Loved by students<br/>across campus.
          </h2>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
              style={{ padding:'28px', borderRadius:20, background:C.surface, border:`1px solid ${C.border}` }}
            >
              <div style={{ display:'flex', gap:4, marginBottom:16 }}>
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={13} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:20 }}>
                "{t.text}"
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:38, height:38, borderRadius:10,
                  background:'linear-gradient(135deg,#6366f1,#a78bfa)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', fontWeight:700, color:'white', flexShrink:0,
                }}>{t.avatar}</div>
                <div>
                  <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#fff' }}>{t.name}</p>
                  <p style={{ fontSize:'0.72rem', color:C.dim }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* CTA BANNER */
function CtaBanner() {
  return (
    <section style={{ padding:'80px 40px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, scale:0.97 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          style={{
            borderRadius:28, padding:'64px 48px', textAlign:'center',
            background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.14),rgba(34,211,238,0.08))',
            border:'1px solid rgba(99,102,241,0.3)',
            position:'relative', overflow:'hidden',
          }}
        >
          <div style={{
            position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
            width:500, height:500, pointerEvents:'none',
            background:'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 65%)',
          }} />

          <div style={{ position:'relative', zIndex:1 }}>
            <Tag>Get started today</Tag>
            <h2 style={{
              fontFamily:'Sora,sans-serif', fontSize:'clamp(2rem,4vw,3.2rem)',
              fontWeight:800, color:'#fff', letterSpacing:'-0.04em',
              marginTop:20, marginBottom:16, lineHeight:1.1,
            }}>
              Your campus career<br/>starts here.
            </h2>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1rem', maxWidth:440, margin:'0 auto 32px', lineHeight:1.75 }}>
              Join thousands of students discovering opportunities, building portfolios, and finding their teams on CampusConnect.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                  style={{
                    padding:'14px 36px', borderRadius:14, cursor:'pointer',
                    background:'linear-gradient(135deg,#6366f1,#818cf8)',
                    color:'white', fontSize:'1rem', fontWeight:700,
                    border:'none', display:'flex', alignItems:'center', gap:8,
                    boxShadow:'0 6px 24px rgba(99,102,241,0.45)',
                    letterSpacing:'-0.01em',
                  }}>
                  Create Free Account <ArrowRight size={16}/>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* FOOTER */
function Footer() {
  return (
    <footer style={{
      padding:'48px 40px 32px',
      borderTop:`1px solid ${C.border}`,
      position:'relative', zIndex:1,
    }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:32, height:32, borderRadius:9,
              background:'linear-gradient(135deg,#6366f1,#818cf8)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily:'Sora,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>CampusConnect</span>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            {[
              /* GitHub */
              <svg key="gh" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
              /* Twitter/X */
              <svg key="tw" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              /* LinkedIn */
              <svg key="li" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
            ].map((svgIcon, i) => (
              <button key={i} type="button" style={{
                width:34, height:34, borderRadius:9,
                background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'rgba(255,255,255,0.45)', cursor:'pointer', transition:'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.color='#818cf8' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.45)' }}>
                {svgIcon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:'0.75rem', color:C.dim }}>© 2025 CampusConnect. All rights reserved.</p>
          <div style={{ display:'flex', gap:20 }}>
            {['Privacy','Terms','Support'].map(link => (
              <a key={link} href="#" style={{ fontSize:'0.75rem', color:C.dim, transition:'color 0.15s' }}
                onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.65)'}
                onMouseLeave={e => e.target.style.color=C.dim}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── MAIN PAGE ── */
function HomePage() {
  const { api } = useApp()
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get('/events?limit=6')
      .then(r => setEvents(r.data?.events || []))
      .catch(() => {})
  }, [api])

  return (
    <div style={{ background:C.bg, minHeight:'100vh', color:C.text, fontFamily:'DM Sans,sans-serif', position:'relative', overflowX:'hidden' }}>
      <GridBg />
      <Orbs />
      <Navbar />
      <Hero />
      <StatsBand />
      <Features />
      <HowItWorks />
      <LiveEvents events={events} />
      <Testimonials />
      <CtaBanner />
      <Footer />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        a { text-decoration: none; }
        button { font-family: inherit; }
        @media (max-width: 900px) {
          .grid-3-cols { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .grid-3-cols, .grid-4-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default HomePage