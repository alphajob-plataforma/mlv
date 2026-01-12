'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Filter } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Componentes
import JobCard from '@/components/ui/JobCard';
import JobSearch from '@/components/jobs/JobSearch';
import JobFilters from '@/components/jobs/JobFilters';
import Modal from '@/components/ui/Modal';
import JobDetailContent from '@/components/jobs/JobDetailContent';

// Estilos
import styles from './Jobs.module.css';

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de UI
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Estados de Filtros
    const [filters, setFilters] = useState({
        categories: [],
        types: [],
        locations: [],
        experience: [], // Nuevo filtro de experiencia
        budget: null
    });

    // 1. Cargar datos de Supabase
    useEffect(() => {
        const fetchJobs = async () => {
            const supabase = createClient();

            // Consulta actualizada para la nueva estructura de BD (direcciones)
            const { data, error } = await supabase
                .from('job_postings')
                .select(`
          *,
          companies (
            id, 
            commercial_name, 
            logo_url,
            company_direccion (
                department_id,
                departments ( name )
            )
          ),
          job_titles ( name, category ),
          job_skills ( skills ( name ) )
        `)
                .eq('status', 'open') // Solo ofertas abiertas
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error cargando trabajos:', error);
            } else if (data) {
                setJobs(data);
            }
            setLoading(false);
        };

        fetchJobs();
    }, []);

    // --- HELPER: Obtener Ubicación (Navega por las tablas anidadas) ---
    const getJobLocation = (job) => {
        // Intenta buscar: companies -> direccion[0] -> department -> name
        // Si falla algo, devuelve "Remoto"
        return job.companies?.company_direccion?.[0]?.departments?.name || 'Remoto';
    };

    // --- HELPER: Detectar Categoría "Virtual" ---
    const detectCategory = (job) => {
        const title = job.title?.toLowerCase() || '';

        if (title.includes('diseñ') || title.includes('ui') || title.includes('ux') || title.includes('creativ')) return 'Diseño & Creatividad';
        if (title.includes('dev') || title.includes('web') || title.includes('system') || title.includes('full stack') || title.includes('front') || title.includes('back')) return 'Desarrollo & Tech';
        if (title.includes('marketing') || title.includes('social') || title.includes('community') || title.includes('seo')) return 'Marketing & Ventas';
        if (title.includes('data') || title.includes('analist') || title.includes('python')) return 'Data & Analytics';
        if (title.includes('project') || title.includes('manager') || title.includes('lead')) return 'Gestión & Management';

        return 'Otros';
    };

    // 2. Generar sugerencias para el buscador
    const allTerms = useMemo(() => {
        const termsSet = new Set();
        jobs.forEach(job => {
            if (job.title) termsSet.add(job.title);
            if (job.companies?.commercial_name) termsSet.add(job.companies.commercial_name);
        });
        return Array.from(termsSet);
    }, [jobs]);

    // 3. Lógica de Filtrado Maestra
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const jobLoc = getJobLocation(job);
            // AHORA USAMOS EL DATO REAL DE LA BD:
            const jobCat = job.job_titles?.category || 'Otros';

            // --- FILTROS ---
            const lowerQuery = searchQuery.toLowerCase();
            const matchSearch = !searchQuery || (
                job.title?.toLowerCase().includes(lowerQuery) ||
                job.companies?.commercial_name?.toLowerCase().includes(lowerQuery)
            );

            const matchCat = filters.categories.length === 0 || filters.categories.includes(jobCat);
            const matchType = filters.types.length === 0 || filters.types.includes(job.employment_type);
            const matchLoc = filters.locations.length === 0 || filters.locations.includes(jobLoc);

            // Filtro de Experiencia
            const matchExp = !filters.experience || filters.experience.length === 0 || filters.experience.includes(job.experience);

            // Filtro de Presupuesto
            let matchBudget = true;
            if (filters.budget) {
                const max = job.budget_max || 0;
                if (filters.budget === 'low') matchBudget = max <= 1500;
                else if (filters.budget === 'mid') matchBudget = max > 1500 && max <= 3000;
                else if (filters.budget === 'high') matchBudget = max > 3000;
            }

            return matchSearch && matchCat && matchType && matchLoc && matchBudget && matchExp;
        });
    }, [jobs, searchQuery, filters]);

    // Preparamos los jobs para el componente de filtros (inyectando la ubicación plana)
    const jobsForFilters = useMemo(() => {
        return jobs.map(job => ({
            ...job,
            virtualLocation: getJobLocation(job),
            virtualCategory: job.job_titles?.category || 'Otros' // Pasamos la categoría limpia
        }));
    }, [jobs]);

    return (
        <>
            <Navbar />
            <main className={styles.pageContainer}>
                <div className={styles.contentWrapper}>

                    <section className={styles.heroSection}>
                        {/* Aquí podrías poner un título si quisieras */}
                    </section>

                    <section className={styles.searchSection}>
                        <JobSearch onSearch={setSearchQuery} suggestionsList={allTerms} />
                    </section>

                    <button
                        className={styles.mobileFilterBtn}
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <Filter size={18} />
                        {showMobileFilters ? 'Ocultar Filtros' : 'Filtrar Resultados'}
                    </button>

                    <div className={styles.mainGrid}>

                        {/* SIDEBAR FILTROS */}
                        <aside className={`${styles.sidebar} ${showMobileFilters ? styles.sidebarMobileVisible : styles.sidebarMobileHidden}`}>
                            <JobFilters
                                jobs={jobsForFilters}
                                currentFilters={filters}
                                onFilterChange={setFilters}
                            />
                        </aside>

                        {/* FEED RESULTADOS */}
                        <section className={styles.feedSection}>

                            <div className={styles.resultsHeader}>
                                <span className={styles.resultsCount}>
                                    Mostrando <span className={styles.highlight}>{filteredJobs.length}</span> vacantes
                                </span>
                            </div>

                            {loading ? (
                                <p className={styles.resultsCount}>Cargando ofertas...</p>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <div key={job.id} onClick={() => setSelectedJob(job)}>
                                        {/* Pasamos locationName calculado al JobCard por si lo necesita mostrar */}
                                        <JobCard job={{ ...job, locationName: getJobLocation(job) }} />
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p className={styles.emptyTitle}>No encontramos resultados.</p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilters({ categories: [], types: [], locations: [], experience: [], budget: null });
                                        }}
                                        className={styles.clearFilterLink}
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                </div>

                <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)}>
                    {selectedJob && <JobDetailContent job={selectedJob} onClose={() => setSelectedJob(null)} />}
                </Modal>

            </main>
            <Footer />
        </>
    );
}