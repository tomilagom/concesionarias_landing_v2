import React from 'react';
import { MessageCircle, Cloud, ShoppingCart, Car, Search, BookOpen, Zap, Key, Target, Diamond, BarChart3, Briefcase, Mail, Plug, Globe } from 'lucide-react';

const row1 = [
  { name: 'WhatsApp Business', icon: MessageCircle, color: '#25d366' },
  { name: 'HubSpot', icon: Globe, color: '#ff7a59' },
  { name: 'Salesforce', icon: Cloud, color: '#00a1e0' },
  { name: 'Mercado Libre Autos', icon: ShoppingCart, color: '#d4b800' },
  { name: 'OLX Autos', icon: Car, color: '#00a650' },
  { name: 'Google Ads', icon: Search, color: '#4285f4' },
  { name: 'Meta Ads', icon: BookOpen, color: '#1877f2' },
  { name: 'Zapier', icon: Zap, color: '#ff4a00' },
];

const row2 = [
  { name: 'Kavak', icon: Key, color: '#e91e63' },
  { name: 'Pipedrive', icon: Target, color: '#00b3a4' },
  { name: 'Zoho CRM', icon: Diamond, color: '#e42527' },
  { name: 'Google Analytics', icon: BarChart3, color: '#e37400' },
  { name: 'Slack', icon: Briefcase, color: '#4a154b' },
  { name: 'ActiveCampaign', icon: Mail, color: '#356ae6' },
  { name: 'Autocosmos', icon: Car, color: '#c0392b' },
  { name: 'iCarros', icon: Plug, color: '#2980b9' },
];

function IntegrationChip({ name, icon: Icon, color }) {
  return (
    <div style={styles.chip}>
      <Icon size={16} color={color} strokeWidth={1.5} />
      <span style={styles.chipName}>{name}</span>
    </div>
  );
}

export default function Integrations() {
  return (
    <section style={styles.section} id="integrations">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>INTEGRACIONES</span>
          <h2 style={styles.title}>
            Conecta con los portales y herramientas
            <br /><span style={styles.highlight}>que ya usas hoy</span>
          </h2>
          <p style={styles.subtitle}>
            Portales automotrices, CRMs y plataformas de pauta. Todo conectado, sin código.
          </p>
        </div>
      </div>

      <div style={styles.marqueeWrapper}>
        <div style={styles.fadeLeft} />
        <div style={styles.fadeRight} />
        <div style={styles.marqueeTrack}>
          <div style={{ ...styles.marqueeRow, animation: 'marquee 28s linear infinite' }}>
            {[...row1, ...row1].map((int, i) => <IntegrationChip key={i} name={int.name} icon={int.icon} color={int.color} />)}
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div style={styles.marqueeTrack}>
            <div style={{ ...styles.marqueeRow, animation: 'marqueeReverse 28s linear infinite' }}>
              {[...row2, ...row2].map((int, i) => <IntegrationChip key={i} name={int.name} icon={int.icon} color={int.color} />)}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <p style={styles.more}>
          + muchos más portales y CRMs automotrices.{' '}
          <span style={styles.moreLink}>Ver todas las integraciones →</span>
        </p>
      </div>

      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes marqueeReverse { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
      `}</style>
    </section>
  );
}

const styles = {
  section: {
    padding: '100px 0',
    background: 'linear-gradient(180deg, #0A0818 0%, #05040A 100%)',
    overflow: 'hidden',
  },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' },
  header: { textAlign: 'center', marginBottom: '3.5rem' },
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
  marqueeWrapper: { position: 'relative', marginBottom: '2rem' },
  fadeLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '140px',
    background: 'linear-gradient(to right, #0A0818, transparent)', zIndex: 2, pointerEvents: 'none',
  },
  fadeRight: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '140px',
    background: 'linear-gradient(to left, #0A0818, transparent)', zIndex: 2, pointerEvents: 'none',
  },
  marqueeTrack: { overflow: 'hidden', width: '100vw', position: 'relative', left: '50%', transform: 'translateX(-50%)' },
  marqueeRow: { display: 'flex', gap: '1rem', width: 'max-content', padding: '0.25rem 0' },
  chip: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: 'rgba(13,10,30,0.85)', border: '1px solid rgba(109,46,255,0.18)',
    borderRadius: '100px', padding: '0.6rem 1.2rem', whiteSpace: 'nowrap', flexShrink: 0,
  },
  chipEmoji: { fontSize: '1.1rem' },
  chipName: { color: '#e2e8f0', fontSize: '0.88rem', fontWeight: '500' },
  more: { textAlign: 'center', color: '#718096', fontSize: '0.9rem', marginTop: '1rem' },
  moreLink: { color: '#6D2EFF', cursor: 'pointer', fontWeight: '500' },
};
