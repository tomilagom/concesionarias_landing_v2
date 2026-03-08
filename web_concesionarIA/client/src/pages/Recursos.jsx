import React, { useState } from 'react';
import Footer from '../components/Footer';

const WA_URL = 'https://wa.me/19205414464';

const resources = [
  {
    type: 'GUÍA',
    icon: '📘',
    title: 'Cómo vender más autos por WhatsApp: Guía completa 2024',
    desc: 'Todo lo que necesitás saber para convertir tu WhatsApp Business en una máquina de ventas. Desde la configuración hasta el cierre.',
    color: '#6D2EFF',
    time: '12 min lectura',
  },
  {
    type: 'WHITEPAPER',
    icon: '📄',
    title: 'El Estado Digital de las Concesionarias en LATAM',
    desc: 'Datos exclusivos sobre el estado actual de la digitalización automotriz en Argentina, México, Colombia y Brasil. Basado en 300+ concesionarias.',
    color: '#FF6A00',
    time: '20 min lectura',
  },
  {
    type: 'CASE STUDY',
    icon: '🏆',
    title: 'Caso Grupo Garden: 40% del mercado 0km en Paraguay',
    desc: 'Cómo el grupo automotriz más grande de Paraguay implementó ConcesionarIA y logró 40% de market share en menos de 12 meses.',
    color: '#10b981',
    time: '8 min lectura',
  },
  {
    type: 'CHECKLIST',
    icon: '✅',
    title: '14 señales de que tu concesionaria necesita IA urgente',
    desc: 'Diagnóstico rápido para saber si tu equipo está perdiendo leads por procesos manuales. Con solución para cada punto.',
    color: '#00C1D5',
    time: '5 min lectura',
  },
  {
    type: 'WEBINAR',
    icon: '🎥',
    title: 'Anti-Ghosting Engine: cómo dejar de perder leads calientes',
    desc: 'Grabación del webinar donde mostramos en vivo cómo el sistema detecta y reasigna leads no atendidos en tiempo real.',
    color: '#9B59FF',
    time: '45 min video',
  },
  {
    type: 'PLANTILLA',
    icon: '📋',
    title: 'Scripts de calificación: 15 preguntas que usa nuestra IA',
    desc: 'Las 15 preguntas exactas que usa ConcesionarIA para calificar un lead de auto en menos de 5 mensajes. Listo para copiar.',
    color: '#FF6A00',
    time: '3 min lectura',
  },
];

const faqs = [
  { q: '¿Cuánto tiempo lleva la implementación?', a: 'Garantizamos la implementación completa en 14 días hábiles. Esto incluye la conexión del WhatsApp Business, configuración del catálogo de vehículos, integración con tu CRM y el entrenamiento del equipo de ventas.' },
  { q: '¿Necesito saber programar para usar ConcesionarIA?', a: 'No. ConcesionarIA es una plataforma no-code. El equipo de Hyppo se encarga de toda la configuración inicial. Tu equipo solo necesita saber usar WhatsApp.' },
  { q: '¿Qué pasa con los leads que ya tengo en mi CRM?', a: 'ConcesionarIA puede importar y reactivar leads históricos de tu CRM. Nuestro sistema de re-engagement automático contacta leads fríos con mensajes personalizados basados en el modelo que consultaron.' },
  { q: '¿Cómo se conecta con Meta Ads y Google Ads?', a: 'La integración es directa. Capturamos el UTM, Click ID y fuente de cada lead automáticamente, vinculando cada conversación a la campaña exacta que la generó. Sin píxeles adicionales.' },
  { q: '¿Puedo tener múltiples marcas o sucursales?', a: 'Sí. El plan Enterprise incluye un dashboard unificado multi-marca y multi-sucursal. El CEO del grupo puede ver todo desde un solo lugar, mientras cada gerente de marca ve solo sus datos.' },
  { q: '¿ConcesionarIA reemplaza a los vendedores?', a: 'No. ConcesionarIA reemplaza las tareas repetitivas (responder preguntas básicas, calificar, hacer seguimiento). Los vendedores reciben leads ya calificados y solo se enfocan en cerrar. La productividad sube un 80%.' },
];

