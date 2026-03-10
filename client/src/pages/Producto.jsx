import React, { useState } from 'react';
import Footer from '../components/Footer';
import { MessageCircle, Brain, BarChart3, Bot, Target, RefreshCw, TrendingUp, Link2, Smartphone, Eye, Briefcase, DollarSign, Flame, ClipboardList } from 'lucide-react';

const WA_URL = 'https://wa.me/19205414464';

const layers = [
  {
    number: '01',
    name: 'Gochat',
    subtitle: 'El Gateway Conversacional',
    color: '#6D2EFF',
    icon: MessageCircle,
    points: [
      'Gestión híbrida: IA y vendedor humano en el mismo hilo de WhatsApp.',
      'Entrega catálogos interactivos, PDF y ubicaciones del concesionario dentro de WhatsApp.',
      'Cada mensaje se convierte en un "Data Event" y se envía al CDP en milisegundos.',
      'Detección de intención de alto valor: test drive, crédito, consulta de precio.',
    ],
  },
  {
    number: '02',
    name: 'Customer.io',
    subtitle: 'El Cerebro: CDP + Motor de Lógica',
    color: '#FF6A00',
    icon: Brain,
    points: [
      'Automatizaciones basadas en comportamiento real, no simples timers de 24h.',
      'Motor Anti-Ghosting: si un vendedor no responde a un lead caliente en 30 min, el sistema reasigna.',
      'Lead Health Score: separa "curiosos" de "compradores listos" automáticamente.',
      'Continuidad omnicanal: backup por email o SMS si el usuario se desconecta de WhatsApp.',
    ],
  },
  {
    number: '03',
    name: 'Dashboard BI',
    subtitle: 'La Capa de Visibilidad',
    color: '#00C1D5',
    icon: BarChart3,
    points: [
      'Seller Leaderboard: quién responde más rápido, quién cierra más leads calificados.',
      'Heatmaps por modelo: qué vehículo genera más test drives vs consultas de precio.',
      'Atribución ROI exacto: cuántos USD en ventas generó cada campaña de Facebook.',
      'Dashboard en tiempo real en Looker Studio, siempre disponible para gerentes.',
    ],
  },
];

const conversationSteps = [
  { from: 'bot', text: '¡Hola! Soy el asistente de Toyota Belgrano 🚗 ¿Ya tenés un modelo en mente o querés que te ayude a elegir?' },
  { from: 'user', text: 'Busco una Hilux, ¿tienen stock?' },
  { from: 'bot', text: '¡Sí! Tenemos 3 versiones disponibles de la Hilux. ¿Es para uso particular o laboral? Así te ofrezco la mejor opción 💜' },
  { from: 'user', text: 'Laboral, para la empresa' },
  { from: 'bot', text: 'Perfecto. Para uso empresarial te recomiendo la Hilux SRX 4x4. Precio lista: USD 42,500. ¿Querés ver las opciones de financiación o agendar un test drive?' },
  { from: 'user', text: 'Financiación, ¿cuánto sería la cuota?' },
  { from: 'bot', text: 'Plan 60 cuotas: USD 890/mes con 30% de anticipo. ¿Querés que un asesor te arme un plan personalizado? Necesito tu nombre y datos de la empresa 📋' },
];

const capabilities = [
  { icon: Target, title: 'Calificación inteligente', desc: 'La IA detecta modelo, versión, presupuesto y urgencia sin que el lead llene un formulario.' },
  { icon: RefreshCw, title: 'Anti-Ghosting Engine', desc: 'Si un vendedor tarda más de 30 min en responder a un lead caliente, el sistema actúa automáticamente.' },
  { icon: TrendingUp, title: 'Lead Health Score', desc: 'Cada lead recibe un score en tiempo real. Tu equipo solo habla con los top 20%.' },
  { icon: Link2, title: 'Integración ERP/CRM', desc: 'Conecta con SAP, Dynamics 365, Pilot y cualquier VMS. Sin pérdida de datos.' },
  { icon: Smartphone, title: 'WhatsApp nativo', desc: 'El cliente nunca descarga una app. Todo ocurre dentro de WhatsApp, donde ya está.' },
  { icon: Eye, title: 'Visibilidad total del funnel', desc: 'Del primer clic al contrato firmado. Cada dólar de pauta trazado a una venta real.' },
];

