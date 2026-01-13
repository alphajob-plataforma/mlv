'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, Building2, ChevronLeft, 
    CheckCircle2, Globe, Calendar, Zap, Loader2, Check 
} from 'lucide-react';

import styles from './JobDetailFull.module.css';

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient(); // Instanciamos aquí para usar en todo el componente

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // --- NUEVOS ESTADOS PARA LA POSTULACIÓN ---
    const [applying, setApplying] = useState(false); // Cargando al aplicar
    const [hasApplied, setHasApplied] = useState(false); // ¿Ya postuló?

    // 1. CARGAR DATOS DEL TRABAJO Y VERIFICAR POSTULACIÓN
    useEffect(() => {
        const fetchData = async () => {
            // A. Obtener Usuario Actual
            const { data: { user } } = await supabase.auth.getUser();

            // B. Cargar el Trabajo
            const { data: jobData, error } = await supabase
                .from('job_postings')
                .select(`
                    *,
                    companies (
                        id, commercial_name, logo_url, description, website,
                        company_direccion ( departments ( name ) )
                    ),
                    job_titles ( name, category ),
                    job_skills ( skills ( name ) )
                `)
                .eq('id', id)
                .single();

            if (!error && jobData) {
                setJob(jobData);
                
                // C. Verificar si este usuario YA postuló a este trabajo
                if (user) {
                    const { data: existingApplication } = await supabase
                        .from('job_applications')
                        .select('id')
                        .eq('job_id', id)
                        .eq('freelancer_id', user.id)
                        .maybeSingle(); // Usamos maybeSingle para que no de error si no hay nada

                    if (existingApplication) {
                        setHasApplied(true);
                    }
                }
            }
            setLoading(false);
        };

        if (id) fetchData();
    }, [id]);

    // --- FUNCIÓN PARA APLICAR (POSTULAR) ---
    const handleApply = async () => {
        setApplying(true);
        
        try {
            // 1. Verificar Sesión
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/login?next=/freelancer/jobs/${id}`);
                return;
            }

            // 2. Insertar en la tabla 'job_applications'
            const { error } = await supabase
                .from('job_applications')
                .insert({
                    job_id: job.id,
                    freelancer_id: user.id,
                    status: 'pending', // Estado inicial
                    cover_letter: 'Postulación directa desde la plataforma.', // Texto por defecto (luego haremos un form)
                    bid_amount: job.budget_min || 0, // Monto por defecto
                });

            if (error) throw error;

            // 3. Éxito
            setHasApplied(true);
            alert("¡Postulación enviada exitosamente!"); // Puedes cambiar esto por un Toast más bonito

        } catch (error) {
            console.error('Error al postular:', error.message);
            alert("Error al postular: " + error.message);
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className={styles.centerMsg}>Cargando experiencia...</div>;
    if (!job) return <div className={styles.centerMsg}>Oferta no encontrada</div>;

    // --- DATOS MAPEAODOS ---
    const companyName = job.companies?.commercial_name || 'Empresa Confidencial';
    const logoUrl = job.companies?.logo_url;
    const location = job.companies?.company_direccion?.[0]?.departments?.name || 'Remoto';
    const postedDate = new Date(job.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const skills = job.job_skills?.map(js => js.skills?.name).filter(Boolean) || [];
    const requirements = job.requirements || [];
    const benefits = job.benefits || [];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                
                {/* Botón Volver */}
                <button onClick={() => router.back()} className={styles.backLink}>
                    <ChevronLeft size={16} /> Volver al listado
                </button>

                <div className={styles.gridContainer}>
                    
                    {/* --- COLUMNA IZQUIERDA --- */}
                    <div className={styles.mainContent}>
                        <div className={styles.card}>
                            <div className={styles.headerTop}>
                                <div className={styles.logoBox}>
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={companyName} className={styles.logoImg} />
                                    ) : (
                                        <Building2 size={32} color="#7ADCB7" />
                                    )}
                                </div>
                                <div>
                                    <h1 className={styles.jobTitle}>{job.title}</h1>
                                    <div className={styles.metaList}>
                                        <span className={styles.metaItem}><Building2 size={16}/> {companyName}</span>
                                        <span className={styles.metaItem}><MapPin size={16}/> {location}</span>
                                        <span className={styles.metaItem}><Calendar size={16}/> {postedDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.badgeRow}>
                                <span className={`${styles.badge} ${styles.badgeMint}`}>
                                    {job.job_titles?.category || 'Tecnología'}
                                </span>
                                <span className={`${styles.badge} ${styles.badgeOutline}`}>
                                    {job.employment_type}
                                </span>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle}>Descripción del Proyecto</h3>
                            <div className={styles.textBody}>
                                {job.description}
                            </div>

                            {requirements.length > 0 && (
                                <>
                                    <h3 className={styles.sectionTitle}>
                                        <CheckCircle2 size={20} color="#7ADCB7"/> Requisitos del Candidato
                                    </h3>
                                    <ul className={styles.list}>
                                        {requirements.map((req, i) => (
                                            <li key={i} className={styles.listItem}>
                                                <CheckCircle2 size={18} color="#7ADCB7" style={{marginTop:4, flexShrink:0}}/>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                             {benefits.length > 0 && (
                                <>
                                    <h3 className={styles.sectionTitle}>
                                        <Zap size={20} color="#7ADCB7"/> Beneficios y Perks
                                    </h3>
                                    <ul className={styles.list}>
                                        {benefits.map((ben, i) => (
                                            <li key={i} className={styles.listItem}>
                                                <CheckCircle2 size={18} color="#7ADCB7" style={{marginTop:4, flexShrink:0}}/>
                                                {ben}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- COLUMNA DERECHA (Sidebar con Botón Funcional) --- */}
                    <aside className={styles.sidebar}>
                        
                        <div className={styles.card}>
                            {/* --- BOTÓN APLICAR CONECTADO --- */}
                            <button 
                                className={styles.applyBtn} 
                                onClick={handleApply}
                                disabled={applying || hasApplied}
                                style={{
                                    opacity: (applying || hasApplied) ? 0.7 : 1,
                                    cursor: (applying || hasApplied) ? 'not-allowed' : 'pointer',
                                    backgroundColor: hasApplied ? '#2a2e2e' : '#7ADCB7',
                                    color: hasApplied ? '#fff' : '#131616'
                                }}
                            >
                                {applying ? (
                                    <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                        <Loader2 className="animate-spin" size={20} /> Enviando...
                                    </span>
                                ) : hasApplied ? (
                                    <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                                        <Check size={20} /> Ya has postulado
                                    </span>
                                ) : (
                                    "Aplicar Ahora"
                                )}
                            </button>
                            
                            <button className={styles.saveBtn}>Guardar para después</button>
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle} style={{fontSize:'1.1rem'}}>Detalles del Empleo</h3>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Presupuesto</span>
                                <span className={styles.detailValue}>
                                    {job.budget_min ? `$${job.budget_min} - $${job.budget_max}` : 'A convenir'}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Experiencia</span>
                                <span className={styles.detailValue}>{job.experience || 'N/A'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Modalidad</span>
                                <span className={styles.detailValue}>{job.work_mode || 'Remoto'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Duración</span>
                                <span className={styles.detailValue}>{job.duration}</span>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle} style={{fontSize:'1.1rem'}}>Sobre la Empresa</h3>
                            <p style={{color:'#AFA595', fontSize:'0.9rem', lineHeight:'1.6'}}>
                                {job.companies?.description || 'Empresa verificada de nuestra red.'}
                            </p>
                            {job.companies?.website && (
                                <div className={styles.clientSection}>
                                    <a href={job.companies.website} target="_blank" className={styles.clientLink}>
                                        <Globe size={14}/> Visitar sitio web
                                    </a>
                                </div>
                            )}
                        </div>

                    </aside>

                </div>
            </div>
        </div>
    );
}