function ROIPreview() {
  const [leads, setLeads] = useState(800);
  const extra = Math.round(leads * 0.25 * 0.02);
  const revenue = extra * 1800;

  return (
    <div style={preStyles.wrapper}>
      <h3 style={preStyles.title}>¿Cuántos autos más podés vender?</h3>
      <div style={preStyles.fieldHeader}>
        <span style={preStyles.label}>Leads por mes: <strong style={{ color: '#6D2EFF' }}>{leads.toLocaleString()}</strong></span>
      </div>
      <input type="range" min={100} max={5000} step={100} value={leads}
        onChange={e => setLeads(Number(e.target.value))} style={preStyles.slider} />
      <div style={preStyles.result}>
        <div style={preStyles.resultItem}>
          <span style={preStyles.resultValue}>+{extra}</span>
          <span style={preStyles.resultLabel}>autos adicionales/mes</span>
        </div>
        <div style={preStyles.divider} />
        <div style={preStyles.resultItem}>
          <span style={{ ...preStyles.resultValue, color: '#FF6A00' }}>+${revenue.toLocaleString()}</span>
          <span style={preStyles.resultLabel}>ingreso adicional estimado</span>
        </div>
      </div>
      <button style={preStyles.btn} onClick={() => window.open(WA_URL, '_blank')}>
        Ver calculadora completa →
      </button>
    </div>
  );
}

