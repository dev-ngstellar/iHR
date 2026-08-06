export const formatFieldLabel = (key: string): string => {
  if (!key) return '';
  const result = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim();

  return result
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount: number, currency: string = 'MYR'): string => {
  return `${currency} ${amount.toFixed(2)}`;
};
