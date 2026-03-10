import React, { useState } from 'react';
import Footer from '../components/Footer';
import { Users, Car, Gift } from 'lucide-react';

const WA_URL = 'https://wa.me/19205414464';

const plans = [
  {
    name: 'Gold',
    subtitle: 'Eficiencia Inicial',
    price: '$750',
    period: 'USD / mes',
    implementation: '$1,500',
    conversations: '3,000',
    extraConv: '$0.25',
    users: '5 vendedores',
    extraUser: '$25 / mes',
    highlight: false,
    color: '#6D2EFF',
    target: 'Ideal para concesionarias individuales con 5–10 vendedores.',
    features: [
      'Agente IA conversacional 24/7',
      'Calificación automática de leads',
      'Integración WhatsApp Business',
      'Dashboard BI básico (Looker Studio)',
      'Integraciones estándar (Sheets, Zapier)',
      'Seguimiento automatizado de leads',
      'Soporte técnico por email',
    ],
    notIncluded: ['Integración ERP/SAP/Dynamics', 'Supervisor IA avanzado', 'Equipo de Growth dedicado'],
  },
  {
    name: 'Platinum',
    subtitle: 'Optimizador de Conversión',
    price: '$2,750',
    period: 'USD / mes',
    implementation: '$3,500',
    conversations: '3,000',
    extraConv: '$0.20',
    users: '10 vendedores',
    extraUser: '$15–20 / mes',
    highlight: true,
    color: '#FF6A00',
    tag: 'MÁS POPULAR',
    target: 'Para concesionarias grandes o grupos pequeños (10–25 vendedores).',
    features: [
      'Todo lo del Plan Gold',
      'Supervisor IA avanzado (Anti-Ghosting Engine)',
      'Integración profunda ERP/SAP/Dynamics/Pilot',
      'Lead Health Score en tiempo real',
      'Automatizaciones personalizadas (Customer.io)',
      'Dashboard BI avanzado y personalizable',
      'Equipo de Growth consultivo',
      'Soporte prioritario + Account Manager',
    ],
    notIncluded: ['Equipo Dev dedicado', 'Instancia IA custom'],
  },
  {
    name: 'Enterprise',
    subtitle: 'Solución Grupal Total',
    price: 'Desde $5,000',
    period: 'USD / mes',
    implementation: 'Custom',
    conversations: '25,000',
    extraConv: '$0.15',
    users: '50+ vendedores',
    extraUser: 'A consultar',
    highlight: false,
    color: '#00C1D5',
    target: 'Para grupos regionales o importadoras con 50+ vendedores.',
    features: [
      'Todo lo del Plan Platinum',
      'Instancia IA dedicada y personalizada',
      'Equipo Dev/Growth dedicado 24/7',
      'Dashboard multi-marca unificado',
      'Integración full custom (ERP + VMS + CRM)',
      'Control Tower para CEO de grupo',
      'SLA garantizado por contrato',
      'Onboarding 14 días garantizado',
    ],
    notIncluded: [],
  },
];

const comparisons = [
  { feature: 'Agente IA 24/7', gold: true, platinum: true, enterprise: true },
  { feature: 'Conversaciones incluidas', gold: '3,000', platinum: '3,000', enterprise: '25,000' },
  { feature: 'Vendedores incluidos', gold: '5', platinum: '10', enterprise: '50+' },
  { feature: 'Supervisor IA (Anti-Ghosting)', gold: false, platinum: true, enterprise: 'Dedicado' },
  { feature: 'Lead Health Score', gold: 'Básico', platinum: true, enterprise: true },
  { feature: 'Integración ERP/SAP', gold: false, platinum: true, enterprise: 'Full Custom' },
  { feature: 'Dashboard BI', gold: 'Básico', platinum: 'Avanzado', enterprise: 'Custom' },
  { feature: 'Equipo Growth', gold: false, platinum: 'Consultivo', enterprise: 'Dedicado' },
  { feature: 'Multi-marca', gold: false, platinum: false, enterprise: true },
];

