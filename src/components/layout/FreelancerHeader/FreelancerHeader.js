'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; 
import { Menu, X, Search, Bell, Briefcase, FileText, Loader2, User, LogOut } from 'lucide-react'; // <--- Agregamos LogOut
import styles from './FreelancerHeader.module.css';

export default function FreelancerHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- ESTADOS PARA BÚSQUEDA INTELIGENTE ---
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const [isSearching, setIsSearching] = useState(false);
  
  // --- NUEVO: ESTADOS PARA EL MENÚ DE PERFIL ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null); 
  const profileRef = useRef(null); // <--- Referencia para el menú de perfil

  const pathname = usePathname(); 
  const router = useRouter(); 
  const supabase = createClient();

  const toggleMenu = () => setIsOpen(!isOpen);

  // --- NUEVO: LOGICA DE LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // 1. CONSULTA A SUPABASE 
  const fetchSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const [skillsResult, titlesResult] = await Promise.all([
        supabase.from('skills').select('name').ilike('name', `%${term}%`).limit(3),
        supabase.from('job_titles').select('name').ilike('name', `%${term}%`).limit(3)
      ]);
      const rawSuggestions = [
        ...(skillsResult.data || []).map(s => s.name),
        ...(titlesResult.data || []).map(t => t.name)
      ];
      const uniqueSuggestions = [...new Set(rawSuggestions)];
      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. MANEJAR INPUT
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // 3. EJECUTAR BÚSQUEDA
  const executeSearch = (term) => {
    if (!term) return;
    setShowSuggestions(false);
    setSearchTerm(term);
    if (isOpen) setIsOpen(false);
    router.push(`/freelancer/jobs?q=${encodeURIComponent(term)}`);
  };

  // Clicks fuera para cerrar dropdowns (Search y Profile)
  useEffect(() => {
    function handleClickOutside(event) {
      // Cerrar búsqueda
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      // Cerrar perfil
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Buscar Trabajo', href: '/freelancer', icon: Briefcase }, 
    { name: 'Mis Postulaciones', href: '/freelancer/applications', icon: FileText },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* --- ZONA 1: LOGO --- */}
        <div className={styles.logoSection}>
            <Link href="/freelancer" className={styles.brand}>
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none" className="text-mint">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="#7ADCB7" fillRule="evenodd"/>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="#7ADCB7" fillRule="evenodd"/>
                </svg>
                <span className={styles.brandName}>Chambexy</span>
            </Link>
        </div>

        {/* --- ZONA 2: BUSCADOR (Igual que antes) --- */}
        <div className={styles.centerSection}>
            <div className={styles.searchContainer} ref={searchContainerRef}>
                <div className={`${styles.searchBarWrapper} ${showSuggestions && searchTerm ? styles.activeWrapper : ''}`}>
                    <Search size={18} className={styles.searchIcon} style={{cursor: 'pointer'}} onClick={() => executeSearch(searchTerm)} />
                    <input 
                        type="text" 
                        placeholder="Buscar ofertas, habilidades..." 
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                        onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)}
                    />
                    {isSearching ? <Loader2 size={16} className="animate-spin text-gray-500" /> : <div className={styles.shortcutKey}>/</div>}
                </div>

                {showSuggestions && searchTerm.length > 0 && (
                    <div className={styles.suggestionsDropdown}>
                        {suggestions.length > 0 ? (
                            suggestions.map((term, index) => (
                                <div key={index} className={styles.suggestionItem} onClick={() => executeSearch(term)}>
                                    <Search size={14} className={styles.suggestionIcon} />
                                    <span>{term}</span>
                                </div>
                            ))
                        ) : (
                            !isSearching && <div className={styles.noResults}>No hay sugerencias para "{searchTerm}"</div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* --- ZONA 3: NAVEGACIÓN Y PERFIL (MODIFICADO) --- */}
        <div className={styles.rightSection}>
            <nav className={styles.navDesktop}>
                {navLinks.map((link) => ( 
                    <Link key={link.href} href={link.href} className={`${styles.link} ${pathname === link.href ? styles.activeLink : ''}`}>
                         <span className={styles.linkText}>{link.name}</span>
                    </Link>
                ))}
            </nav>
            
            <div className={styles.divider}></div>

            <div className={styles.profileGroup}>
                <button className={styles.iconBtn}>
                    <Bell size={20} />
                    <span className={styles.badge}></span>
                </button>
                
                {/* --- MENÚ DESPLEGABLE DE PERFIL --- */}
                <div className={styles.profileDropdownContainer} ref={profileRef}>
                    <div 
                        className={styles.avatarBtn} 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className={styles.avatarPlaceholder}>DL</div>
                    </div>

                    {isProfileOpen && (
                        <div className={styles.profileMenu}>
                            <div className={styles.menuHeader}>
                                <p className={styles.menuUserRole}>Freelancer</p>
                            </div>
                            <div className={styles.menuDivider}></div>
                            
                            <Link 
                                href="/freelancer/profile" 
                                className={styles.menuItem}
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User size={16} /> Mi Perfil
                            </Link>
                            
                            <button onClick={handleLogout} className={`${styles.menuItem} ${styles.logoutItem}`}>
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

             <button className={styles.mobileToggle} onClick={toggleMenu}>
                {isOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" /> }
            </button>
        </div>

      </div>

      {/* MENÚ MÓVIL (Igual que antes pero agregando logout) */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.menuOpen : ''}`}>
        <div className={styles.mobileSearch}>
            <input type="text" placeholder="Buscar..." className={styles.searchInput} value={searchTerm} onChange={handleSearchChange} />
        </div>
        <div className={styles.mobileLinks}>
            {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={toggleMenu} className={styles.mobileLink}>
                  <link.icon size={20} style={{marginRight: '10px'}}/> {link.name}
                </Link>
            ))}
             <Link href="/freelancer/profile" onClick={toggleMenu} className={styles.mobileLink}>
                <User size={20} style={{marginRight: '10px'}}/> Mi Perfil
            </Link>
            {/* Logout en móvil */}
             <button onClick={handleLogout} className={styles.mobileLink} style={{width:'100%', border:'none', background:'none', color:'#ff6b6b'}}>
                <LogOut size={20} style={{marginRight: '10px'}}/> Salir
            </button>
        </div>
      </div>
    </header>
  );
}