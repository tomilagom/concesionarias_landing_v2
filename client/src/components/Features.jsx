import React from 'react';
import { Car, RefreshCw, BarChart3 } from 'lucide-react';

const WA_URL = 'https://wa.me/19205414464';

const features = [
  {
    icon: Car,
    title: 'Calificación de compradores de autos',
    description:
      'La IA detecta el modelo, presupuesto, financiación y urgencia de cada prospecto en tiempo real. Solo los leads listos para comprar llegan a tu equipo de ventas.',
    tag: 'CALIFICACIÓN IA',
    color: '#6D2EFF',
  },
  {
    icon: RefreshCw,
    title: 'Seguimiento automatizado',
    description:
      'Recordatorios de test drive, seguimiento post-visita y reactivación de leads fríos por WhatsApp. Sin trabajo manual para el vendedor.',
    tag: 'CICLO DE VIDA',
    color: '#FF6A00',
  },
  {
    icon: BarChart3,
    title: 'Atribución automotriz',
    description:
      'Conecta tus portales (Mercado Libre Autos, OLX, Kavak), Meta Ads y Google. Sabe exactamente qué fuente genera los mejores compradores.',
    tag: 'ATRIBUCIÓN',
    color: '#9B59FF',
  },
];

export default function Features() {
  return (
    <section style={styles.section} id="features">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>PRODUCTO</span>
          <h2 style={styles.title}>
            Todo lo que tu concesionaria necesita
            <br /><span style={styles.highlight}>para vender más autos</span>
          </h2>
          <p style={styles.subtitle}>
            Una plataforma completa que cubre desde el primer mensaje hasta la firma del contrato.
          </p>
        </div>

        <div style={styles.grid}>
          {features.map((feat, i) => (
            <div
              key={i}
              style={styles.card}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${feat.color}55`;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${feat.color}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(109,46,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.iconBox, background: `${feat.color}18`, border: `1px solid ${feat.color}30` }}>
                <feat.icon size={26} color={feat.color} strokeWidth={1.5} />
              </div>
              <span style={{ ...styles.tag, color: feat.color, background: `${feat.color}15` }}>
                {feat.tag}
              </span>
              <h3 style={styles.cardTitle}>{feat.title}</h3>
              <p style={styles.cardDesc}>{feat.description}</p>
              <button style={{ ...styles.learnMore, color: feat.color }} onClick={() => window.open(WA_URL, '_blank')}>Ver más →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '100px 2rem',
    background: 'linear-gradient(180deg, #05040A 0%, #0A0818 100%)',
  },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '4rem' },
  eyebrow: {
    color: '#6D2EFF', fontSize: '0.75rem', fontWeight: '700',
    letterSpacing: '0.12em', display: 'block', marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800',
    color: '#fff', lineHeight: '1.2', marginBottom: '1rem', letterSpacing: '-0.02em',
  },
  highlight: {
    background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  subtitle: {
    color: '#a0aec0', fontSize: '1rem', maxWidth: '520px',
    margin: '0 auto', lineHeight: '1.7',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem',
  },
  card: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)',
    borderRadius: '18px', padding: '2rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
    cursor: 'default',
  },
  iconBox: {
    width: '52px', height: '52px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: '1.6rem' },
  tag: {
    display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '100px',
    fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', width: 'fit-content',
  },
  cardTitle: { color: '#fff', fontSize: '1.1rem', fontWeight: '700' },
  cardDesc: { color: '#718096', fontSize: '0.9rem', lineHeight: '1.7', flex: 1 },
  learnMore: {
    background: 'none', border: 'none', fontSize: '0.88rem',
    fontWeight: '600', padding: 0, cursor: 'pointer', textAlign: 'left',
  },
};
