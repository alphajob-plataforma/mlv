'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react'; // Sparkles para decorar la sugerencia
import styles from './JobSearch.module.css';

// Ahora recibimos 'suggestionsList'
export default function JobSearch({ onSearch, suggestionsList = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null); // Para detectar clics fuera

  // Filtrar sugerencias mientras escribes
  useEffect(() => {
    if (searchTerm.length > 1) { // Solo sugerir si hay más de 1 letra
      const matches = suggestionsList.filter(term => 
        term.toLowerCase().includes(searchTerm.toLowerCase()) &&
        term.toLowerCase() !== searchTerm.toLowerCase() // No sugerir lo que ya escribí exacto
      ).slice(0, 5); // Máximo 5 sugerencias para no saturar
      
      setFilteredSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, suggestionsList]);

  // Cerrar sugerencias si hago clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Al enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) onSearch(searchTerm);
  };

  // Al hacer clic en una sugerencia
  const handleSelectSuggestion = (term) => {
    setSearchTerm(term); // Poner el texto en el input
    setShowSuggestions(false); // Ocultar menú
    if (onSearch) onSearch(term); // Ejecutar búsqueda
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    if (onSearch) onSearch('');
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <form className={styles.searchBar} onSubmit={handleSubmit} style={{ position: 'relative' }}>
        
        <div className={styles.inputWrapper}>
          <Search className={styles.icon} size={20} />
          <input 
            type="text"
            placeholder="Busca por puesto, empresa o tecnología..."
            className={styles.input}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
            autoComplete="off" // Desactiva el autocompletar nativo del navegador
          />
          {searchTerm && (
            <button type="button" className={styles.clearButton} onClick={handleClear}>
              <X size={16} />
            </button>
          )}
        </div>

        <button type="submit" className={styles.searchButton}>
          Buscar
        </button>

        {/* --- MENÚ DESPLEGABLE --- */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {filteredSuggestions.map((term, index) => (
              <button 
                key={index} 
                type="button" // Importante: type button para no enviar form
                className={styles.suggestionItem}
                onClick={() => handleSelectSuggestion(term)}
              >
                <Sparkles size={14} className={styles.suggestionIcon} />
                {term}
              </button>
            ))}
          </div>
        )}

      </form>

      <div className={styles.popularTags}>
        <span className={styles.tagsLabel}>Tendencia:</span>
        {['React', 'Senior', 'Node.js', 'Figma'].map((tag) => (
          <button 
            key={tag} 
            type="button" 
            className={styles.tag}
            onClick={() => handleSelectSuggestion(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}