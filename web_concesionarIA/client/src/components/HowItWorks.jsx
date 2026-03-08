import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Conecta tu concesionaria',
    desc: 'Integra ConcesionarIA con tu web, WhatsApp Business, portales y CRM en menos de 1 hora. Sin desarrollo.',
    icon: '🔌',
  },
  {
    number: '02',
    title: 'Configura tu IA automotriz',
    desc: 'Carga tu catálogo, modelos, precios y criterios de calificación. La IA aprende tu proceso de venta.',
    icon: '⚙️',
  },
  {
    number: '03',
    title: 'Recibe compradores listos',
    desc: 'Los leads calificados llegan directo a tu CRM con su perfil completo: modelo, presupuesto y urgencia.',
    icon: '🚀',
  },
];

export default function HowItWorks() {
  return (
    <section style={styles.section} id="how-it-works">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>CÓMO FUNCIONA</span>
          <h2 style={styles.title}>
            En marcha en <span style={styles.highlight}>menos de 1 hora</span>
          </h2>
          <p style={styles.subtitle}>
            Sin meses de implementación. Sin equipos técnicos. Empieza a recibir leads calificados hoy mismo.
          </p>
        </div>

        <div style={styles.stepsWrapper} className="steps-row">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={styles.step}>
                <div style={styles.stepTop}>
                  <span style={styles.stepNumber}>{step.number}</span>
                  <div style={styles.stepIcon}>{step.icon}</div>
                </div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div style={styles.connector} className="step-connector">
                  <span style={styles.connectorArrow}>→</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Testimonial */}
        <div style={styles.testimonial}>
          <div style={styles.quoteIcon}>"</div>
          <p style={styles.quoteText}>
            Antes perdíamos el 70% de los leads por demora en respuesta. Con ConcesionarIA, nuestra tasa
            de conversión a test drive subió un 340% en el primer mes. El equipo de ventas ahora solo
            habla con prospectos que ya quieren comprar.
          </p>
          <div style={styles.quoteAuthor}>
            <div style={styles.avatar}>👨‍💼</div>
            <div>
              <div style={styles.authorName}>Rodrigo Fernández</div>
              <div style={styles.authorRole}>Gerente Comercial · Grupo Automotriz del Sur</div>
            </div>
          </div>
          <div style={styles.poweredBy}>
            powered by <span style={styles.hyppo}>Hyppo</span>
          </div>
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
  subtitle: { color: '#a0aec0', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' },
  stepsWrapper: {
    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
    marginBottom: '4rem', flexWrap: 'wrap', justifyContent: 'center',
  },
  step: {
    flex: 1, minWidth: '240px', maxWidth: '300px',
    background: 'rgba(13,10,30,0.8)', border: '1px solid rgba(109,46,255,0.2)',
    borderRadius: '18px', padding: '2rem',
    transition: 'border-color 0.2s',
  },
  stepTop: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem',
  },
  stepNumber: { fontSize: '2.5rem', fontWeight: '800', color: 'rgba(109,46,255,0.25)', lineHeight: 1 },
  stepIcon: {
    fontSize: '1.8rem', background: 'rgba(109,46,255,0.12)', borderRadius: '12px',
    width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stepTitle: { color: '#fff', fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem' },
  stepDesc: { color: '#718096', fontSize: '0.88rem', lineHeight: '1.7' },
  connector: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    paddingTop: '3.5rem', minWidth: '30px',
  },
  connectorArrow: { color: 'rgba(109,46,255,0.4)', fontSize: '1.5rem' },
  testimonial: {
    background: 'rgba(109,46,255,0.06)', border: '1px solid rgba(109,46,255,0.2)',
    borderRadius: '18px', padding: '2.5rem', textAlign: 'center',
    maxWidth: '700px', margin: '0 auto',
  },
  quoteIcon: {
    fontSize: '4rem', color: '#6D2EFF', lineHeight: 1,
    fontFamily: 'Georgia, serif', marginBottom: '0.5rem',
  },
  quoteText: {
    color: '#e2e8f0', fontSize: '1rem', lineHeight: '1.7',
    fontStyle: 'italic', marginBottom: '1.5rem',
  },
  quoteAuthor: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', marginBottom: '1rem',
  },
  avatar: {
    fontSize: '1.8rem', background: 'rgba(109,46,255,0.12)', borderRadius: '50%',
    width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  authorName: { color: '#fff', fontWeight: '700', fontSize: '0.95rem' },
  authorRole: { color: '#718096', fontSize: '0.82rem', marginTop: '0.1rem' },
  poweredBy: { color: '#4a5568', fontSize: '0.78rem' },
  hyppo: { color: '#FF6A00', fontWeight: '700' },
};
