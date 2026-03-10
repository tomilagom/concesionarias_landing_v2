import React from 'react';
import Footer from '../components/Footer';
import { Frown, Clock, PhoneOff, Banknote, Building2, Key, Building, User, Megaphone, Trophy, AlertCircle, Sparkles, Globe } from 'lucide-react';

const WA_URL = 'https://wa.me/19205414464';

const problems = [
  { icon: Frown, stat: '27%', label: 'de leads digitales reciben seguimiento efectivo en concesionarias tradicionales.' },
  { icon: Clock, stat: '40%', label: 'de los leads se pierden por tiempos de respuesta superiores a 30 minutos.' },
  { icon: PhoneOff, stat: '70%', label: 'de las ventas no tienen trazabilidad a la fuente del lead original.' },
  { icon: Banknote, stat: '3.000', label: 'leads/mes que un equipo humano no puede gestionar correctamente sin herramientas de IA.' },
];

const dealerTypes = [
  {
    icon: Building2,
    title: 'Franquicias 0km',
    desc: 'Toyota, Ford, VW, Nissan y todas las grandes marcas. Automatizá la calificación de leads de Meta Ads y Google con IA entrenada en tu catálogo.',
    benefits: ['Integración con DMS/VMS', 'Catálogo de modelos y versiones', 'Test drive automatizado'],
    color: '#6D2EFF',
  },
  {
    icon: Key,
    title: 'Usados y Multimarca',
    desc: 'Alta rotación de stock y múltiples fuentes de leads (Mercado Libre, OLX, Kavak). ConcesionarIA unifica todo en un solo flujo automatizado.',
    benefits: ['Multi-portal integrado', 'Gestión de permuta con IA', 'Re-enganche de leads fríos'],
    color: '#FF6A00',
  },
  {
    icon: Building,
    title: 'Grupos Automotrices',
    desc: 'Múltiples marcas y sucursales bajo un mismo grupo. Dashboard unificado con visibilidad total de cada vendedor en cada marca.',
    benefits: ['Dashboard multi-marca', 'Seller Leaderboard grupal', 'Integración SAP / Dynamics'],
    color: '#00C1D5',
  },
];

const testimonials = [
  {
    quote: 'La solución nos permitió transformar WhatsApp — nuestro canal más caótico — en la fuente de datos más valiosa del negocio. Por primera vez, los gerentes tienen visibilidad real del funnel y los vendedores compiten por responder primero.',
    author: 'Gerente',
    role: 'Gerente',
    company: 'Grupo Garden',
    market: 'Paraguay',
    flagIcon: Globe,
  },
  {
    quote: 'Antes perdíamos leads todos los días porque nadie sabía qué había pasado con el cliente después del primer WhatsApp. Ahora cada conversación queda registrada, asignada y con seguimiento automático. Subimos el cierre en menos de un mes.',
    author: 'Gerente',
    role: 'Gerente',
    company: 'Nissan Paraguay',
    market: 'Paraguay',
    flagIcon: Globe,
  },
  {
    quote: 'El equipo de vendedores ahora llega a cada cliente ya calificado. La IA filtra, responde y agenda — nosotros cerramos. Es la primera vez que siento que tenemos un proceso de ventas de verdad por WhatsApp.',
    author: 'Gerente',
    role: 'Gerente',
    company: 'Fiat',
    market: '',
    flagIcon: Globe,
  },
];

const personas = [
  {
    icon: User,
    title: 'El CEO/Dueño',
    pain: '"Gasto $5,000/mes en publicidad y no sé cuántos autos vendo gracias a eso."',
    gain: 'ROI exacto por canal. Dashboard en tiempo real. Un auto más por mes paga todo el sistema.',
    color: '#6D2EFF',
  },
  {
    icon: Megaphone,
    title: 'El Marketing Manager',
    pain: '"Genero 3,000 leads por mes pero el equipo de ventas dice que son de baja calidad."',
    gain: 'Atribución multicanal. Solo leads calificados llegan a ventas. Optimización automática de pauta.',
    color: '#FF6A00',
  },
  {
    icon: Trophy,
    title: 'El Gerente de Ventas',
    pain: '"No sé qué hace mi equipo con los leads. La mitad ni los carga en el CRM."',
    gain: 'Anti-Ghosting Engine. Reasignación automática. Seller leaderboard en vivo.',
    color: '#00C1D5',
  },
];

