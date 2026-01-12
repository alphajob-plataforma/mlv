import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chamexby - Mercado de Talento Freelance',
  description: 'El mercado de talento para las mentes más brillantes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* ESTA LÍNEA ES LA QUE FALTA PARA LOS ICONOS: */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}