'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, Filter, MapPin, Briefcase, Star, Loader2 } from 'lucide-react';
import styles from './CompanyDashboard.module.css';

export default function CompanyDashboard() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(''); // 'Junior', 'Senior', etc.

  useEffect(() => {
    const fetchTalent = async () => {
      const supabase = createClient();
      
      // Consultamos la tabla freelancers y sus títulos
      let query = supabase
        .from('freelancers')
        .select(`
          *,
          job_titles ( name )
        `);

      // Si tuviéramos un campo 'level' real lo filtraríamos aquí.
      // Filtramos por búsqueda de nombre o título
      if (searchTerm) {
        // Nota: Búsqueda simple. Para producción usar índices de texto completo.
        // Aquí asumimos búsqueda en first_name por simplicidad
        query = query.ilike('first_name', `%${searchTerm}%`); 
      }

      const { data, error } = await query;
      
      if (data) {
        // Filtrado en cliente para custom_skills (array) y Nivel (si viene en el título)
        let filtered = data;

        if (selectedLevel) {
          filtered = filtered.filter(f => 
            f.job_titles?.name?.toLowerCase().includes(selectedLevel.toLowerCase())
          );
        }

        setFreelancers(filtered);
      }
      setLoading(false);
    };

    fetchTalent();
  }, [searchTerm, selectedLevel]);

  return (
    <div className={styles.pageContainer}>
      
      {/* Header de la Sección */}
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.title}>Encuentra el talento ideal</h1>
          <p className={styles.subtitle}>Explora nuestra red de profesionales verificados</p>
        </div>
        
        {/* Barra de Búsqueda y Filtros */}
        <div className={styles.filtersBar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o habilidad..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className={styles.filterSelect}
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Todos los niveles</option>
            <option value="Senior">Senior</option>
            <option value="Mid">Mid-Level</option>
            <option value="Junior">Junior</option>
          </select>
        </div>
      </div>

      {/* Grid de Freelancers */}
      {loading ? (
        <div className={styles.loaderContainer}><Loader2 className="animate-spin text-mint" /></div>
      ) : freelancers.length > 0 ? (
        <div className={styles.talentGrid}>
          {freelancers.map((f) => (
            <div key={f.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatarPlaceholder}>
                    {f.first_name?.[0]}{f.last_name?.[0]}
                </div>
                <div>
                  <h3 className={styles.freelancerName}>{f.first_name} {f.last_name}</h3>
                  <p className={styles.freelancerRole}>{f.job_titles?.name || 'Profesional'}</p>
                </div>
                <div className={styles.ratingBadge}>
                  <Star size={12} fill="#7ADCB7" color="#7ADCB7"/> 
                  <span>{f.rating_avg || '5.0'}</span>
                </div>
              </div>

              {/* Skills */}
              <div className={styles.skillsRow}>
                {f.custom_skills?.slice(0, 3).map((skill, i) => (
                   <span key={i} className={styles.skillTag}>{skill}</span>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.rate}>${f.hourly_rate || '0'}/hr</span>
                <button className={styles.viewProfileBtn}>Ver Perfil</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>No se encontraron profesionales con esos criterios.</div>
      )}

    </div>
  );
}