export default function Recursos() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <div style={styles.page}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.container}>
            <span style={styles.eyebrow}>RECURSOS</span>
            <h1 style={styles.heroTitle}>
              Todo lo que necesitás<br />
              para <span style={styles.violet}>vender más autos</span>
            </h1>
            <p style={styles.heroDesc}>
              Guías, casos de éxito, webinars y herramientas gratuitas para modernizar
              tu concesionaria con IA.
            </p>
          </div>
        </section>

        {/* Resources grid */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>CONTENIDO</span>
              <h2 style={styles.sectionTitle}>Recursos <span style={styles.violet}>gratuitos</span></h2>
            </div>
            <div style={styles.resourcesGrid}>
              {resources.map((r, i) => (
                <div key={i} style={styles.resourceCard}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${r.color}40`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(109,46,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={styles.resourceTop}>
                    <span style={{ ...styles.resourceType, color: r.color, background: `${r.color}15` }}>{r.type}</span>
                    <span style={styles.resourceTime}>{r.time}</span>
                  </div>
                  <div style={styles.resourceIcon}>{r.icon}</div>
                  <h3 style={styles.resourceTitle}>{r.title}</h3>
                  <p style={styles.resourceDesc}>{r.desc}</p>
                  <button
                    style={{ ...styles.resourceBtn, color: r.color }}
                    onClick={() => window.open(WA_URL, '_blank')}
                  >
                    Acceder →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Mini Calculator */}
        <section style={{ ...styles.section, background: 'rgba(109,46,255,0.04)', borderTop: '1px solid rgba(109,46,255,0.1)' }}>
          <div style={styles.container}>
            <div style={styles.splitLayout} className="split-layout">
              <div style={styles.splitText}>
                <span style={styles.eyebrow}>CALCULADORA RÁPIDA</span>
                <h2 style={styles.sectionTitle}>Calculá tu ROI<br /><span style={styles.violet}>en 30 segundos</span></h2>
                <p style={styles.sectionDesc}>
                  Mové el slider para ver cuántos autos adicionales podría vender tu concesionaria
                  reduciendo la pérdida de leads con IA.
                </p>
                <p style={{ color: '#4a5568', fontSize: '0.82rem', marginTop: '1rem' }}>
                  * Basado en reducción promedio del 25% en pérdida de leads. Ver calculadora completa en la sección Precios.
                </p>
              </div>
              <ROIPreview />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>FAQ</span>
              <h2 style={styles.sectionTitle}>Preguntas <span style={styles.violet}>frecuentes</span></h2>
            </div>
            <div style={styles.faqList}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ ...styles.faqItem, borderColor: openFaq === i ? 'rgba(109,46,255,0.4)' : 'rgba(109,46,255,0.12)' }}>
                  <button
                    style={styles.faqQuestion}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span style={{ ...styles.faqIcon, transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <p style={styles.faqAnswer}>{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaGlow} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <h2 style={styles.ctaTitle}>¿Seguís con dudas?</h2>
            <p style={styles.ctaDesc}>Hablá directamente con un especialista de ConcesionarIA.</p>
            <button style={styles.primaryBtn} onClick={() => window.open(WA_URL, '_blank')}>
              Chatear por WhatsApp →
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  page: { background: '#05040A', minHeight: '100vh', paddingTop: '70px' },
  hero: { position: 'relative', padding: '80px 2rem 80px', overflow: 'hidden', textAlign: 'center' },
  heroBg: {
    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
    width: '800px', height: '800px',
    background: 'radial-gradient(circle, rgba(109,46,255,0.16) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  container: { maxWidth: '1100px', margin: '0 auto', position: 'relative' },
  eyebrow: { color: '#6D2EFF', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', display: 'block', marginBottom: '1rem' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', color: '#fff', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-0.03em' },
  violet: { background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroDesc: { color: '#a0aec0', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto', lineHeight: '1.7' },
  section: { padding: '80px 2rem' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionTitle: { fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '800', color: '#fff', lineHeight: '1.2', marginBottom: '0.75rem', letterSpacing: '-0.02em' },
  sectionDesc: { color: '#a0aec0', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' },
  resourcesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' },
  resourceCard: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)',
    borderRadius: '16px', padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    transition: 'border-color 0.2s, transform 0.2s', cursor: 'default',
  },
  resourceTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resourceType: { fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: '100px' },
  resourceTime: { color: '#4a5568', fontSize: '0.78rem' },
  resourceIcon: { fontSize: '2rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(109,46,255,0.08)', borderRadius: '12px' },
  resourceTitle: { color: '#fff', fontWeight: '700', fontSize: '1rem', lineHeight: '1.4' },
  resourceDesc: { color: '#718096', fontSize: '0.88rem', lineHeight: '1.6', flex: 1 },
  resourceBtn: { background: 'none', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', padding: 0, textAlign: 'left' },
  splitLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', maxWidth: '900px', margin: '0 auto' },
  faqList: { maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  faqItem: { background: 'rgba(13,10,30,0.7)', border: '1px solid', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' },
  faqQuestion: {
    width: '100%', background: 'none', border: 'none', padding: '1.25rem 1.5rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', gap: '1rem',
  },
  faqIcon: { color: '#6D2EFF', fontSize: '1.4rem', fontWeight: '300', flexShrink: 0, transition: 'transform 0.2s' },
  faqAnswer: { color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.7', padding: '0 1.5rem 1.25rem' },
  ctaSection: { position: 'relative', padding: '100px 2rem', borderTop: '1px solid rgba(109,46,255,0.12)', overflow: 'hidden' },
  ctaGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(109,46,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  ctaTitle: { fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  ctaDesc: { color: '#a0aec0', fontSize: '1rem', marginBottom: '2rem' },
  primaryBtn: { background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none', color: '#fff', padding: '0.9rem 2rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 25px rgba(109,46,255,0.4)' },
};

const preStyles = {
  wrapper: { background: 'rgba(13,10,30,0.8)', border: '1px solid rgba(109,46,255,0.25)', borderRadius: '18px', padding: '2rem' },
  title: { color: '#fff', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.25rem' },
  fieldHeader: { marginBottom: '0.5rem' },
  label: { color: '#a0aec0', fontSize: '0.9rem' },
  slider: { width: '100%', accentColor: '#6D2EFF', cursor: 'pointer', marginBottom: '1.5rem' },
  result: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
  resultItem: { flex: 1, textAlign: 'center', background: 'rgba(5,4,10,0.6)', borderRadius: '10px', padding: '1rem' },
  resultValue: { display: 'block', fontSize: '1.8rem', fontWeight: '800', color: '#6D2EFF', lineHeight: 1 },
  resultLabel: { color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' },
  divider: { width: '1px', background: 'rgba(109,46,255,0.1)' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none', color: '#fff', padding: '0.85rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' },
};
