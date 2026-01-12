import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './page.module.css'; // Importamos los estilos convertidos

export default function Home() {
  
  // Mapeo: { NombreVisual, IconoMaterial, ValorEnBD }
  const categories = [
    { name: 'Desarrollo', icon: 'code', dbValue: 'Tecnología' },
    { name: 'Diseño', icon: 'palette', dbValue: 'Diseño' },
    { name: 'Marketing', icon: 'trending_up', dbValue: 'Marketing' },
    { name: 'Redacción', icon: 'edit_note', dbValue: 'Marketing' }, 
    { name: 'Datos', icon: 'analytics', dbValue: 'Data Science' }, // Según tu script SQL
    { name: 'Audiovisual', icon: 'movie', dbValue: 'Audiovisual' }, 
  ];

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      <main>
        {/* --- HERO SECTION --- */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              El mercado de talento para las mentes más brillantes
            </h1>
            <p className={styles.heroText}>
              Encuentra los mejores proyectos globales o contrata expertos verificados para escalar tu visión. Calidad y seguridad en cada paso.
            </p>
            <div className={styles.heroButtons}>
              {/* Login */}
              <Link href="/login" className={styles.btnPrimary}>
                Empezar ahora
              </Link>
              
              {/* Ver proyectos (Sin filtro) */}
              <Link href="/jobs" className={styles.btnSecondary}>
                Ver proyectos
              </Link>
            </div>
          </div>
          
          <div className={styles.heroImageContainer}>
            <div className={styles.heroGlow}></div>
            {/* Placeholder de imagen similar a tu diseño */}
            <div className={styles.heroImage} style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                 <img 
                   src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
                   alt="Equipo trabajando" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                 />
            </div>
          </div>
        </section>

        {/* --- CATEGORÍAS --- */}
        <section className={styles.categoriesSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleDecoration}></span>
              Busca por categoría
            </h2>
            <div className={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Link 
                  key={cat.name} 
                  href={`/jobs?category=${encodeURIComponent(cat.dbValue)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className={styles.categoryCard}>
                    <span className={`material-symbols-outlined ${styles.categoryIcon}`}>
                      {cat.icon}
                    </span>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- CÓMO FUNCIONA --- */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.centeredTitle}>¿Cómo funciona?</h2>
            <div className={styles.stepsGrid}>
              
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>Crea tu perfil</h3>
                <p className={styles.stepDesc}>Muestra tu portafolio, habilidades y experiencia para destacar ante las empresas.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>Encuentra proyectos</h3>
                <p className={styles.stepDesc}>Postúlate a ofertas que encajen con tu perfil o recibe invitaciones directas.</p>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>Recibe pagos seguros</h3>
                <p className={styles.stepDesc}>Trabaja con tranquilidad gracias a nuestro sistema de pagos protegidos.</p>
              </div>

            </div>
          </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className={styles.ctaSection}>
          <div className={styles.sectionContent}>
            <div className={styles.ctaContainer}>
              <div className={styles.ctaGlow}></div>
              <h2 className={styles.ctaTitle}>Impulsa tu negocio con los mejores</h2>
              <p className={styles.ctaText}>
                Accede a una red global de expertos listos para integrarse en tu equipo y llevar tus proyectos al siguiente nivel.
              </p>
              <Link href="/login" className={styles.ctaButton}>
                Publicar una oferta
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}