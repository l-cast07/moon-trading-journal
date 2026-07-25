// Formatea números a USD
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Formatea números a porcentajes
export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Formatea fecha a formato legible (MMM DD, YYYY)
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};