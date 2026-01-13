'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <--- Importante para redirigir
import { createClient } from '@/utils/supabase/client'; // <--- Importante para conectar a la BD
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'; // Agregué Loader2 para efecto de carga
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // 1. ESTADOS PARA LOS DATOS Y LA CARGA
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. FUNCIÓN PARA INICIAR SESIÓN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Intentamos loguear (Auth)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
      setLoading(false);
    } else {
      // 2. SI ES EXITOSO: Consultamos el ROL en la tabla 'profiles'
      const userId = authData.user.id;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Si hay error buscando el perfil, lo mandamos a freelancer por defecto o mostramos error
        console.error("Error cargando perfil", profileError);
        router.push('/freelancer');
      } else {
        // 3. Redirección Inteligente
        if (profile?.role === 'company_admin' || profile?.role === 'client') {
          // Nota: Revisa en tu BD si guardaste el rol como 'company' o 'client'
          router.push('/company');
        } else {
          router.push('/freelancer');
        }
      }
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>

      {/* --- LADO IZQUIERDO (IGUAL QUE ANTES) --- */}
      <div className={styles.leftPanel}>
        <div className={styles.pattern}></div>
        <div className={styles.overlay}></div>

        {/* LOGO FLOTANTE */}
        <div style={{ position: 'absolute', top: '2rem', left: '2.5rem', zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--brand-mint)' }}>
            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd" />
            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd" />
          </svg>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.05em' }}>Chambexy</span>
        </div>

        <div className={styles.brandContent}>
          <span className={styles.badge}>Ecosistema Premium</span>
          <h2 className={styles.headingLarge}>
            La excelencia en el <br />
            <span className={styles.headingHighlight}>trabajo remoto</span>
          </h2>
          <p className={styles.description}>
            Conectamos el talento más sofisticado con proyectos de alto impacto global.
          </p>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>+15k</span>
              <span className={styles.statLabel}>Freelancers</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Seguridad</span>
            </div>
          </div>
        </div>
        <div className={styles.glowEffect}></div>
      </div>

      {/* --- LADO DERECHO (Formulario FUNCIONAL) --- */}
      <div className={styles.rightPanel}>

        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Iniciar Sesión</h1>
            <p>Bienvenido de nuevo. Ingresa tus credenciales.</p>
          </div>

          {/* MENSAJE DE ERROR (Si falla el login) */}
          {error && (
            <div style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
              {error}
            </div>
          )}

          <form className={styles.formContainer} style={{ gap: '1.25rem' }} onSubmit={handleLogin}>

            {/* Input Email */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  placeholder="nombre@profesional.com"
                  className={styles.inputField}
                  value={email} // <--- Conectado al estado
                  onChange={(e) => setEmail(e.target.value)} // <--- Actualiza el estado
                  required
                />
                <Mail className={styles.inputIcon} size={16} />
              </div>
            </div>

            {/* Input Password */}
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label className={styles.label}>Contraseña</label>
                <Link href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={styles.inputField}
                  style={{ paddingRight: '2.5rem' }}
                  value={password} // <--- Conectado al estado
                  onChange={(e) => setPassword(e.target.value)} // <--- Actualiza el estado
                  required
                />
                <Lock className={styles.inputIcon} size={16} />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" size={20} /> Entrando...
                </div>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          <div>
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}></span>
            </div>
          </div>

          <div className={styles.footerText}>
            <p>¿Aún no eres parte de Chambexy?</p>
            <Link href="/register" className={styles.registerLink}>Crea una cuenta</Link>
          </div>
        </div>

        <p className={styles.copyright}>© 2025 Chambexy Profesional</p>
      </div>
    </div>
  );
}