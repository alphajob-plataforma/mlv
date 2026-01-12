'use client';
import { useMemo } from 'react';
import { Check } from 'lucide-react';
import styles from './JobFilters.module.css';

export default function JobFilters({ jobs, currentFilters, onFilterChange }) {
  
  // 1. LISTAS ESTÁTICAS (Basadas en tu BD)
  // Al ponerlas fijas, solucionamos el problema de que "desaparezcan" si no hay ofertas.
  const CATEGORIES = [
    'Tecnología',
    'Diseño',
    'Marketing',
    'Audiovisual',
    'Administración',
    'Gestión',
    'Otros'
  ];

  const EXPERIENCE_LEVELS = [
    { value: 'junior', label: 'Junior (0-2 años)' },
    { value: 'mid', label: 'Mid-Senior (2-5 años)' },
    { value: 'senior', label: 'Senior (+5 años)' }
  ];

  const BUDGET_RANGES = [
    { label: 'Cualquiera', id: null },
    { label: 'Menos de $1,500', id: 'low' },
    { label: '$1,500 - $3,000', id: 'mid' },
    { label: '$3,000+', id: 'high' },
  ];

  // 2. GENERACIÓN DINÁMICA (Solo para Ubicación y Tipos)
  const dynamicOptions = useMemo(() => {
    const types = new Set();
    const locations = new Set();

    jobs.forEach(job => {
      if (job.employment_type) types.add(job.employment_type);
      // Usamos la ubicación que inyectamos en page.js
      if (job.virtualLocation) locations.add(job.virtualLocation);
    });

    return {
      types: Array.from(types).sort(),
      locations: Array.from(locations).sort()
    };
  }, [jobs]);


  // --- HANDLERS ---
  const toggleFilter = (section, value) => {
    const currentList = currentFilters[section] || [];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    
    onFilterChange({ ...currentFilters, [section]: newList });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filtros</h3>
        <button 
          onClick={() => onFilterChange({ categories: [], types: [], locations: [], experience: [], budget: null })} 
          className={styles.clearBtn}
        >
          Limpiar
        </button>
      </div>

      {/* --- 1. CATEGORÍA (Fija) --- */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Categoría</h4>
        <div className={styles.optionsGroup}>
          {CATEGORIES.map((cat) => (
            <label key={cat} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.hiddenInput}
                checked={currentFilters.categories?.includes(cat)}
                onChange={() => toggleFilter('categories', cat)}
              />
              <span className={styles.customCheckbox}>
                  <Check size={12} className={styles.checkIcon} strokeWidth={4} />
              </span>
              <span className={styles.text}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* --- 2. EXPERIENCIA (Nueva Sección) --- */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Experiencia</h4>
        <div className={styles.optionsGroup}>
          {EXPERIENCE_LEVELS.map((exp) => (
            <label key={exp.value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.hiddenInput}
                checked={currentFilters.experience?.includes(exp.value)}
                onChange={() => toggleFilter('experience', exp.value)}
              />
              <span className={styles.customCheckbox}>
                  <Check size={12} className={styles.checkIcon} strokeWidth={4} />
              </span>
              <span className={styles.text}>{exp.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* --- 3. PRESUPUESTO --- */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Presupuesto (USD)</h4>
        <div className={styles.optionsGroup}>
          {BUDGET_RANGES.map((range) => (
            <label key={range.label} className={styles.checkboxLabel}>
              <input
                type="checkbox" // Comportamiento Radio visual
                className={styles.hiddenInput}
                checked={currentFilters.budget === range.id}
                onChange={() => onFilterChange({ ...currentFilters, budget: range.id })}
              />
              <span className={`${styles.customCheckbox} ${styles.radioCircle}`}>
                 <div className={styles.radioDot} />
              </span>
              <span className={styles.text}>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* --- 4. UBICACIÓN (Dinámica) --- */}
      {dynamicOptions.locations.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Ubicación</h4>
          <div className={`${styles.optionsGroup} max-h-40 overflow-y-auto`}>
            {dynamicOptions.locations.map((loc) => (
              <label key={loc} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.hiddenInput}
                  checked={currentFilters.locations?.includes(loc)}
                  onChange={() => toggleFilter('locations', loc)}
                />
                <span className={styles.customCheckbox}>
                  <Check size={12} className={styles.checkIcon} strokeWidth={4} />
                </span>
                <span className={styles.text}>{loc}</span>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}