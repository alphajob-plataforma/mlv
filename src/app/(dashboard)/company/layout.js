'use client';

import CompanyHeader from '@/components/company/CompanyHeader';

export default function CompanyLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#131616' }}>
      {/* 1. Aquí renderizamos el Header fijo arriba */}
      <CompanyHeader />

      {/* 2. Aquí se renderizará el contenido de las páginas (page.js) */}
      <main>
        {children}
      </main>
    </div>
  );
}