import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const WA_URL = 'https://wa.me/19205414464';

const navItems = [
  { label: 'Producto',       path: '/producto',       icon: '📦' },
  { label: 'Concesionarias', path: '/concesionarias', icon: '🚗' },
  { label: 'Precios',        path: '/precios',        icon: '💰' },
  { label: 'Recursos',       path: '/recursos',       icon: '📚' },
  { label: 'Blog',           path: '/blog',           icon: '✍️' },
];

function LogoIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="navGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D2EFF" />
          <stop offset="100%" stopColor="#9B59FF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#navGrad)" />
      <rect x="28" y="16" width="18" height="10" rx="2" fill="white" />
      <rect x="16" y="24" width="14" height="18" rx="2" fill="white" />
      <rect x="28" y="38" width="18" height="10" rx="2" fill="white" />
      <rect x="39" y="10" width="18" height="12" rx="2.5" fill="#1a1640" />
      <text x="48" y="20" fontFamily="Inter,Arial" fontSize="8" fontWeight="700" fill="#a78bfa" textAnchor="middle">IA</text>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const location                       = useLocation();

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* close drawer on navigation */
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const navBg = scrolled
    ? { ...s.nav, background: 'rgba(5,4,10,0.96)', backdropFilter: 'blur(14px)', boxShadow: '0 1px 0 rgba(109,46,255,0.2)' }
    : { ...s.nav, background: 'transparent' };

  return (
    <>
      {/* ── Main navbar bar ── */}
      <nav style={navBg}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={s.logo}>
            <LogoIcon size={34} />
            <div>
              <div style={s.logoName}>
                <span style={{ color: '#fff' }}>Concesionar</span>
                <span style={{ color: '#6D2EFF' }}>IA</span>
              </div>
              <div style={s.poweredBy}>powered by <span style={s.hyppo}>Hyppo</span></div>
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="nav-desktop-links" style={s.links}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path} style={{ listStyle: 'none' }}>
                <Link
                  to={item.path}
                  style={{ ...s.link, color: active ? '#fff' : '#a0aec0', borderBottom: active ? '2px solid #6D2EFF' : '2px solid transparent', paddingBottom: '2px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = active ? '#fff' : '#a0aec0')}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop action buttons */}
        <div className="nav-desktop-actions" style={s.actions}>
          <button style={s.loginBtn} onClick={() => window.open(WA_URL, '_blank')}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6D2EFF'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(109,46,255,0.4)'; e.currentTarget.style.color = '#a0aec0'; }}>
            Iniciar sesión
          </button>
          <button style={s.signupBtn} onClick={() => window.open(WA_URL, '_blank')}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Demo gratis →
          </button>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="nav-hamburger"
          onClick={() => setDrawerOpen(o => !o)}
          aria-label="Abrir menú"
        >
          <span style={{ transform: drawerOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: drawerOpen ? 0 : 1 }} />
          <span style={{ transform: drawerOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* ── Backdrop ── */}
      <div
        className={`mobile-backdrop${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Side drawer ── */}
      <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>

        {/* Drawer header */}
        <div style={s.drawerHeader}>
          <div style={s.drawerLogo}>
            <LogoIcon size={30} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                <span style={{ color: '#fff' }}>Concesionar</span>
                <span style={{ color: '#6D2EFF' }}>IA</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#4a5568' }}>powered by <span style={{ color: '#FF6A00', fontWeight: 700 }}>Hyppo</span></div>
            </div>
          </div>
          <button style={s.closeBtn} onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav style={s.drawerNav}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...s.drawerLink,
                  background: active ? 'rgba(109,46,255,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid #6D2EFF' : '3px solid transparent',
                  color: active ? '#fff' : '#a0aec0',
                }}
              >
                <span style={s.drawerLinkIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {active && <span style={s.drawerActiveDot} />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={s.drawerDivider} />

        {/* CTA buttons */}
        <div style={s.drawerCtas}>
          <button style={s.drawerWaBtn} onClick={() => window.open(WA_URL, '_blank')}>
            <span>💬</span> Solicitar demo por WhatsApp
          </button>
          <button style={s.drawerLoginBtn} onClick={() => window.open(WA_URL, '_blank')}>
            Iniciar sesión
          </button>
        </div>

        {/* Footer hint */}
        <div style={s.drawerFooter}>
          <span>© 2024 ConcesionarIA</span>
        </div>
      </div>
    </>
  );
}

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    padding: '0 1.5rem', height: '70px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'background 0.3s, box-shadow 0.3s',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' },
  logoName: { fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' },
  poweredBy: { fontSize: '0.68rem', color: '#4a5568' },
  hyppo: { color: '#FF6A00', fontWeight: 700 },
  links: { display: 'flex', alignItems: 'center', gap: '1.75rem', listStyle: 'none', margin: 0, padding: 0 },
  link: { fontSize: '0.88rem', fontWeight: 500, transition: 'color 0.2s', cursor: 'pointer' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  loginBtn: {
    background: 'transparent', border: '1px solid rgba(109,46,255,0.4)',
    color: '#a0aec0', padding: '0.5rem 1.1rem', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', cursor: 'pointer',
  },
  signupBtn: {
    background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none',
    color: '#fff', padding: '0.5rem 1.2rem', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(109,46,255,0.4)',
  },
  /* Drawer */
  drawerHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid rgba(109,46,255,0.12)',
    flexShrink: 0,
  },
  drawerLogo: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  closeBtn: {
    background: 'rgba(109,46,255,0.1)', border: '1px solid rgba(109,46,255,0.2)',
    color: '#a78bfa', width: '36px', height: '36px', borderRadius: '8px',
    fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  drawerNav: {
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    padding: '1rem 0.75rem', flex: 1,
  },
  drawerLink: {
    display: 'flex', alignItems: 'center', gap: '0.85rem',
    padding: '0.85rem 1rem', borderRadius: '10px',
    fontSize: '1rem', fontWeight: 600, textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s',
  },
  drawerLinkIcon: { fontSize: '1.15rem', width: '24px', textAlign: 'center', flexShrink: 0 },
  drawerActiveDot: {
    marginLeft: 'auto', width: '6px', height: '6px',
    background: '#6D2EFF', borderRadius: '50%',
  },
  drawerDivider: {
    height: '1px', background: 'rgba(109,46,255,0.1)',
    margin: '0 1.25rem',
  },
  drawerCtas: {
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  drawerWaBtn: {
    background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none',
    color: '#fff', padding: '0.9rem 1.25rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 6px 20px rgba(109,46,255,0.4)',
  },
  drawerLoginBtn: {
    background: 'rgba(109,46,255,0.08)', border: '1px solid rgba(109,46,255,0.25)',
    color: '#a78bfa', padding: '0.85rem 1.25rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
  },
  drawerFooter: {
    padding: '1rem 1.25rem',
    color: '#2d3748', fontSize: '0.75rem',
    borderTop: '1px solid rgba(109,46,255,0.08)',
    marginTop: 'auto',
  },
};
