import React from 'react';
import { Link } from 'react-router-dom';

const WA_URL = 'https://wa.me/19205414464';
const SOCIAL_LINKS = {
  '𝕏': 'https://x.com',
  'in': 'https://linkedin.com',
  '▶': 'https://youtube.com',
  '📧': WA_URL,
};

function LogoIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="footerGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D2EFF" />
          <stop offset="100%" stopColor="#9B59FF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#footerGrad)" />
      <rect x="28" y="16" width="18" height="10" rx="2" fill="white" />
      <rect x="16" y="24" width="14" height="18" rx="2" fill="white" />
      <rect x="28" y="38" width="18" height="10" rx="2" fill="white" />
    </svg>
  );
}

const footerLinks = {
  Producto: [
    { label: 'Calificación IA', path: '/producto' },
    { label: 'Seguimiento', path: '/producto' },
    { label: 'Atribución', path: '/producto' },
    { label: 'Integraciones', path: '/producto' },
  ],
  Concesionarias: [
    { label: 'Franquicias 0km', path: '/concesionarias' },
    { label: 'Grupos automotrices', path: '/concesionarias' },
    { label: 'Usados y Multimarca', path: '/concesionarias' },
    { label: 'Casos de éxito', path: '/concesionarias' },
  ],
  Recursos: [
    { label: 'Blog', path: '/blog' },
    { label: 'Calculadora ROI', path: '/precios' },
    { label: 'Guías y webinars', path: '/recursos' },
    { label: 'FAQ', path: '/recursos' },
  ],
  Precios: [
    { label: 'Plan Gold', path: '/precios' },
    { label: 'Plan Platinum', path: '/precios' },
    { label: 'Plan Enterprise', path: '/precios' },
    { label: 'Early adopters', path: '/precios' },
  ],
};

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.top} className="footer-top">
          <div style={styles.brand}>
            <div style={styles.logo}>
              <LogoIcon size={32} />
              <div>
                <div style={styles.logoText}>
                  <span>Concesionar</span>
                  <span style={styles.logoIA}>IA</span>
                </div>
                <div style={styles.poweredBy}>
                  powered by <span style={styles.hyppo}>Hyppo</span>
                </div>
              </div>
            </div>
            <p style={styles.brandDesc}>
              La plataforma de IA conversacional que califica compradores de autos y genera más ventas
              vía WhatsApp y web chat para concesionarias de toda Latinoamérica.
            </p>
            <div style={styles.socials}>
              {['𝕏', 'in', '▶', '📧'].map((icon, i) => (
                <button key={i} style={styles.socialBtn} onClick={() => window.open(SOCIAL_LINKS[icon], '_blank')}>{icon}</button>
              ))}
            </div>
          </div>

          <div style={styles.links} className="footer-links">
            {Object.entries(footerLinks).map(([category, items]) => (
              <div key={category} style={styles.linkCol}>
                <h4 style={styles.linkTitle}>{category}</h4>
                <ul style={styles.linkList}>
                  {items.map(item => (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        style={styles.linkItem}
                        onMouseEnter={e => (e.currentTarget.style.color = '#6D2EFF')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#4a5568')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.bottom} className="footer-bottom">
          <p style={styles.copyright}>
            © 2024 ConcesionarIA — powered by <span style={styles.hyppo}>Hyppo</span>. Todos los derechos reservados.
          </p>
          <div style={styles.legal}>
            {['Privacidad', 'Términos', 'Cookies'].map(item => (
              <span
                key={item}
                style={styles.legalLink}
                onMouseEnter={e => (e.target.style.color = '#6D2EFF')}
                onMouseLeave={e => (e.target.style.color = '#2d3748')}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#030208',
    borderTop: '1px solid rgba(109,46,255,0.12)',
    padding: '80px 2rem 40px',
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  top: { display: 'flex', gap: '4rem', flexWrap: 'wrap', marginBottom: '3rem' },
  brand: { maxWidth: '280px', flex: '0 0 auto' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' },
  logoText: { fontSize: '1.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' },
  logoIA: { color: '#6D2EFF' },
  poweredBy: { fontSize: '0.7rem', color: '#4a5568', marginTop: '0.1rem' },
  hyppo: { color: '#FF6A00', fontWeight: '700' },
  brandDesc: { color: '#4a5568', fontSize: '0.85rem', lineHeight: '1.7', marginBottom: '1.5rem' },
  socials: { display: 'flex', gap: '0.75rem' },
  socialBtn: {
    background: 'rgba(109,46,255,0.08)', border: '1px solid rgba(109,46,255,0.18)',
    color: '#718096', width: '36px', height: '36px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.2s, border-color 0.2s',
  },
  links: { display: 'flex', gap: '2.5rem', flex: 1, flexWrap: 'wrap' },
  linkCol: { minWidth: '140px' },
  linkTitle: {
    color: '#e2e8f0', fontSize: '0.82rem', fontWeight: '600',
    marginBottom: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  linkList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  linkItem: { color: '#4a5568', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s' },
  divider: { height: '1px', background: 'rgba(109,46,255,0.08)', marginBottom: '1.5rem' },
  bottom: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '1rem',
  },
  copyright: { color: '#2d3748', fontSize: '0.82rem' },
  legal: { display: 'flex', gap: '1.5rem' },
  legalLink: { color: '#2d3748', fontSize: '0.82rem', cursor: 'pointer', transition: 'color 0.2s' },
};
