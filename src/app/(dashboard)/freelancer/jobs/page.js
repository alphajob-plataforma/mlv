'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Filter, Loader2, Frown } from 'lucide-react';

// --- COMPONENTES ---
import JobCard from '@/components/ui/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import Modal from '@/components/ui/Modal';
import JobDetailContent from '@/components/jobs/JobDetailContent';

// --- IMPORTA EL CSS NUEVO ---
import styles from './jobs.module.css';

export default function FreelancerJobsPage() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q') || '';

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // Filtros
    const [filters, setFilters] = useState({
        categories: [],
        types: [],
        locations: [],
        experience: [],
        budget: null
    });

    // 1. Carga de Datos
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            const supabase = createClient();
            
            // Query robusta a job_postings
            const { data, error } = await supabase
                .from('job_postings')
                .select(`
                    *,
                    companies (
                        id, commercial_name, logo_url,
                        company_direccion ( department_id, departments ( name ) )
                    ),
                    job_titles ( name, category ),
                    job_skills ( skills ( name ) )
                `)
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (!error && data) setJobs(data);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    // Helper: Ubicación
    const getJobLocation = (job) => job.companies?.company_direccion?.[0]?.departments?.name || 'Remoto';

    // 2. Filtrado
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const jobLoc = getJobLocation(job);
            const jobCat = job.job_titles?.category || 'Otros';
            const lowerQuery = queryParam.toLowerCase();

            // Lógica de coincidencia
            const matchSearch = !queryParam || (
                job.title?.toLowerCase().includes(lowerQuery) ||
                job.companies?.commercial_name?.toLowerCase().includes(lowerQuery)
            );
            const matchCat = filters.categories.length === 0 || filters.categories.includes(jobCat);
            const matchType = filters.types.length === 0 || filters.types.includes(job.employment_type);
            const matchLoc = filters.locations.length === 0 || filters.locations.includes(jobLoc);
            const matchExp = !filters.experience || filters.experience.length === 0 || filters.experience.includes(job.experience);
            
            let matchBudget = true;
            if (filters.budget) {
                const max = job.budget_max || 0;
                if (filters.budget === 'low') matchBudget = max <= 1500;
                else if (filters.budget === 'mid') matchBudget = max > 1500 && max <= 3000;
                else if (filters.budget === 'high') matchBudget = max > 3000;
            }

            return matchSearch && matchCat && matchType && matchLoc && matchBudget && matchExp;
        });
    }, [jobs, queryParam, filters]);

    // Datos para el sidebar
    const jobsForFilters = useMemo(() => jobs.map(j => ({
        ...j,
        virtualLocation: getJobLocation(j),
        virtualCategory: j.job_titles?.category || 'Otros'
    })), [jobs]);

    return (
        <div className={styles.pageContainer}>
            
            {/* Cabecera */}
            <header className={styles.headerSection}>
                <div>
                    <h1 className={styles.pageTitle}>
                        {queryParam ? `Resultados para "${queryParam}"` : 'Explorar Vacantes'}
                    </h1>
                    <p className={styles.pageSubtitle}>
                        {loading ? 'Cargando...' : `${filteredJobs.length} oportunidades encontradas`}
                    </p>
                </div>
                
                <button 
                    className={styles.mobileFilterBtn}
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                    <Filter size={18} /> Filtros
                </button>
            </header>

            {/* Layout Grid: Sidebar Izquierda | Contenido Derecha */}
            <div className={styles.layoutGrid}>
                
                {/* 1. SIDEBAR */}
                <aside className={`${styles.sidebar} ${showMobileFilters ? styles.sidebarVisible : ''}`}>
                    <div className={styles.sidebarHeaderMobile}>
                        <h3>Filtros</h3>
                        <button onClick={() => setShowMobileFilters(false)}>Cerrar</button>
                    </div>
                    <JobFilters
                        jobs={jobsForFilters}
                        currentFilters={filters}
                        onFilterChange={setFilters}
                    />
                </aside>

                {/* 2. GRID DE TARJETAS */}
                <main className={styles.jobsGrid}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <Loader2 size={40} className="animate-spin text-mint" />
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            // Wrapper div para el click y el estilo
                            <div 
                                key={job.id} 
                                onClick={() => setSelectedJob(job)} 
                                className={styles.cardWrapper} 
                                style={{cursor: 'pointer'}}
                            >
                                <JobCard job={{ ...job, locationName: getJobLocation(job) }} />
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Frown size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h3>No encontramos resultados</h3>
                            <button 
                                onClick={() => setFilters({ categories: [], types: [], locations: [], experience: [], budget: null })} 
                                className={styles.resetBtn}
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </main>

            </div>

            {/* Modal */}
            <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)}>
                {selectedJob && (
                    <JobDetailContent 
                        job={selectedJob} 
                        onClose={() => setSelectedJob(null)} 
                    />
                )}
            </Modal>

        </div>
    );
}