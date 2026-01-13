'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import styles from './PostJob.module.css';

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    work_mode: 'Remoto', // Según tu campo nuevo en DB
    employment_type: 'Freelance',
    requirements: '', // Lo manejaremos como texto y convertiremos a array
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Obtener usuario
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 2. Obtener Company ID del usuario
      // Asumimos que el usuario pertenece a una empresa en 'company_team_members'
      // O si estás probando solo, puedes quemar un ID de empresa temporalmente.
      const { data: memberData, error: memberError } = await supabase
        .from('company_team_members')
        .select('company_id')
        .eq('profile_id', user.id)
        .single();
        
      // FALLBACK: Si no tienes configurado team members, usa este truco temporal:
      // const companyId = 'ID_DE_TU_EMPRESA_AQUI_SI_FALLA_LO_DE_ARRIBA'; 
      
      if (memberError || !memberData) {
        alert("No tienes una empresa asociada para publicar.");
        setLoading(false);
        return;
      }

      const companyId = memberData.company_id;

      // 3. Preparar datos (Convertir requisitos de texto a array)
      const requirementsArray = formData.requirements.split('\n').filter(line => line.trim() !== '');

      // 4. Insertar Oferta
      const { error: insertError } = await supabase
        .from('job_postings')
        .insert({
            company_id: companyId,
            created_by: user.id,
            title: formData.title,
            description: formData.description,
            budget_min: Number(formData.budget_min),
            budget_max: Number(formData.budget_max),
            work_mode: formData.work_mode,
            employment_type: formData.employment_type,
            requirements: requirementsArray,
            status: 'open'
        });

      if (insertError) throw insertError;

      alert("¡Oferta publicada exitosamente!");
      router.push('/company');

    } catch (error) {
      console.error(error);
      alert("Error publicando oferta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backLink}>
        <ChevronLeft size={16}/> Cancelar
      </button>

      <h1 className={styles.title}>Publicar Nueva Vacante</h1>
      
      <form onSubmit={handleSubmit} className={styles.formCard}>
        
        {/* Título */}
        <div className={styles.formGroup}>
          <label>Título del Puesto</label>
          <input 
            name="title" 
            required 
            placeholder="Ej: Desarrollador React Senior"
            value={formData.title} onChange={handleChange}
          />
        </div>

        {/* Detalles Fila 1 */}
        <div className={styles.row}>
           <div className={styles.formGroup}>
              <label>Modalidad</label>
              <select name="work_mode" value={formData.work_mode} onChange={handleChange}>
                 <option value="Remoto">Remoto</option>
                 <option value="Híbrido">Híbrido</option>
                 <option value="Presencial">Presencial</option>
              </select>
           </div>
           <div className={styles.formGroup}>
              <label>Tipo Contrato</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                 <option value="Freelance">Freelance</option>
                 <option value="Full-time">Tiempo Completo</option>
                 <option value="Part-time">Medio Tiempo</option>
              </select>
           </div>
        </div>

        {/* Presupuesto */}
        <div className={styles.row}>
           <div className={styles.formGroup}>
              <label>Presupuesto Mín ($)</label>
              <input type="number" name="budget_min" value={formData.budget_min} onChange={handleChange} />
           </div>
           <div className={styles.formGroup}>
              <label>Presupuesto Máx ($)</label>
              <input type="number" name="budget_max" value={formData.budget_max} onChange={handleChange} />
           </div>
        </div>

        {/* Descripción */}
        <div className={styles.formGroup}>
          <label>Descripción del Proyecto</label>
          <textarea 
            name="description" 
            rows={6}
            required
            placeholder="Describe las responsabilidades y el proyecto..."
            value={formData.description} onChange={handleChange}
          />
        </div>

        {/* Requisitos (Array simulado) */}
        <div className={styles.formGroup}>
          <label>Requisitos (Uno por línea)</label>
          <textarea 
            name="requirements" 
            rows={4}
            placeholder="- Experiencia en Next.js&#10;- Inglés intermedio&#10;- Portafolio actualizado"
            value={formData.requirements} onChange={handleChange}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <Loader2 className="animate-spin"/> : <Save size={18} />}
          Publicar Oferta
        </button>

      </form>
    </div>
  );
}