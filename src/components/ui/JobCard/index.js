import Link from 'next/link';
import { Briefcase, MapPin, Paintbrush } from 'lucide-react'; 
import styles from './JobCard.module.css';

/**
 * Componente Tarjeta de Trabajo
 * @param {Object} job - Objeto con la estructura de la tabla job_postings + relaciones
 */
export default function JobCard({ job }) {
  // Datos de seguridad por si algún campo viene vacío de la DB
  const title = job.title || 'Sin título';
  const companyName = job.companies?.commercial_name || 'Empresa Confidencial';
  const location = job.companies?.city_id ? 'Remoto / Híbrido' : 'Remoto'; // Aquí podrías hacer un lookup de ciudades
  const description = job.description || '';
  const budget = job.budget_max ? `$${job.budget_max}` : 'A convenir';
  const currency = job.currency || 'USD';
  
  // Si no hay skills, mostramos un array vacío
  const skills = job.job_skills || []; 

  return (
    <article className={styles.card}>
      {/* Columna Izquierda: Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoBox}>
          {job.companies?.logo_url ? (
            <img 
              src={job.companies.logo_url} 
              alt={`Logo de ${companyName}`} 
              className={styles.logoImage} 
            />
          ) : (
            // Icono por defecto (Pincel como en tu referencia o Maletín)
            <Paintbrush size={24} />
          )}
        </div>
      </div>

      {/* Columna Central: Info */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <div className={styles.meta}>
            <span>{companyName}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {location}
            </span>
          </div>
        </div>

        <p className={styles.description}>
          {description}
        </p>

        <div className={styles.tags}>
          {skills.map((item, index) => (
            <span key={index} className={styles.tag}>
              {/* Dependiendo de cómo hagas el join, el nombre puede estar en item.skills.name o item.name */}
              {item.skills?.name || item.name || 'Skill'}
            </span>
          ))}
          {/* Tags de ejemplo estáticos si no hay datos para visualizar el diseño */}
          {skills.length === 0 && (
            <>
              <span className={styles.tag}>Diseño Gráfico</span>
              <span className={styles.tag}>Branding</span>
            </>
          )}
        </div>
      </div>

      {/* Columna Derecha: Precio y Acción */}
      <div className={styles.actions}>
        <div className={styles.priceContainer}>
          <span className={styles.price}>{budget}</span>
          <span className={styles.priceLabel}>Precio fijo</span>
        </div>
        
        <Link href={`/jobs/${job.id}`} className={styles.button}>
          Ver Oferta
        </Link>
      </div>
    </article>
  );
}