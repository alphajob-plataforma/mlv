'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Componentes UI
import JobCard from '@/components/ui/JobCard'; 
import Modal from '@/components/ui/Modal'; // <--- Importamos Modal
import JobDetailContent from '@/components/jobs/JobDetailContent'; // <--- Importamos Contenido del Modal

import styles from './freelancer.module.css';

export default function FreelancerDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null); // Estado para el modal
  
  // Estado para el perfil real
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS (Perfil y Jobs)
  useEffect(() => {
    const loadDashboardData = async () => {
      const supabase = createClient();

      // A. Verificar Sesión
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // B. Cargar Perfil del Freelancer
      // Hacemos JOIN con job_titles para saber el nombre del rol
      // Y JOIN con skills (esto depende de tu estructura exacta, aquí asumo una relación simple)
      const { data: profile, error: profileError } = await supabase
        .from('freelancers')
        .select(`
          *,
          job_titles ( name )
        `)
        .eq('id', user.id)
        .single();

      if (profile) {
        // Formateamos los datos para la vista
        setFreelancer({
          name: `${profile.first_name} ${profile.last_name}`,
          initials: `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`,
          role: profile.job_titles?.name || 'Rol no definido',
          completed: profile.jobs_completed_count || 0,
          rating: profile.rating_avg || 0,
          // Si tienes skills cacheados o en otra tabla, ajústalo aquí. 
          // Por ahora uso un fallback visual si no hay skills.
          skills: profile.custom_skills || ['React', 'Figma', 'Prototyping'] 
        });
      }

      // C. Cargar Feed de Trabajos
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select(`*, companies (id, commercial_name, logo_url), job_titles(name, category)`)
        .eq('status', 'open')
        .limit(5); // Solo los 5 más recientes
      
      if (jobsData) setJobs(jobsData);
      
      setLoading(false);
    };

    loadDashboardData();
  }, [router]);

  // Si está cargando, mostramos un esqueleto simple o spinner
  if (loading) {
    return (
      <div className={styles.dashboardGrid}>
        <div style={{color: '#fff', padding: '2rem'}}>Cargando tu dashboard...</div>
      </div>
    );
  }

  // Si no hay perfil de freelancer (ej. es una cuenta nueva sin setup), mostramos fallback
  const userDisplay = freelancer || {
    name: "Usuario Nuevo",
    initials: "UN",
    role: "Completa tu perfil",
    completed: 0,
    rating: 0,
    skills: []
  };

  return (
    <>
      <div className={styles.dashboardGrid}>
        
        {/* --- COLUMNA 1: RESUMEN PERFIL --- */}
        <aside className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarLarge}>
                {userDisplay.initials}
              </div>
              <div>
                <h2 className={styles.userName}>{userDisplay.name}</h2>
                <p className={styles.userRole}>{userDisplay.role}</p>
              </div>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{userDisplay.completed}</span>
                <span className={styles.statLabel}>Proyectos</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{userDisplay.rating}</span>
                <span className={styles.statLabel}>Rating</span>
              </div>
            </div>

            <div className={styles.divider}></div>
            
            <div className={styles.menuList}>
              <div className={styles.menuItem}>
                <span className="material-symbols-outlined">person</span>
                <span>Editar Perfil</span>
              </div>
              <div className={styles.menuItem}>
                <span className="material-symbols-outlined">settings</span>
                <span>Configuración</span>
              </div>
            </div>
          </div>

          {/* Habilidades rápidas */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Mis Habilidades</h3>
            <div className={styles.tags}>
              {userDisplay.skills.length > 0 ? (
                userDisplay.skills.map((skill, index) => (
                  <span key={index} className={styles.tag}>{skill}</span>
                ))
              ) : (
                <span style={{color: '#666', fontSize: '0.8rem'}}>Sin habilidades registradas</span>
              )}
            </div>
          </div>
        </aside>

        {/* --- COLUMNA 2: FEED PRINCIPAL --- */}
        <section className={styles.mainCol}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.pageTitle}>Proyectos para ti</h1>
            <button className={styles.iconButton}>
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>

          <div className={styles.feed}>
            {jobs.map(job => (
              // AL HACER CLICK: Seteamos el job seleccionado para abrir el modal
              <div key={job.id} onClick={() => setSelectedJob(job)} style={{cursor: 'pointer'}}>
                  <JobCard job={job} />
              </div>
            ))}
            {jobs.length === 0 && <p className={styles.loading}>Buscando proyectos compatibles...</p>}
          </div>
        </section>

        {/* --- COLUMNA 3: WIDGETS --- */}
        <aside className={styles.rightCol}>
          {/* Actividad */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Actividad Reciente</h3>
            <ul className={styles.activityList}>
              <li className={styles.activityItem}>
                <span className={`material-symbols-outlined ${styles.iconSuccess}`}>check_circle</span>
                <div className={styles.activityText}>
                  <p>Bienvenido a <strong>Chambexy</strong></p>
                  <small>Hace un momento</small>
                </div>
              </li>
              {/* Aquí podrías mapear notificaciones reales en el futuro */}
            </ul>
          </div>

          {/* Red Sugerida (Estática por ahora) */}
          
        </aside>

      </div>

      {/* --- MODAL DE DETALLE DEL TRABAJO --- */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)}>
          {selectedJob && <JobDetailContent job={selectedJob} onClose={() => setSelectedJob(null)} />}
      </Modal>
    </>
  );
}