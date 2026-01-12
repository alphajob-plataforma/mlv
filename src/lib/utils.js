import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatea el salario: "$2,500 - $3,200 USD"
export const formatSalary = (min, max, currency) => {
  if (!min && !max) return 'Salario no especificado';
  
  const opts = { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 };
  const minFmt = min ? min.toLocaleString('en-US', opts) : '';
  const maxFmt = max ? max.toLocaleString('en-US', opts) : '';

  if (min && max) return `${minFmt} - ${maxFmt} ${currency}`;
  if (min) return `Desde ${minFmt} ${currency}`;
  if (max) return `Hasta ${maxFmt} ${currency}`;
  return 'No especificado';
};

// Formatea la fecha: "hace alrededor de 12 horas"
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
};