import React, { useEffect, useState } from 'react';
import { Zap, Target, TrendingUp, Bot, Link2, Shield } from 'lucide-react';

const WA_URL = 'https://wa.me/19205414464';

const benefits = [
  {
    icon: Zap,
    title: 'Respuesta en menos de 5 segundos',
    desc: 'Tu asistente IA responde a cada consulta de auto al instante, las 24 horas. Ningún prospecto se va sin respuesta.',
  },
  {
    icon: Target,
    title: 'Solo pagas por leads calificados',
    desc: 'El modelo de ConcesionarIA está alineado con tus resultados: pagas únicamente por los prospectos que cumplen tus criterios de compra.',
  },
  {
    icon: TrendingUp,
    title: '5.2% vs 0.3% de conversión',
    desc: 'El chat convierte 17 veces más que los formularios web clásicos. Más leads capturados con el mismo presupuesto de pauta.',
  },
  {
    icon: Bot,
    title: 'IA entrenada en ventas automotrices',
    desc: 'No es un chatbot genérico. Conoce modelos, versiones, financiación y planes de entrega. Habla como un vendedor experto.',
  },
  {
    icon: Link2,
    title: '+25 integraciones automotrices',
    desc: 'Conecta con Mercado Libre Autos, OLX, Kavak, tu CRM y portales de leads sin escribir código.',
  },
  {
    icon: Shield,
    title: 'Seguridad y privacidad',
    desc: 'Datos cifrados en tránsito y en reposo. Cumplimiento LGPD/GDPR. La información de tus clientes siempre protegida.',
  },
];

export default function Benefits() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <section style={styles.section} id="benefits">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>¿POR QUÉ CONCESIONARIA?</span>
          <h2 style={styles.title}>
            Construido para equipos de ventas
            <br />
            <span style={styles.highlight}>que quieren resultados reales</span>
          </h2>
        </div>

        <div style={styles.grid}>
          {benefits.map((b, i) => (
            <div
              key={i}
              style={styles.card}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(109,46,255,0.35)';
                e.currentTarget.style.background = 'rgba(109,46,255,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(109,46,255,0.12)';
                e.currentTarget.style.background = 'rgba(13,10,30,0.5)';
              }}
            >
              <div style={styles.iconWrap}><b.icon size={22} color="#a78bfa" strokeWidth={1.5} /></div>
              <div>
                <h3 style={styles.cardTitle}>{b.title}</h3>
                <p style={styles.cardDesc}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div style={styles.banner} className="banner-flex">
          <div style={styles.bannerGlow} />
          <div style={styles.bannerContent}>
            <h3 style={styles.bannerTitle}>¿Listo para vender más autos?</h3>
            <p style={styles.bannerDesc}>
              Únete a +300 concesionarias que ya calificaron más de 1,000,000 de leads con ConcesionarIA.
            </p>
            <div style={styles.bannerBtns}>
              <button style={styles.bannerBtn} onClick={() => window.open(WA_URL, '_blank')}>Solicitar demo →</button>
              <span style={styles.bannerPowered}>
                powered by <span style={styles.hyppo}>Hyppo</span>
              </span>
            </div>
          </div>
          <div style={styles.bannerStats}>
            {[
              { value: stats?.clients || '300+', label: 'Concesionarias activas' },
              { value: stats?.satisfaction || '98%', label: 'Satisfacción' },
              { value: '9.4x', label: 'ROI promedio en pauta' },
            ].map((s, i) => (
              <div key={i} style={styles.bannerStat}>
                <div style={styles.bannerStatValue}>{s.value}</div>
                <div style={styles.bannerStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '100px 2rem',
    background: 'linear-gradient(180deg, #0A0818 0%, #05040A 100%)',
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '3.5rem' },
  eyebrow: {
    color: '#6D2EFF', fontSize: '0.75rem', fontWeight: '700',
    letterSpacing: '0.12em', display: 'block', marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800',
    color: '#fff', lineHeight: '1.2', letterSpacing: '-0.02em',
  },
  highlight: {
    background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem', marginBottom: '3rem',
  },
  card: {
    background: 'rgba(13,10,30,0.5)', border: '1px solid rgba(109,46,255,0.12)',
    borderRadius: '14px', padding: '1.5rem',
    display: 'flex', alignItems: 'flex-start', gap: '1rem',
    transition: 'border-color 0.2s, background 0.2s', cursor: 'default',
  },
  iconWrap: {
    fontSize: '1.6rem', flexShrink: 0, width: '44px', height: '44px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(109,46,255,0.1)', borderRadius: '10px',
  },
  cardTitle: { color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.4rem' },
  cardDesc: { color: '#718096', fontSize: '0.88rem', lineHeight: '1.6' },
  banner: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(109,46,255,0.18) 0%, rgba(75,0,130,0.1) 100%)',
    border: '1px solid rgba(109,46,255,0.35)',
    borderRadius: '20px', padding: '2.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '2rem', overflow: 'hidden',
  },
  bannerGlow: {
    position: 'absolute', top: '-80px', left: '-80px', width: '250px', height: '250px',
    background: 'radial-gradient(circle, rgba(109,46,255,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bannerContent: { flex: 1, minWidth: '240px', position: 'relative' },
  bannerTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' },
  bannerDesc: { color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' },
  bannerBtns: { display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' },
  bannerBtn: {
    background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)',
    border: 'none', color: '#fff', padding: '0.8rem 1.8rem',
    borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(109,46,255,0.4)',
  },
  bannerPowered: { color: '#4a5568', fontSize: '0.82rem' },
  hyppo: { color: '#FF6A00', fontWeight: '700' },
  bannerStats: { display: 'flex', gap: '2rem', flexWrap: 'wrap', position: 'relative' },
  bannerStat: { textAlign: 'center' },
  bannerStatValue: { color: '#6D2EFF', fontSize: '2rem', fontWeight: '800', lineHeight: 1, marginBottom: '0.25rem' },
  bannerStatLabel: { color: '#718096', fontSize: '0.78rem' },
};
