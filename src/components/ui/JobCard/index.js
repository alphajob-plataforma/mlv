'use client';

import { Briefcase, MapPin, Paintbrush } from 'lucide-react'; 
import styles from './JobCard.module.css';

/**
 * Recibimos una nueva prop: "onClick"
 */
export default function JobCard({ job, onClick }) { // <--- Agregamos onClick aquí
  
  // Datos de seguridad...
  const title = job.title || 'Sin título';
  const companyName = job.companies?.commercial_name || 'Empresa Confidencial';
  const location = job.companies?.company_direccion?.[0]?.departments?.name || 'Remoto';
  const description = job.description || '';
  const budget = job.budget_max ? `$${job.budget_max}` : 'A convenir';
  const skills = job.job_skills || []; 

  return (
    <article className={styles.card}>
      {/* ... (Todo el código del logo y contenido se mantiene IGUAL) ... */}
      
      <div className={styles.logoContainer}>
         <div className={styles.logoBox}>
             {job.companies?.logo_url ? (
                 <img src={job.companies.logo_url} alt="logo" className={styles.logoImage}/>
             ) : <Paintbrush size={24}/>}
         </div>
      </div>

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
         <p className={styles.description}>{description}</p>
         <div className={styles.tags}>
            {skills.map((item, index) => (
                <span key={index} className={styles.tag}>
                   {item.skills?.name || item.name || 'Skill'}
                </span>
            ))}
         </div>
      </div>

      {/* ACCIONES */}
      <div className={styles.actions}>
        <div className={styles.priceContainer}>
          <span className={styles.price}>{budget}</span>
          <span className={styles.priceLabel}>Precio fijo</span>
        </div>
        
        {/* CAMBIO AQUÍ: El botón ahora ejecuta el onClick que abre el modal */}
        <button 
            onClick={onClick} // <--- Ejecuta la función del padre
            className={styles.button}
            style={{cursor: 'pointer'}}
        >
          Ver Oferta
        </button>
      </div>
    </article>
  );
}