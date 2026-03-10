import React, { useState, useEffect } from 'react';
import { MessageCircle, CalendarDays, CheckCircle2, Lock, User } from 'lucide-react';

const WA_URL       = 'https://wa.me/19205414464';
const CALENDAR_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ067UkjUd-FJOJtfEuLXOIvkKlqRgA0RT2ICqIQDtbgLmA-9loCHaDfBFh3MdY1h0XEeRyQ0dBc?gv=true';

/* ─── Multi-step contact form ─────────────────────────────── */
function ContactForm() {
  const [step, setStep]       = useState(1);
  const [showCal, setShowCal] = useState(false);

  const [f1, setF1] = useState({ nombre: '', empresa: '', email: '', telefono: '' });
  const [f2, setF2] = useState({ tipoVehiculo: '', vendedores: '', comentarios: '' });
  const [utmParams, setUtmParams] = useState({});

  // Capture UTM params on mount
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(key => {
      if (sp.get(key)) utm[key] = sp.get(key);
    });
    setUtmParams(utm);
  }, []);

  const f1Valid =
    f1.nombre.trim() && f1.empresa.trim() &&
    f1.email.includes('@') && f1.telefono.trim().length >= 6;

  const f2Valid = f2.tipoVehiculo && f2.vendedores;

  function cio(method, ...args) {
    const analytics = window.cioanalytics;
    if (analytics && typeof analytics[method] === 'function') {
      analytics[method](...args);
    } else {
      console.warn('[CIO] cioanalytics not ready — method:', method, args);
    }
  }

  function handleContinuar() {
    cio('identify', f1.email, {
      email: f1.email,
      full_name: f1.nombre,
      business_name: f1.empresa,
      phone: f1.telefono,
    });
    cio('track', 'form_submitted', {
      email: f1.email,
      full_name: f1.nombre,
      business_name: f1.empresa,
      phone: f1.telefono,
    });
    setStep(2);
  }

  function handleSubmit() {
    cio('track', 'business_info_submitted', {
      tipo_vehiculo: f2.tipoVehiculo,
      vendedores: f2.vendedores,
      comentarios: f2.comentarios,
      ...utmParams,
    });
    setStep(3);
  }

  /* progress dots */
  const dots = [1, 2, 3];

  return (
    <div style={f.card}>
      {/* Header */}
      <div style={f.cardHeader}>
        <p style={f.cardTitle}>
          {step === 1 && 'Hablemos de tu concesionaria'}
          {step === 2 && 'Cuéntanos un poco más'}
          {step === 3 && (showCal ? 'Elegí fecha y hora' : '¡Gracias por contactarnos!')}
        </p>
        {/* Progress */}
        {step < 3 && (
          <div style={f.dots}>
            {dots.map(d => (
              <div
                key={d}
                style={{
                  ...f.dot,
                  background: d <= step ? '#6D2EFF' : 'rgba(109,46,255,0.2)',
                  width: d === step ? '20px' : '8px',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={f.cardBody}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={f.fields}>
            <div style={f.row}>
              <Field
                label="Nombre"
                placeholder="Juan García"
                value={f1.nombre}
                onChange={v => setF1(p => ({ ...p, nombre: v }))}
              />
              <Field
                label="Empresa"
                placeholder="Concesionaria Norte"
                value={f1.empresa}
                onChange={v => setF1(p => ({ ...p, empresa: v }))}
              />
            </div>
            <Field
              label="Email"
              type="email"
              placeholder="juan@concesionaria.com"
              value={f1.email}
              onChange={v => setF1(p => ({ ...p, email: v }))}
            />
            <Field
              label="Teléfono"
              type="tel"
              placeholder="+54 11 1234-5678"
              value={f1.telefono}
              onChange={v => setF1(p => ({ ...p, telefono: v }))}
            />
            <button
              style={{ ...f.primaryBtn, opacity: f1Valid ? 1 : 0.45, cursor: f1Valid ? 'pointer' : 'not-allowed' }}
              disabled={!f1Valid}
              onClick={handleContinuar}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={f.fields}>
            <div style={f.fieldGroup}>
              <label style={f.label}>¿Qué tipo de vehículos venden?</label>
              <select
                style={f.select}
                value={f2.tipoVehiculo}
                onChange={e => setF2(p => ({ ...p, tipoVehiculo: e.target.value }))}
              >
                <option value="">Seleccioná una opción</option>
                <option value="nuevos">Vehículos nuevos</option>
                <option value="usados">Vehículos usados</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div style={f.fieldGroup}>
              <label style={f.label}>¿Cuántos vendedores hay en el equipo?</label>
              <select
                style={f.select}
                value={f2.vendedores}
                onChange={e => setF2(p => ({ ...p, vendedores: e.target.value }))}
              >
                <option value="">Seleccioná una opción</option>
                <option value="1-5">1 – 5 vendedores</option>
                <option value="5-15">5 – 15 vendedores</option>
                <option value="15+">Más de 15 vendedores</option>
              </select>
            </div>
            <div style={f.fieldGroup}>
              <label style={f.label}>Comentarios <span style={{ color: '#4a5568' }}>(opcional)</span></label>
              <textarea
                style={f.textarea}
                placeholder="Contanos el mayor desafío que tiene tu equipo con los leads hoy..."
                value={f2.comentarios}
                onChange={e => setF2(p => ({ ...p, comentarios: e.target.value }))}
                rows={3}
              />
            </div>
            <div style={f.btnRow}>
              <button style={f.backBtn} onClick={() => setStep(1)}>← Volver</button>
              <button
                style={{ ...f.primaryBtn, flex: 1, opacity: f2Valid ? 1 : 0.45, cursor: f2Valid ? 'pointer' : 'not-allowed' }}
                disabled={!f2Valid}
                onClick={handleSubmit}
              >
                Enviar consulta →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — success / calendar ── */}
        {step === 3 && !showCal && (
          <div style={f.success}>
            <div style={f.successIcon}><CheckCircle2 size={40} color="#10b981" strokeWidth={1.5} /></div>
            <p style={f.successTitle}>¡Consulta recibida!</p>
            <p style={f.successDesc}>
              Nos pondremos en contacto con <strong style={{ color: '#fff' }}>{f1.nombre}</strong> en menos de 24 horas hábiles.
            </p>
            <div style={f.successBtns}>
              <button
                style={f.waBtn}
                onClick={() => window.open(WA_URL, '_blank')}
              >
                <MessageCircle size={16} /> Contactar con ventas
              </button>
              <button
                style={f.calBtn}
                onClick={() => setShowCal(true)}
              >
                <CalendarDays size={16} /> Agendar una cita
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — calendar embed ── */}
        {step === 3 && showCal && (
          <div style={f.calWrap}>
            <button style={f.backCalBtn} onClick={() => setShowCal(false)}>← Volver</button>
            <iframe
              src={CALENDAR_URL}
              style={f.iframe}
              frameBorder="0"
              title="Agendar cita con ConcesionarIA"
            />
          </div>
        )}
      </div>

      {/* Trust strip */}
      {step < 3 && (
        <div style={f.trust}>
          <Lock size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Tus datos están seguros · Sin spam · Sin compromiso
        </div>
      )}
    </div>
  );
}

function Field({ label, type = 'text', placeholder, value, onChange }) {
  return (
    <div style={f.fieldGroup}>
      <label style={f.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={f.input}
        onFocus={e => (e.target.style.borderColor = '#6D2EFF')}
        onBlur={e => (e.target.style.borderColor = 'rgba(109,46,255,0.25)')}
      />
    </div>
  );
}

/* ─── Hero section ────────────────────────────────────────── */
export default function Hero() {
  return (
    <section style={s.section}>
      <div style={s.glowTop} />
      <div style={s.glowRight} />

      <div style={s.wrapper} className="hero-layout">

        {/* ── LEFT — copy ── */}
        <div style={s.left}>
          <div style={s.badge}>
            <span style={s.badgeDot} />
            IA Conversacional para Concesionarias de Autos
          </div>

          <h1 style={s.heading}>
            Vende más autos con{' '}
            <span style={s.highlight}>IA</span>.
            <br />
            Transforma tus leads
            <br />
            <span style={s.orange}>en ventas.</span>
          </h1>

          <p style={s.sub}>
            ConcesionarIA califica compradores en tiempo real vía WhatsApp y web
            chat — 24/7, sin intervención humana. Solo llegas al cliente cuando
            está listo para comprar.
          </p>

          {/* Trust stats */}
          <div style={s.statsRow}>
            {[
              { val: '+300', label: 'Concesionarias' },
              { val: '5.2%', label: 'Conversión chat' },
              { val: '24/7', label: 'Disponibilidad' },
            ].map((st, i) => (
              <div key={i} style={s.stat}>
                <span style={s.statVal}>{st.val}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={s.proof} className="hero-social-proof">
            <div style={s.avatars}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ ...s.avatar, left: `${i * 22}px`, zIndex: 4 - i }}>
                  <User size={18} color="#a78bfa" strokeWidth={1.5} />
                </div>
              ))}
            </div>
            <p style={s.proofText}>
              <strong>+300 concesionarias</strong> ya califican leads con ConcesionarIA
            </p>
          </div>
        </div>

        {/* ── RIGHT — contact form ── */}
        <div style={s.right}>
          <ContactForm />
        </div>

      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </section>
  );
}

/* ─── Form styles ─────────────────────────────────────────── */
const f = {
  card: {
    background: 'rgba(13,10,30,0.92)',
    border: '1px solid rgba(109,46,255,0.3)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(109,46,255,0.1)',
    backdropFilter: 'blur(12px)',
  },
  cardHeader: {
    padding: '1.5rem 1.75rem 1rem',
    borderBottom: '1px solid rgba(109,46,255,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: '1rem', margin: 0 },
  dots: { display: 'flex', alignItems: 'center', gap: '6px' },
  dot: { height: '8px', borderRadius: '100px', transition: 'all 0.3s' },
  cardBody: { padding: '1.5rem 1.75rem' },
  fields: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#a0aec0', fontSize: '0.8rem', fontWeight: '500' },
  input: {
    background: 'rgba(5,4,10,0.7)',
    border: '1px solid rgba(109,46,255,0.25)',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    color: '#fff', fontSize: '0.9rem',
    outline: 'none', width: '100%',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  select: {
    background: 'rgba(5,4,10,0.7)',
    border: '1px solid rgba(109,46,255,0.25)',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    color: '#fff', fontSize: '0.9rem',
    outline: 'none', width: '100%',
    cursor: 'pointer', fontFamily: 'inherit',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236D2EFF' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    paddingRight: '2.5rem',
  },
  textarea: {
    background: 'rgba(5,4,10,0.7)',
    border: '1px solid rgba(109,46,255,0.25)',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    color: '#fff', fontSize: '0.9rem',
    outline: 'none', width: '100%',
    resize: 'vertical', fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)',
    border: 'none', color: '#fff',
    padding: '0.85rem 1.5rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700',
    boxShadow: '0 6px 20px rgba(109,46,255,0.4)',
    width: '100%', transition: 'opacity 0.2s',
    fontFamily: 'inherit',
  },
  btnRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  backBtn: {
    background: 'rgba(109,46,255,0.08)',
    border: '1px solid rgba(109,46,255,0.2)',
    color: '#a78bfa', padding: '0.85rem 1rem',
    borderRadius: '10px', fontSize: '0.88rem',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  trust: {
    borderTop: '1px solid rgba(109,46,255,0.1)',
    padding: '0.85rem 1.75rem',
    color: '#4a5568', fontSize: '0.75rem', textAlign: 'center',
  },
  /* Step 3 */
  success: { textAlign: 'center', padding: '1rem 0' },
  successIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  successTitle: { color: '#fff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' },
  successDesc: { color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' },
  successBtns: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  waBtn: {
    background: '#25D366',
    border: 'none', color: '#fff',
    padding: '0.85rem 1.5rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    fontFamily: 'inherit',
  },
  calBtn: {
    background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)',
    border: 'none', color: '#fff',
    padding: '0.85rem 1.5rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 6px 20px rgba(109,46,255,0.4)', fontFamily: 'inherit',
  },
  /* Calendar */
  calWrap: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  backCalBtn: {
    background: 'none', border: 'none', color: '#a78bfa',
    fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer',
    textAlign: 'left', padding: 0, fontFamily: 'inherit',
  },
  iframe: {
    width: '100%', height: '600px', borderRadius: '10px',
    border: '0',
    display: 'block',
  },
};

/* ─── Section styles ──────────────────────────────────────── */
const s = {
  section: {
    position: 'relative',
    padding: '100px 2rem 80px',
    overflow: 'hidden',
    background: '#05040A',
  },
  glowTop: {
    position: 'absolute', top: '-200px', left: '30%', transform: 'translateX(-50%)',
    width: '700px', height: '700px',
    background: 'radial-gradient(circle, rgba(109,46,255,0.18) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  glowRight: {
    position: 'absolute', top: '-100px', right: '-150px',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(109,46,255,0.1) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  wrapper: {
    maxWidth: '1200px', margin: '0 auto',
    display: 'grid', gridTemplateColumns: '1fr 480px',
    gap: '3.5rem', alignItems: 'center',
    position: 'relative',
  },
  left: {},
  right: {},
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(109,46,255,0.12)', border: '1px solid rgba(109,46,255,0.35)',
    color: '#a78bfa', padding: '0.4rem 1rem', borderRadius: '100px',
    fontSize: '0.8rem', fontWeight: '500', marginBottom: '1.5rem',
  },
  badgeDot: {
    display: 'inline-block', width: '8px', height: '8px',
    background: '#6D2EFF', borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  heading: {
    fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', fontWeight: '800',
    lineHeight: '1.12', color: '#fff', marginBottom: '1.25rem',
    letterSpacing: '-0.03em',
  },
  highlight: {
    background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  orange: { color: '#FF6A00' },
  sub: {
    fontSize: '1rem', color: '#a0aec0', lineHeight: '1.7',
    marginBottom: '2rem', maxWidth: '500px',
  },
  statsRow: {
    display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  statVal: { color: '#6D2EFF', fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 },
  statLabel: { color: '#718096', fontSize: '0.78rem' },
  proof: {
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  avatars: { position: 'relative', width: '88px', height: '36px', flexShrink: 0 },
  avatar: {
    position: 'absolute', width: '36px', height: '36px', borderRadius: '50%',
    border: '2px solid #05040A', background: '#1a1640',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
  },
  proofText: { color: '#a0aec0', fontSize: '0.88rem' },
};
