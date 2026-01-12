import { 
  Briefcase, X, MapPin, Clock, Building2, 
  DollarSign, Calendar, CheckCircle2, 
  Send, Bookmark, Star 
} from 'lucide-react';
import styles from './JobDetail.module.css';

export default function JobDetailContent({ job, onClose }) {
  if (!job) return null;

  // Fallbacks para datos opcionales
  const requirements = job.requirements || [];
  const benefits = job.benefits || []; // Nuevo campo
  const skills = job.job_skills || [];
  const rating = job.companies?.average_rating || 4.8; // Nuevo campo (default simulado)
  const companyDesc = job.companies?.description || 'Empresa líder en su sector comprometida con la innovación tecnológica.';

  return (
    <div className={styles.container}>
      
      {/* 1. Header Fijo Superior */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>Detalle de la Oferta</h2>
            <p className={styles.headerSubtitle}>
              Publicado {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
      </div>

      {/* 2. Contenido Scrolleable */}
      <div className={styles.scrollContent}>
        
        {/* Título y Meta */}
        <div>
          <h1 className={styles.mainTitle}>{job.title}</h1>
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <Building2 size={18} className="text-beige"/>
              <span>{job.companies?.commercial_name}</span>
            </div>
            <div className={styles.metaItem}>
              <MapPin size={18} />
              <span>{job.companies?.city_id ? 'Remoto' : 'Global'}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock size={18} />
              <span>{job.employment_type || 'Tiempo Completo'}</span>
            </div>
          </div>
        </div>

        {/* Cajas de Estadísticas (Grid) */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <DollarSign size={24} />
            </div>
            <div>
              <p className={styles.statLabel}>Presupuesto</p>
              <p className={styles.statValue}>
                ${job.budget_min} - ${job.budget_max} 
                <span className={styles.statSub}> / mes</span>
              </p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={24} />
            </div>
            <div>
              <p className={styles.statLabel}>Duración</p>
              <p className={styles.statValue}>
                {job.duration || 'Indefinida'} 
                <span className={styles.statSub}> est.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h3 className={styles.sectionTitle}>Descripción del Proyecto</h3>
          <p className={styles.textBody}>{job.description}</p>
        </div>

        {/* Requisitos */}
        {requirements.length > 0 && (
          <div>
            <h3 className={styles.sectionTitle}>Requisitos</h3>
            <div className={styles.listGrid}>
              {requirements.map((req, i) => (
                <div key={i} className={styles.listItem}>
                  <CheckCircle2 size={20} color="var(--brand-mint)" style={{minWidth: '20px'}} />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tecnologías */}
        <div>
          <h3 className={styles.sectionTitle}>Tecnologías clave</h3>
          <div className={styles.tagsContainer}>
            {skills.map((skill, i) => (
               <span key={i} className={styles.tag}>
                 {skill.skills?.name || skill.name}
               </span>
            ))}
          </div>
        </div>

        {/* Beneficios (Nuevo) */}
        {benefits.length > 0 && (
          <div>
            <h3 className={styles.sectionTitle}>Beneficios</h3>
            <div className={styles.listGrid}>
              {benefits.map((ben, i) => (
                <div key={i} className={styles.listItem}>
                  {/* Punto verde simulado con div */}
                  <div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-mint)', marginTop: 6}} />
                  <span>{ben}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sobre la Empresa */}
        <div className={styles.companyCard}>
          <p className={styles.statLabel} style={{marginBottom: '0.5rem'}}>Sobre la empresa</p>
          <div className={styles.companyHeader}>
             <p className={styles.textBody} style={{maxWidth: '600px', fontSize: '0.9rem'}}>
               {companyDesc}
             </p>
             <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div className={styles.stars}>
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" opacity={0.5} />
                </div>
                <span style={{fontWeight: 'bold'}}>{rating}</span>
             </div>
          </div>
        </div>

      </div>

      {/* 3. Footer Fijo Inferior */}
      <div className={styles.footer}>
        <button className={styles.btnApply}>
          <Send size={20} />
          Aplicar ahora
        </button>
        <button className={styles.btnSave}>
          <Bookmark size={20} />
          Guardar para más tarde
        </button>
      </div>

    </div>
  );
}