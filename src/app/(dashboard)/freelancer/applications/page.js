'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
    Building2, Calendar, DollarSign, MapPin, 
    Clock, MoreHorizontal, Loader2, Frown, CheckCircle2, XCircle, Timer
} from 'lucide-react';

import styles from './Applications.module.css';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            const supabase = createClient();
            
            // 1. Obtener usuario
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return; // O redirigir a login

            // 2. Obtener postulaciones con datos del trabajo y empresa
            const { data, error } = await supabase
                .from('job_applications')
                .select(`
                    id,
                    status,
                    created_at,
                    bid_amount,
                    job_postings (
                        id,
                        title,
                        employment_type,
                        budget_min,
                        budget_max,
                        companies (
                            commercial_name,
                            logo_url,
                            company_direccion ( departments ( name ) )
                        )
                    )
                `)
                .eq('freelancer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error cargando postulaciones:", error);
            } else {
                setApplications(data || []);
            }
            setLoading(false);
        };

        fetchApplications();
    }, []);

    // Helper para formatear fecha
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Helper para status (Etiqueta y Color)
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { label: 'En revisión', icon: Timer, style: styles.statusPending };
            case 'interview': return { label: 'Entrevista', icon: Calendar, style: styles.statusInterview };
            case 'accepted': return { label: 'Aceptado', icon: CheckCircle2, style: styles.statusAccepted };
            case 'rejected': return { label: 'Rechazado', icon: XCircle, style: styles.statusRejected };
            default: return { label: status, icon: MoreHorizontal, style: styles.statusPending };
        }
    };

    return (
        <div className={styles.pageContainer}>
            
            <header className={styles.header}>
                <h1 className={styles.title}>Mis Postulaciones</h1>
                <p className={styles.subtitle}>Historial de tus solicitudes enviadas</p>
            </header>

            {loading ? (
                <div className={styles.centerMsg}>
                    <Loader2 className="animate-spin text-mint" size={40} />
                </div>
            ) : applications.length > 0 ? (
                <div className={styles.listContainer}>
                    
                    {/* Encabezados de la lista (Visible en Desktop) */}
                    <div className={styles.listHeaderRow}>
                        <span style={{flex: 2}}>Empleo / Empresa</span>
                        <span style={{flex: 1}}>Fecha</span>
                        <span style={{flex: 1}}>Presupuesto</span>
                        <span style={{flex: 1}}>Estado</span>
                    </div>

                    {/* Items de la lista */}
                    {applications.map((app) => {
                        const job = app.job_postings;
                        const company = job?.companies;
                        const location = company?.company_direccion?.[0]?.departments?.name || 'Remoto';
                        const Status = getStatusConfig(app.status);

                        return (
                            <div key={app.id} className={styles.cardRow}>
                                
                                {/* 1. Info Principal */}
                                <div className={styles.mainInfo}>
                                    <div className={styles.logoBox}>
                                        {company?.logo_url ? (
                                            <img src={company.logo_url} alt="logo" className={styles.logoImg} />
                                        ) : (
                                            <Building2 size={24} color="#7ADCB7" />
                                        )}
                                    </div>
                                    <div>
                                        <Link href={`/freelancer/jobs/${job.id}`} className={styles.jobLink}>
                                            {job.title}
                                        </Link>
                                        <div className={styles.metaRow}>
                                            <span>{company?.commercial_name}</span>
                                            <span className={styles.dot}>•</span>
                                            <span>{location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Fecha */}
                                <div className={styles.dateCol}>
                                    <Clock size={14} className={styles.mobileIcon} />
                                    {formatDate(app.created_at)}
                                </div>

                                {/* 3. Presupuesto / Oferta */}
                                <div className={styles.budgetCol}>
                                    <DollarSign size={14} className={styles.mobileIcon} />
                                    {job.budget_min ? `$${job.budget_min} - $${job.budget_max}` : 'A convenir'}
                                </div>

                                {/* 4. Estado */}
                                <div className={styles.statusCol}>
                                    <span className={`${styles.statusBadge} ${Status.style}`}>
                                        <Status.icon size={14} />
                                        {Status.label}
                                    </span>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Frown size={48} style={{opacity:0.5, marginBottom:16}} />
                    <h3>Aún no has postulado a ningún empleo</h3>
                    <p>Explora las ofertas disponibles y empieza tu carrera.</p>
                    <Link href="/freelancer/jobs" className={styles.exploreBtn}>
                        Explorar Empleos
                    </Link>
                </div>
            )}

        </div>
    );
}