function ROICalculator() {
  const [leads, setLeads] = useState(1000);
  const [profit, setProfit] = useState(1800);
  const [rate, setRate] = useState(2);

  const currentSales = Math.round((leads * rate) / 100);
  const improvedRate = rate * 1.25;
  const newSales = Math.round((leads * improvedRate) / 100);
  const extraSales = newSales - currentSales;
  const extraRevenue = extraSales * profit;
  const cost = leads >= 3000 ? 2750 : 750;
  const net = extraRevenue - cost;
  const roiX = cost > 0 ? (net / cost).toFixed(1) : 0;

  return (
    <div style={calcStyles.wrapper} className="roi-calc-grid">
      <div style={calcStyles.inputs}>
        <h3 style={calcStyles.calcTitle}>Calculadora de ROI</h3>
        <p style={calcStyles.calcDesc}>Completá los datos de tu concesionaria para ver tu ROI estimado.</p>
        {[
          { label: 'Leads digitales por mes', value: leads, set: setLeads, min: 100, max: 10000, step: 100, format: v => v.toLocaleString() },
          { label: 'Ganancia promedio por auto (USD)', value: profit, set: setProfit, min: 500, max: 5000, step: 100, format: v => `$${v.toLocaleString()}` },
          { label: 'Tasa de cierre actual (%)', value: rate, set: setRate, min: 0.5, max: 15, step: 0.5, format: v => `${v}%` },
        ].map((field, i) => (
          <div key={i} style={calcStyles.fieldGroup}>
            <div style={calcStyles.fieldHeader}>
              <label style={calcStyles.label}>{field.label}</label>
              <span style={calcStyles.fieldValue}>{field.format(field.value)}</span>
            </div>
            <input
              type="range"
              min={field.min} max={field.max} step={field.step}
              value={field.value}
              onChange={e => field.set(Number(e.target.value))}
              style={calcStyles.slider}
            />
          </div>
        ))}
      </div>

      <div style={calcStyles.results}>
        <h3 style={calcStyles.resultsTitle}>Tu ROI estimado con ConcesionarIA</h3>
        <div style={calcStyles.bigNumber}>
          <span style={calcStyles.roiValue}>{roiX}x</span>
          <span style={calcStyles.roiLabel}>ROI mensual</span>
        </div>
        <div style={calcStyles.resultGrid}>
          {[
            { label: 'Ventas actuales / mes', value: `${currentSales} autos`, color: '#718096' },
            { label: 'Ventas con IA / mes', value: `${newSales} autos`, color: '#10b981' },
            { label: 'Autos adicionales', value: `+${extraSales} autos`, color: '#6D2EFF' },
            { label: 'Ingreso adicional', value: `+$${extraRevenue.toLocaleString()}`, color: '#FF6A00' },
            { label: `Plan sugerido (${leads >= 3000 ? 'Platinum' : 'Gold'})`, value: `$${cost.toLocaleString()}/mes`, color: '#a0aec0' },
            { label: 'Ganancia neta', value: `$${net.toLocaleString()}`, color: net > 0 ? '#10b981' : '#ef4444' },
          ].map((r, i) => (
            <div key={i} style={calcStyles.resultRow}>
              <span style={calcStyles.resultLabel}>{r.label}</span>
              <span style={{ ...calcStyles.resultValue, color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
        <p style={calcStyles.disclaimer}>
          * Estimación basada en una reducción promedio de 25% en pérdida de leads.
          Resultados reales pueden variar.
        </p>
        <button style={calcStyles.ctaBtn} onClick={() => window.open(WA_URL, '_blank')}>
          Solicitar demo con este análisis →
        </button>
      </div>
    </div>
  );
}

export default function Precios() {
  return (
    <>
      <div style={styles.page}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.container}>
            <span style={styles.eyebrow}>PRECIOS</span>
            <h1 style={styles.heroTitle}>
              Precios alineados<br />
              a tus <span style={styles.violet}>resultados</span>
            </h1>
            <p style={styles.heroDesc}>
              Empezá en $750 USD/mes. Un auto adicional por mes ya cubre el costo del sistema.
              Primer adopters: <strong style={{ color: '#FF6A00' }}>50% off en la implementación</strong> para las primeras 10 concesionarias.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.plansGrid} className="plans-grid">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.planCard,
                    borderColor: plan.highlight ? plan.color : `${plan.color}25`,
                    boxShadow: plan.highlight ? `0 0 0 1px ${plan.color}50, 0 20px 60px rgba(255,106,0,0.15)` : 'none',
                  }}
                >
                  {plan.highlight && <div style={{ ...styles.popularBadge, background: plan.color }}>{plan.tag}</div>}
                  <div style={styles.planHeader}>
                    <h2 style={{ ...styles.planName, color: plan.color }}>{plan.name}</h2>
                    <p style={styles.planSubtitle}>{plan.subtitle}</p>
                    <div style={styles.planPrice}>
                      <span style={styles.priceValue}>{plan.price}</span>
                      <span style={styles.pricePeriod}>{plan.period}</span>
                    </div>
                    <div style={styles.planImpl}>
                      Implementación: <strong style={{ color: '#fff' }}>{plan.implementation}</strong>
                      {plan.implementation !== 'Custom' && <span style={styles.earlyBadge}> → $750 early adopter</span>}
                    </div>
                  </div>

                  <div style={styles.planMeta}>
                    {[
                      { label: 'Conversaciones', val: plan.conversations },
                      { label: 'Conversación extra', val: plan.extraConv },
                      { label: 'Usuarios incluidos', val: plan.users },
                      { label: 'Usuario adicional', val: plan.extraUser },
                    ].map((m, j) => (
                      <div key={j} style={styles.planMetaRow}>
                        <span style={styles.metaLabel}>{m.label}</span>
                        <span style={{ ...styles.metaVal, color: plan.color }}>{m.val}</span>
                      </div>
                    ))}
                  </div>

                  <p style={styles.planTarget}>{plan.target}</p>

                  <ul style={styles.featureList}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={styles.featureItem}>
                        <span style={{ color: plan.color }}>✓</span> {f}
                      </li>
                    ))}
                    {plan.notIncluded.map((f, j) => (
                      <li key={j} style={{ ...styles.featureItem, opacity: 0.35 }}>
                        <span style={{ color: '#718096' }}>✗</span> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    style={{ ...styles.planBtn, background: plan.highlight ? plan.color : 'transparent', borderColor: plan.color, color: plan.highlight ? '#fff' : plan.color }}
                    onClick={() => window.open(WA_URL, '_blank')}
                  >
                    Empezar con {plan.name} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ ...styles.section, paddingTop: 0 }}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Comparativa de <span style={styles.violet}>planes</span></h2>
            </div>
            <div style={styles.tableWrap} className="precios-table-wrap">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, textAlign: 'left', width: '40%' }}>Característica</th>
                    <th style={{ ...styles.th, color: '#6D2EFF' }}>Gold</th>
                    <th style={{ ...styles.th, color: '#FF6A00' }}>Platinum</th>
                    <th style={{ ...styles.th, color: '#00C1D5' }}>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(109,46,255,0.03)' : 'transparent' }}>
                      <td style={styles.tdLabel}>{row.feature}</td>
                      {[row.gold, row.platinum, row.enterprise].map((val, j) => (
                        <td key={j} style={styles.td}>
                          {val === true ? <span style={{ color: '#10b981', fontSize: '1.1rem' }}>✓</span>
                            : val === false ? <span style={{ color: '#4a5568', fontSize: '1rem' }}>—</span>
                              : <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>{val}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section style={{ ...styles.section, background: 'rgba(109,46,255,0.04)', borderTop: '1px solid rgba(109,46,255,0.1)' }}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>CALCULADORA</span>
              <h2 style={styles.sectionTitle}>¿Cuánto ganarías con <span style={styles.violet}>ConcesionarIA</span>?</h2>
            </div>
            <ROICalculator />
          </div>
        </section>

        {/* Math section */}
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <span style={styles.eyebrow}>LA MATEMÁTICA</span>
              <h2 style={styles.sectionTitle}>Un auto más por mes <span style={styles.orange}>lo paga todo</span></h2>
            </div>
            <div style={styles.mathGrid} className="math-grid">
              {[
                { title: 'vs. BDC Humano', icon: Users, lines: ['4–5 calificadores humanos = ~$4,000/mes', 'Plan Platinum = $750 base + $500 extra leads', 'Ahorro mensual: ~$2,750 USD', '100% trazabilidad incluida'] },
                { title: 'El ROI de 1 auto', icon: Car, lines: ['Ganancia bruta promedio por auto: $1,500–$2,500', 'Plan Gold: $750/mes', 'Con 1 auto adicional = sistema pagado', 'ConcesionarIA reduce leakage ~25%'] },
                { title: 'Descuento Early Adopter', icon: Gift, lines: ['50% off en la implementación', 'Para las primeras 10 concesionarias en Argentina', 'Gold: $750 → $375 (implementación)', 'Platinum: $3,500 → $1,750 (implementación)'] },
              ].map((m, i) => (
                <div key={i} style={styles.mathCard}>
                  <div style={styles.mathIcon}><m.icon size={28} color="#6D2EFF" strokeWidth={1.5} /></div>
                  <h3 style={styles.mathTitle}>{m.title}</h3>
                  <ul style={styles.mathList}>
                    {m.lines.map((l, j) => (
                      <li key={j} style={styles.mathLine}><span style={{ color: '#6D2EFF' }}>→</span> {l}</li>
                    ))}
                  </ul>
                </div>
              ))}
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
  orange: { color: '#FF6A00' },
  heroDesc: { color: '#a0aec0', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.7' },
  section: { padding: '80px 2rem' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionTitle: { fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '800', color: '#fff', lineHeight: '1.2', marginBottom: '0.75rem', letterSpacing: '-0.02em' },
  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' },
  planCard: {
    background: 'rgba(13,10,30,0.85)', border: '1px solid',
    borderRadius: '20px', padding: '2rem', position: 'relative',
    display: 'flex', flexDirection: 'column', gap: '1.25rem',
  },
  popularBadge: {
    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
    color: '#fff', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em',
    padding: '0.3rem 1rem', borderRadius: '100px',
  },
  planHeader: {},
  planName: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.2rem' },
  planSubtitle: { color: '#718096', fontSize: '0.88rem', marginBottom: '1rem' },
  planPrice: { display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' },
  priceValue: { color: '#fff', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' },
  pricePeriod: { color: '#4a5568', fontSize: '0.88rem' },
  planImpl: { color: '#4a5568', fontSize: '0.82rem' },
  earlyBadge: { color: '#FF6A00', fontWeight: '600' },
  planMeta: {
    background: 'rgba(5,4,10,0.6)', borderRadius: '10px', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  planMetaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' },
  metaLabel: { color: '#718096' },
  metaVal: { fontWeight: '600' },
  planTarget: { color: '#a0aec0', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: '1.5' },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 },
  featureItem: { color: '#a0aec0', fontSize: '0.88rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', lineHeight: '1.5' },
  planBtn: {
    border: '1px solid', padding: '0.85rem 1.5rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s',
    marginTop: 'auto',
  },
  tableWrap: { overflowX: 'auto', borderRadius: '14px', border: '1px solid rgba(109,46,255,0.15)' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(13,10,30,0.7)' },
  th: { padding: '1rem', color: '#fff', fontWeight: '700', fontSize: '0.9rem', borderBottom: '1px solid rgba(109,46,255,0.15)', textAlign: 'center' },
  td: { padding: '0.85rem 1rem', textAlign: 'center', borderBottom: '1px solid rgba(109,46,255,0.06)' },
  tdLabel: { padding: '0.85rem 1rem', color: '#a0aec0', fontSize: '0.88rem', borderBottom: '1px solid rgba(109,46,255,0.06)' },
  mathGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  mathCard: { background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)', borderRadius: '16px', padding: '1.75rem' },
  mathIcon: { fontSize: '2rem', marginBottom: '1rem' },
  mathTitle: { color: '#fff', fontWeight: '700', fontSize: '1.05rem', marginBottom: '1rem' },
  mathList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  mathLine: { color: '#a0aec0', fontSize: '0.88rem', display: 'flex', gap: '0.5rem', lineHeight: '1.5' },
};

const calcStyles = {
  wrapper: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem',
    maxWidth: '960px', margin: '0 auto',
  },
  inputs: {
    background: 'rgba(13,10,30,0.8)', border: '1px solid rgba(109,46,255,0.2)',
    borderRadius: '18px', padding: '2rem',
  },
  calcTitle: { color: '#fff', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' },
  calcDesc: { color: '#718096', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: '1.5' },
  fieldGroup: { marginBottom: '1.5rem' },
  fieldHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  label: { color: '#a0aec0', fontSize: '0.88rem' },
  fieldValue: { color: '#6D2EFF', fontWeight: '700', fontSize: '0.9rem' },
  slider: { width: '100%', accentColor: '#6D2EFF', cursor: 'pointer' },
  results: {
    background: 'rgba(13,10,30,0.8)', border: '1px solid rgba(109,46,255,0.3)',
    borderRadius: '18px', padding: '2rem',
    boxShadow: '0 0 0 1px rgba(109,46,255,0.1)',
  },
  resultsTitle: { color: '#fff', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem' },
  bigNumber: { textAlign: 'center', marginBottom: '1.5rem', padding: '1.5rem 0', borderTop: '1px solid rgba(109,46,255,0.1)', borderBottom: '1px solid rgba(109,46,255,0.1)' },
  roiValue: { display: 'block', fontSize: '4rem', fontWeight: '800', color: '#6D2EFF', lineHeight: 1 },
  roiLabel: { color: '#718096', fontSize: '0.88rem', marginTop: '0.25rem', display: 'block' },
  resultGrid: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '1rem' },
  resultRow: { display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid rgba(109,46,255,0.07)', fontSize: '0.88rem' },
  resultLabel: { color: '#718096' },
  resultValue: { fontWeight: '700' },
  disclaimer: { color: '#4a5568', fontSize: '0.75rem', marginBottom: '1.25rem', lineHeight: '1.5' },
  ctaBtn: {
    width: '100%', background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)',
    border: 'none', color: '#fff', padding: '0.9rem', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(109,46,255,0.35)',
  },
};
