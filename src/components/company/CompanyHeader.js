'use client';

import Link from 'next/link';
import { Building2, PlusCircle, Users, Bell, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
// Reutilizamos el CSS del header de freelancer o creamos uno idéntico
import styles from './CompanyHeader.module.css'; 

export default function CompanyHeader() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* Logo */}
        <Link href="/company" className={styles.logo}>
          <Building2 className={styles.logoIcon} size={28} />
          <span className={styles.logoText}>CorpDashboard</span>
        </Link>

        {/* Navegación */}
        <nav className={styles.nav}>
          <Link href="/company" className={styles.navLink}>
            <Users size={20} /> Explorar Talentos
          </Link>
          <Link href="/company/post-job" className={styles.navLink}>
            <PlusCircle size={20} /> Publicar Oferta
          </Link>
        </nav>

        {/* Acciones Derecha */}
        <div className={styles.actions}>
          <button className={styles.iconBtn}><Bell size={20}/></button>
          <div className={styles.divider}></div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} /> Salir
          </button>
        </div>

      </div>
    </header>
  );
}