export default function Producto() {
  const [activeMsg, setActiveMsg] = useState(0);

  React.useEffect(() => {
    if (activeMsg < conversationSteps.length - 1) {
      const t = setTimeout(() => setActiveMsg(m => m + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [activeMsg]);

  return (
    <>
      <div style={styles.page}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.container}>
            <span style={styles.eyebrow}>PRODUCTO</span>
            <h1 style={styles.heroTitle}>
              El Sistema Operativo de Ventas<br />
              para tu <span style={styles.violet}>Concesionaria</span>
            </h1>
            <p style={styles.heroDesc}>
              ConcesionarIA es una solución end-to-end que transforma WhatsApp en una máquina de ventas estructurada
              mediante tres capas integradas: conversación, lógica y visibilidad.
            </p>
            <div style={styles.heroCtas} className="hero-producto-ctas">
              <button style={styles.primaryBtn} onClick={() => window.open(WA_URL, '_blank')}>Solicitar demo →</button>
              <button style={styles.ghostBtn} onClick={() => window.open(WA_URL, '_blank')}>Ver el bot en acción <MessageCircle size={16} style={{ verticalAlign: 'middle', marginLeft: '4px' }} /></button>
            </div>
          </div>
        </section>

        {/* Triple Layer */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>ARQUITECTURA</span>
              <h2 style={styles.sectionTitle}>La arquitectura <span style={styles.violet}>Triple Capa</span></h2>
              <p style={styles.sectionDesc}>Tres herramientas especializadas trabajando como una sola.</p>
            </div>
            <div style={styles.layersGrid} className="layers-grid">
              {layers.map((layer, i) => (
                <div key={i} style={{ ...styles.layerCard, borderColor: `${layer.color}30` }}>
                  <div style={{ ...styles.layerTop, background: `${layer.color}15` }}>
                    <span style={styles.layerNum}>{layer.number}</span>
                    <layer.icon size={32} color={layer.color} strokeWidth={1.5} />
                  </div>
                  <div style={styles.layerBody}>
                    <h3 style={{ ...styles.layerName, color: layer.color }}>{layer.name}</h3>
                    <p style={styles.layerSub}>{layer.subtitle}</p>
                    <ul style={styles.layerList}>
                      {layer.points.map((p, j) => (
                        <li key={j} style={styles.layerPoint}>
                          <span style={{ color: layer.color, marginRight: '0.5rem' }}>✓</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Chat Demo */}
        <section style={{ ...styles.section, background: 'rgba(109,46,255,0.03)' }}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>EL BOT EN ACCIÓN</span>
              <h2 style={styles.sectionTitle}>Así califica un lead <span style={styles.violet}>ConcesionarIA</span></h2>
              <p style={styles.sectionDesc}>Una conversación real de calificación, financiación y cierre — sin intervención humana.</p>
            </div>
            <div style={styles.chatWrapper} className="chat-layout">
              <div style={styles.chatPhone}>
                <div style={styles.chatHeader}>
                  <div style={styles.chatAvatar}><Bot size={20} color="#a78bfa" strokeWidth={1.5} /></div>
                  <div>
                    <div style={styles.chatName}>Toyota Belgrano · IA</div>
                    <div style={styles.chatOnline}>● En línea</div>
                  </div>
                </div>
                <div style={styles.chatBody}>
                  {conversationSteps.slice(0, activeMsg + 1).map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.chatMsg,
                        alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.from === 'user'
                          ? 'linear-gradient(135deg, #6D2EFF, #9B59FF)'
                          : 'rgba(255,255,255,0.06)',
                        borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        animation: 'fadeIn 0.3s ease',
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {activeMsg < conversationSteps.length - 1 && (
                    <div style={{ ...styles.chatMsg, alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)' }}>
                      <span style={styles.typing}>● ● ●</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.chatSideStats}>
                <h3 style={styles.chatSideTitle}>Lo que la IA hace en segundo plano</h3>
                {[
                  { icon: Target, label: 'Modelo detectado', value: 'Hilux SRX 4x4' },
                  { icon: Briefcase, label: 'Uso identificado', value: 'Empresarial' },
                  { icon: DollarSign, label: 'Presupuesto estimado', value: 'USD 40k–50k' },
                  { icon: Flame, label: 'Lead Score', value: '87 / 100' },
                  { icon: ClipboardList, label: 'Etapa del funnel', value: 'Financiación' },
                ].map((s, i) => (
                  <div key={i} style={styles.sideStatRow}>
                    <s.icon size={16} color="#a78bfa" strokeWidth={1.5} />
                    <span style={styles.sideStatLabel}>{s.label}</span>
                    <span style={styles.sideStatValue}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>CAPACIDADES</span>
              <h2 style={styles.sectionTitle}>Todo lo que <span style={styles.violet}>ConcesionarIA</span> hace por vos</h2>
            </div>
            <div style={styles.capGrid} className="cap-grid">
              {capabilities.map((c, i) => (
                <div key={i} style={styles.capCard}>
                  <div style={styles.capIcon}><c.icon size={24} color="#a78bfa" strokeWidth={1.5} /></div>
                  <h3 style={styles.capTitle}>{c.title}</h3>
                  <p style={styles.capDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaGlow} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <h2 style={styles.ctaTitle}>¿Listo para ver ConcesionarIA en tu concesionaria?</h2>
            <p style={styles.ctaDesc}>Demo personalizada en 30 minutos. Sin compromiso.</p>
            <button style={styles.primaryBtn} onClick={() => window.open(WA_URL, '_blank')}>
              Agendar demo por WhatsApp →
            </button>
          </div>
        </section>
      </div>
      <Footer />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </>
  );
}

const styles = {
  page: { background: '#05040A', minHeight: '100vh', paddingTop: '70px' },
  hero: { position: 'relative', padding: '80px 2rem 100px', overflow: 'hidden' },
  heroBg: {
    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
    width: '800px', height: '800px',
    background: 'radial-gradient(circle, rgba(109,46,255,0.2) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  container: { maxWidth: '1100px', margin: '0 auto', position: 'relative' },
  eyebrow: {
    color: '#6D2EFF', fontSize: '0.75rem', fontWeight: '700',
    letterSpacing: '0.12em', display: 'block', marginBottom: '1rem',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800',
    color: '#fff', lineHeight: '1.15', marginBottom: '1.5rem',
    letterSpacing: '-0.03em', textAlign: 'center',
  },
  violet: {
    background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  heroDesc: {
    color: '#a0aec0', fontSize: '1.1rem', maxWidth: '680px',
    margin: '0 auto 2.5rem', lineHeight: '1.7', textAlign: 'center',
  },
  heroCtas: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none',
    color: '#fff', padding: '0.9rem 2rem', borderRadius: '10px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(109,46,255,0.4)',
  },
  ghostBtn: {
    background: 'rgba(109,46,255,0.1)', border: '1px solid rgba(109,46,255,0.3)',
    color: '#a78bfa', padding: '0.9rem 2rem', borderRadius: '10px',
    fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
  },
  section: { padding: '80px 2rem' },
  sectionHeader: { textAlign: 'center', marginBottom: '3.5rem' },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '800',
    color: '#fff', lineHeight: '1.2', marginBottom: '0.75rem', letterSpacing: '-0.02em',
  },
  sectionDesc: { color: '#a0aec0', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' },
  layersGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem',
  },
  layerCard: {
    background: 'rgba(13,10,30,0.8)', border: '1px solid',
    borderRadius: '18px', overflow: 'hidden',
  },
  layerTop: {
    padding: '1.5rem', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
  layerNum: { fontSize: '2.5rem', fontWeight: '800', color: 'rgba(255,255,255,0.08)' },
  layerIcon: { fontSize: '2rem' },
  layerBody: { padding: '0 1.5rem 1.5rem' },
  layerName: { fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.2rem' },
  layerSub: { color: '#718096', fontSize: '0.88rem', marginBottom: '1.25rem' },
  layerList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  layerPoint: { color: '#a0aec0', fontSize: '0.88rem', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start' },
  chatWrapper: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem',
    maxWidth: '900px', margin: '0 auto', alignItems: 'start',
  },
  chatPhone: {
    background: 'rgba(13,10,30,0.9)', border: '1px solid rgba(109,46,255,0.2)',
    borderRadius: '18px', overflow: 'hidden',
  },
  chatHeader: {
    background: 'rgba(5,4,10,0.8)', padding: '1rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    borderBottom: '1px solid rgba(109,46,255,0.1)',
  },
  chatAvatar: {
    width: '38px', height: '38px', background: 'rgba(109,46,255,0.2)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
  },
  chatName: { color: '#fff', fontWeight: '600', fontSize: '0.9rem' },
  chatOnline: { color: '#10b981', fontSize: '0.75rem' },
  chatBody: {
    padding: '1rem', minHeight: '360px', display: 'flex',
    flexDirection: 'column', gap: '0.75rem', overflowY: 'auto',
  },
  chatMsg: {
    padding: '0.7rem 1rem', color: '#e2e8f0', fontSize: '0.85rem',
    lineHeight: '1.5', maxWidth: '82%',
  },
  typing: { color: '#6D2EFF', letterSpacing: '3px', animation: 'blink 1s infinite' },
  chatSideStats: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)',
    borderRadius: '18px', padding: '1.5rem',
  },
  chatSideTitle: { color: '#fff', fontWeight: '700', marginBottom: '1.25rem', fontSize: '1rem' },
  sideStatRow: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 0', borderBottom: '1px solid rgba(109,46,255,0.08)',
    fontSize: '0.88rem',
  },
  sideStatLabel: { color: '#718096', flex: 1 },
  sideStatValue: { color: '#a78bfa', fontWeight: '600' },
  capGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem',
  },
  capCard: {
    background: 'rgba(13,10,30,0.6)', border: '1px solid rgba(109,46,255,0.12)',
    borderRadius: '14px', padding: '1.5rem',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  capIcon: {
    fontSize: '1.8rem', width: '44px', height: '44px',
    background: 'rgba(109,46,255,0.1)', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1rem',
  },
  capTitle: { color: '#fff', fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' },
  capDesc: { color: '#718096', fontSize: '0.88rem', lineHeight: '1.6' },
  ctaSection: {
    position: 'relative', padding: '100px 2rem',
    background: 'rgba(109,46,255,0.05)', overflow: 'hidden',
    borderTop: '1px solid rgba(109,46,255,0.12)',
  },
  ctaGlow: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    width: '600px', height: '400px',
    background: 'radial-gradient(ellipse, rgba(109,46,255,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '800',
    color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em',
  },
  ctaDesc: { color: '#a0aec0', fontSize: '1rem', marginBottom: '2rem' },
};