export default function Concesionarias() {
  return (
    <>
      <div style={styles.page}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.container}>
            <span style={styles.eyebrow}>CONCESIONARIAS</span>
            <h1 style={styles.heroTitle}>
              Construido exclusivamente<br />
              para <span style={styles.violet}>vender autos</span>
            </h1>
            <p style={styles.heroDesc}>
              ConcesionarIA no es un chatbot genérico. Es la única solución que combina un
              Agente IA (que califica), un Supervisor IA (que monitorea humanos) y
              Trazabilidad Total (del clic a la factura) 100% enfocado en el sector automotriz.
            </p>
            <button style={styles.primaryBtn} onClick={() => window.open(WA_URL, '_blank')}>
              Hablar con un especialista →
            </button>
          </div>
        </section>

        {/* Problems */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>EL PROBLEMA</span>
              <h2 style={styles.sectionTitle}>La industria automotriz tiene un <span style={styles.orange}>problema digital</span></h2>
              <p style={styles.sectionDesc}>Los datos del mercado LATAM hablan solos.</p>
            </div>
            <div style={styles.problemsGrid} className="problems-grid">
              {problems.map((p, i) => (
                <div key={i} style={styles.problemCard}>
                  <div style={styles.problemIcon}><p.icon size={32} color="#FF6A00" strokeWidth={1.5} /></div>
                  <div style={styles.problemStat}>{p.stat}</div>
                  <p style={styles.problemLabel}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dealer Types */}
        <section style={{ ...styles.section, background: 'rgba(109,46,255,0.03)' }}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>SOLUCIONES POR TIPO</span>
              <h2 style={styles.sectionTitle}>Para cada tipo de <span style={styles.violet}>concesionaria</span></h2>
            </div>
            <div style={styles.dealerGrid}>
              {dealerTypes.map((d, i) => (
                <div key={i} style={{ ...styles.dealerCard, borderColor: `${d.color}25` }}>
                  <div style={{ ...styles.dealerIconWrap, background: `${d.color}15` }}>
                    <d.icon size={24} color={d.color} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ ...styles.dealerTitle, color: d.color }}>{d.title}</h3>
                  <p style={styles.dealerDesc}>{d.desc}</p>
                  <ul style={styles.dealerBenefits}>
                    {d.benefits.map((b, j) => (
                      <li key={j} style={styles.dealerBenefit}>
                        <span style={{ color: d.color }}>✓</span> {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    style={{ ...styles.dealerBtn, color: d.color, borderColor: `${d.color}40` }}
                    onClick={() => window.open(WA_URL, '_blank')}
                  >
                    Ver demo para {d.title} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buyer Personas */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>PARA CADA ROL</span>
              <h2 style={styles.sectionTitle}>¿Quién se beneficia de <span style={styles.violet}>ConcesionarIA</span>?</h2>
            </div>
            <div style={styles.personasGrid} className="personas-grid">
              {personas.map((p, i) => (
                <div key={i} style={styles.personaCard}>
                  <div style={{ ...styles.personaIconWrap, background: `${p.color}15` }}>
                    <p.icon size={24} color={p.color} strokeWidth={1.5} />
                  </div>
                  <h3 style={styles.personaTitle}>{p.title}</h3>
                  <div style={styles.personaPain}>
                    <span style={styles.painLabel}><AlertCircle size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Dolor actual</span>
                    <p style={styles.painText}>{p.pain}</p>
                  </div>
                  <div style={styles.personaGain}>
                    <span style={{ ...styles.gainLabel, color: p.color }}><Sparkles size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Con ConcesionarIA</span>
                    <p style={styles.gainText}>{p.gain}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ ...styles.section, background: 'rgba(109,46,255,0.04)', borderTop: '1px solid rgba(109,46,255,0.1)' }}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>CASOS DE ÉXITO</span>
              <h2 style={styles.sectionTitle}>Concesionarias que ya <span style={styles.violet}>transformaron</span> su proceso</h2>
            </div>
            <div style={styles.testimonialsGrid}>
              {testimonials.map((t, i) => (
                <div key={i} style={styles.testimonialCard}>
                  <div style={styles.quoteChar}>"</div>
                  <p style={styles.quoteText}>{t.quote}</p>
                  <div style={styles.testimonialMeta}>
                    <div style={styles.testimonialAvatar}><t.flagIcon size={20} color="#6D2EFF" strokeWidth={1.5} /></div>
                    <div>
                      <div style={styles.testimonialName}>{t.role} · {t.company}</div>
                      {t.market && <div style={styles.testimonialMarket}>{t.market}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaGlow} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <h2 style={styles.ctaTitle}>¿Tu concesionaria está lista para el siguiente nivel?</h2>
            <p style={styles.ctaDesc}>Demo gratuita · Implementación en 14 días · Sin contrato largo plazo</p>
            <div className="cta-btns-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={styles.primaryBtn} onClick={() => window.open(WA_URL, '_blank')}>Agendar demo por WhatsApp →</button>
              <button style={styles.ghostBtn} onClick={() => window.open(WA_URL, '_blank')}>Ver precios</button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  page: { background: '#05040A', minHeight: '100vh', paddingTop: '70px' },
  hero: { position: 'relative', padding: '80px 2rem 100px', overflow: 'hidden', textAlign: 'center' },
  heroBg: {
    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
    width: '800px', height: '800px',
    background: 'radial-gradient(circle, rgba(109,46,255,0.18) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  container: { maxWidth: '1100px', margin: '0 auto', position: 'relative' },
  eyebrow: { color: '#6D2EFF', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', display: 'block', marginBottom: '1rem' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', color: '#fff', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-0.03em' },
  violet: { background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  orange: { color: '#FF6A00' },
  heroDesc: { color: '#a0aec0', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: '1.7' },
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
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionTitle: { fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '800', color: '#fff', lineHeight: '1.2', marginBottom: '0.75rem', letterSpacing: '-0.02em' },
  sectionDesc: { color: '#a0aec0', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' },
  problemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  problemCard: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)',
    borderRadius: '16px', padding: '2rem', textAlign: 'center',
  },
  problemIcon: { fontSize: '2rem', marginBottom: '1rem' },
  problemStat: { fontSize: '2.8rem', fontWeight: '800', color: '#FF6A00', lineHeight: 1, marginBottom: '0.5rem' },
  problemLabel: { color: '#718096', fontSize: '0.88rem', lineHeight: '1.6' },
  dealerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  dealerCard: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid',
    borderRadius: '18px', padding: '2rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  dealerIconWrap: { width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dealerIcon: { fontSize: '1.5rem' },
  dealerTitle: { fontSize: '1.2rem', fontWeight: '800' },
  dealerDesc: { color: '#718096', fontSize: '0.9rem', lineHeight: '1.6' },
  dealerBenefits: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  dealerBenefit: { color: '#a0aec0', fontSize: '0.88rem' },
  dealerBtn: {
    background: 'none', border: '1px solid', padding: '0.6rem 1rem',
    borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer',
    transition: 'background 0.2s', marginTop: 'auto',
  },
  personasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  personaCard: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)',
    borderRadius: '18px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
  },
  personaIconWrap: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  personaIcon: { fontSize: '1.5rem' },
  personaTitle: { color: '#fff', fontSize: '1.1rem', fontWeight: '700' },
  personaPain: { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '1rem' },
  painLabel: { color: '#ef4444', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' },
  painText: { color: '#a0aec0', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: '1.5' },
  personaGain: { background: 'rgba(109,46,255,0.06)', border: '1px solid rgba(109,46,255,0.15)', borderRadius: '10px', padding: '1rem' },
  gainLabel: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' },
  gainText: { color: '#a0aec0', fontSize: '0.88rem', lineHeight: '1.5' },
  testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  testimonialCard: {
    background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.2)',
    borderRadius: '18px', padding: '2rem',
  },
  quoteChar: { fontSize: '3rem', color: '#6D2EFF', lineHeight: 1, fontFamily: 'Georgia, serif', marginBottom: '0.5rem' },
  quoteText: { color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '1.5rem' },
  testimonialMeta: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  testimonialAvatar: { fontSize: '1.8rem', width: '42px', height: '42px', background: 'rgba(109,46,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  testimonialName: { color: '#fff', fontWeight: '700', fontSize: '0.9rem' },
  testimonialRole: { color: '#718096', fontSize: '0.8rem' },
  testimonialMarket: { color: '#6D2EFF', fontSize: '0.78rem', fontWeight: '600', marginTop: '0.15rem' },
  ctaSection: { position: 'relative', padding: '100px 2rem', borderTop: '1px solid rgba(109,46,255,0.12)', overflow: 'hidden' },
  ctaGlow: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    width: '600px', height: '400px',
    background: 'radial-gradient(ellipse, rgba(109,46,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaTitle: { fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  ctaDesc: { color: '#a0aec0', fontSize: '1rem', marginBottom: '2rem' },
};
