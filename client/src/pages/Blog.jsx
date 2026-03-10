import React, { useState } from 'react';
import Footer from '../components/Footer';

const WA_URL = 'https://wa.me/19205414464';

const categories = ['Todos', 'Ventas', 'IA & Tecnología', 'Marketing', 'Casos de Éxito', 'Industria'];

const posts = [
  {
    category: 'Ventas',
    tag: 'VENTAS',
    color: '#6D2EFF',
    title: 'La muerte del vendedor de autos tradicional (y el nacimiento del AI Sales Orchestrator)',
    excerpt: 'El 73% de los compradores de autos en LATAM hacen su primera consulta por WhatsApp. Pero el 40% se va sin respuesta. Descubrí cómo la IA cambia este paradigma para siempre.',
    author: 'Andrés García Skinner',
    role: 'Co-founder, Hyppo',
    date: 'Mar 2, 2026',
    readTime: '8 min',
    featured: true,
  },
  {
    category: 'Casos de Éxito',
    tag: 'CASO DE ÉXITO',
    color: '#10b981',
    title: 'Grupo Garden: cómo capturaron el 40% del mercado 0km en Paraguay con IA',
    excerpt: 'El grupo automotriz más grande de Paraguay implementó ConcesionarIA y transformó completamente su proceso de ventas digitales. Resultados reales en 12 meses.',
    author: 'Nicolás Lew Deveali',
    role: 'Co-founder, Hyppo',
    date: 'Feb 28, 2026',
    readTime: '10 min',
    featured: false,
  },
  {
    category: 'Marketing',
    tag: 'MARKETING',
    color: '#FF6A00',
    title: 'Cómo saber qué campaña de Meta realmente generó ventas (no solo leads)',
    excerpt: 'El "WhatsApp Black Box" le cuesta a los concesionarios miles de dólares en pauta mal optimizada. Así es como la atribución multicanal lo resuelve de una vez.',
    author: 'Tomás Lagomarsino',
    role: 'Growth Lead, Hyppo',
    date: 'Feb 20, 2026',
    readTime: '6 min',
    featured: false,
  },
  {
    category: 'IA & Tecnología',
    tag: 'IA & TECH',
    color: '#00C1D5',
    title: 'Anti-Ghosting Engine: la tecnología que obliga a los vendedores a responder en 30 min',
    excerpt: 'Si tu vendedor no responde en 30 minutos, un lead caliente se convierte en lead frío. Esta es la arquitectura técnica que resuelve el problema más costoso de los concesionarios.',
    author: 'Henry Hosep',
    role: 'Tech Lead, Hyppo',
    date: 'Feb 15, 2026',
    readTime: '9 min',
    featured: false,
  },
  {
    category: 'Industria',
    tag: 'INDUSTRIA',
    color: '#9B59FF',
    title: 'WhatsApp dominó el 90% de las consultas automotrices en Argentina: qué significa esto',
    excerpt: 'Un análisis del comportamiento del comprador de autos en LATAM post-pandemia. Por qué WhatsApp ganó la batalla y qué deben hacer las concesionarias al respecto.',
    author: 'Andrés García Skinner',
    role: 'Co-founder, Hyppo',
    date: 'Feb 10, 2026',
    readTime: '7 min',
    featured: false,
  },
  {
    category: 'Ventas',
    tag: 'VENTAS',
    color: '#6D2EFF',
    title: '15 preguntas que nuestra IA usa para calificar un lead de auto en 5 mensajes',
    excerpt: 'El script exacto de calificación que usa ConcesionarIA para detectar modelo, presupuesto, urgencia y tipo de financiación sin que el lead sienta que está siendo interrogado.',
    author: 'Tomás Lagomarsino',
    role: 'Growth Lead, Hyppo',
    date: 'Feb 5, 2026',
    readTime: '5 min',
    featured: false,
  },
  {
    category: 'Marketing',
    tag: 'MARKETING',
    color: '#FF6A00',
    title: 'Google Ads para concesionarias: la guía de keywords que convierten en LATAM',
    excerpt: 'Las palabras clave de mayor intención de compra para campañas automotrices en Argentina, México y Colombia. Basado en datos reales de 300+ campañas.',
    author: 'Henry Hosep',
    role: 'Tech Lead, Hyppo',
    date: 'Jan 28, 2026',
    readTime: '11 min',
    featured: false,
  },
  {
    category: 'IA & Tecnología',
    tag: 'IA & TECH',
    color: '#00C1D5',
    title: 'Customer.io + Gochat: la arquitectura triple capa que mueve 1M+ leads automotrices',
    excerpt: 'Un deep dive técnico en la infraestructura de ConcesionarIA. Cómo tres herramientas especializadas se convierten en el sistema operativo de ventas más potente del sector.',
    author: 'Andrés García Skinner',
    role: 'Co-founder, Hyppo',
    date: 'Jan 20, 2026',
    readTime: '14 min',
    featured: false,
  },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = filtered.filter(p => p !== featured);

  return (
    <>
      <div style={styles.page}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.container}>
            <span style={styles.eyebrow}>BLOG</span>
            <h1 style={styles.heroTitle}>
              Ideas para vender<br />
              <span style={styles.violet}>más autos con IA</span>
            </h1>
            <p style={styles.heroDesc}>
              Estrategias de ventas, casos de éxito, marketing automotriz y tendencias de IA.
              Todo desde el equipo que construyó ConcesionarIA.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.container}>
            {/* Category filter */}
            <div style={styles.categoryRow} className="category-row">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.catBtn,
                    ...(activeCategory === cat ? styles.catBtnActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured post */}
            {featured && (
              <div style={styles.featuredCard} className="featured-card">
                <div style={styles.featuredContent}>
                  <span style={{ ...styles.postTag, color: featured.color, background: `${featured.color}15` }}>
                    ⭐ {featured.tag}
                  </span>
                  <h2 style={styles.featuredTitle}>{featured.title}</h2>
                  <p style={styles.featuredExcerpt}>{featured.excerpt}</p>
                  <div style={styles.postMeta}>
                    <div style={styles.authorInfo}>
                      <div style={styles.authorAvatar}>✍️</div>
                      <div>
                        <div style={styles.authorName}>{featured.author}</div>
                        <div style={styles.authorRole}>{featured.role}</div>
                      </div>
                    </div>
                    <div style={styles.postDateRow}>
                      <span style={styles.postDate}>{featured.date}</span>
                      <span style={styles.postDivider}>·</span>
                      <span style={styles.postDate}>{featured.readTime} lectura</span>
                    </div>
                  </div>
                  <button style={styles.readBtn} onClick={() => window.open(WA_URL, '_blank')}>
                    Leer artículo →
                  </button>
                </div>
                <div className="featured-visual" style={{ ...styles.featuredVisual, background: `linear-gradient(135deg, ${featured.color}20, ${featured.color}05)`, borderColor: `${featured.color}20` }}>
                  <span style={{ fontSize: '5rem' }}>📰</span>
                </div>
              </div>
            )}

            {/* Post grid */}
            {rest.length > 0 && (
              <div style={styles.postsGrid}>
                {rest.map((post, i) => (
                  <div key={i} style={styles.postCard}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${post.color}40`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(109,46,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <span style={{ ...styles.postTag, color: post.color, background: `${post.color}15` }}>{post.tag}</span>
                    <h3 style={styles.postTitle}>{post.title}</h3>
                    <p style={styles.postExcerpt}>{post.excerpt}</p>
                    <div style={styles.postFooter}>
                      <div>
                        <div style={styles.postAuthor}>{post.author}</div>
                        <div style={styles.postDateSmall}>{post.date} · {post.readTime}</div>
                      </div>
                      <button style={{ ...styles.readSmallBtn, color: post.color }} onClick={() => window.open(WA_URL, '_blank')}>
                        Leer →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section style={styles.newsletterSection}>
          <div style={styles.newsletterGlow} />
          <div style={{ ...styles.container, position: 'relative', textAlign: 'center' }}>
            <span style={styles.eyebrow}>NEWSLETTER</span>
            <h2 style={styles.nlTitle}>Recibí estrategias de ventas<br /><span style={styles.violet}>automotrices con IA</span></h2>
            <p style={styles.nlDesc}>Una vez por semana. Sin spam. Solo contenido accionable para concesionarias.</p>
            <div style={styles.nlForm} className="nl-form">
              <input type="email" placeholder="tu@concesionaria.com" style={styles.nlInput} />
              <button style={styles.nlBtn} onClick={() => window.open(WA_URL, '_blank')}>Suscribirme →</button>
            </div>
            <p style={styles.nlNote}>+1,200 profesionales automotrices ya suscritos</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  page: { background: '#05040A', minHeight: '100vh', paddingTop: '70px' },
  hero: { position: 'relative', padding: '80px 2rem 60px', overflow: 'hidden', textAlign: 'center' },
  heroBg: { position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(109,46,255,0.16) 0%, transparent 65%)', pointerEvents: 'none' },
  container: { maxWidth: '1100px', margin: '0 auto', position: 'relative' },
  eyebrow: { color: '#6D2EFF', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', display: 'block', marginBottom: '1rem' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', color: '#fff', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-0.03em' },
  violet: { background: 'linear-gradient(135deg, #6D2EFF, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroDesc: { color: '#a0aec0', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto', lineHeight: '1.7' },
  section: { padding: '60px 2rem 80px' },
  categoryRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' },
  catBtn: { background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)', color: '#718096', padding: '0.5rem 1.1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  catBtnActive: { background: 'rgba(109,46,255,0.15)', borderColor: '#6D2EFF', color: '#a78bfa' },
  featuredCard: {
    display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem',
    background: 'rgba(13,10,30,0.8)', border: '1px solid rgba(109,46,255,0.2)',
    borderRadius: '20px', padding: '2.5rem', marginBottom: '2rem', alignItems: 'center',
  },
  featuredContent: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  postTag: { display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.08em', width: 'fit-content' },
  featuredTitle: { color: '#fff', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: '800', lineHeight: '1.3', letterSpacing: '-0.02em' },
  featuredExcerpt: { color: '#a0aec0', fontSize: '0.95rem', lineHeight: '1.7' },
  postMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' },
  authorInfo: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  authorAvatar: { width: '36px', height: '36px', background: 'rgba(109,46,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  authorName: { color: '#fff', fontWeight: '600', fontSize: '0.88rem' },
  authorRole: { color: '#4a5568', fontSize: '0.78rem' },
  postDateRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  postDate: { color: '#4a5568', fontSize: '0.82rem' },
  postDivider: { color: '#4a5568' },
  readBtn: { background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', width: 'fit-content', boxShadow: '0 6px 18px rgba(109,46,255,0.35)' },
  featuredVisual: { border: '1px solid', borderRadius: '16px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' },
  postCard: { background: 'rgba(13,10,30,0.7)', border: '1px solid rgba(109,46,255,0.15)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default' },
  postTitle: { color: '#fff', fontWeight: '700', fontSize: '1rem', lineHeight: '1.4' },
  postExcerpt: { color: '#718096', fontSize: '0.88rem', lineHeight: '1.6', flex: 1 },
  postFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid rgba(109,46,255,0.08)' },
  postAuthor: { color: '#a0aec0', fontSize: '0.82rem', fontWeight: '600' },
  postDateSmall: { color: '#4a5568', fontSize: '0.78rem' },
  readSmallBtn: { background: 'none', border: 'none', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', padding: 0 },
  newsletterSection: { position: 'relative', padding: '100px 2rem', background: 'rgba(109,46,255,0.05)', borderTop: '1px solid rgba(109,46,255,0.12)', overflow: 'hidden' },
  newsletterGlow: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(109,46,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  nlTitle: { fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  nlDesc: { color: '#a0aec0', fontSize: '1rem', marginBottom: '2rem' },
  nlForm: { display: 'flex', gap: '0.75rem', maxWidth: '480px', margin: '0 auto 1rem', flexWrap: 'wrap', justifyContent: 'center' },
  nlInput: { flex: 1, minWidth: '240px', background: 'rgba(13,10,30,0.8)', border: '1px solid rgba(109,46,255,0.3)', borderRadius: '10px', padding: '0.85rem 1.25rem', color: '#fff', fontSize: '0.9rem', outline: 'none' },
  nlBtn: { background: 'linear-gradient(135deg, #6D2EFF, #9B59FF)', border: 'none', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 18px rgba(109,46,255,0.35)' },
  nlNote: { color: '#4a5568', fontSize: '0.82rem' },
};
