
// Event utility functions
export const getEventTypeLabel = (type: string) => {
  const labels = {
    masterclass: 'Masterclass',
    stage: 'Stage',
    concours: 'Concours',
    atelier: 'Atelier',
    conference: 'Conférence'
  };
  return labels[type as keyof typeof labels] || type;
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'published':
      return 'Publié';
    case 'draft':
      return 'Brouillon';
    case 'cancelled':
      return 'Annulé';
    case 'completed':
      return 'Terminé';
    default:
      return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-success/15 text-success';
    case 'draft':
      return 'bg-muted text-foreground';
    case 'cancelled':
      return 'bg-destructive/15 text-destructive';
    case 'completed':
      return 'bg-info/15 text-info';
    default:
      return 'bg-muted text-foreground';
  }
};

export const getCurrencySymbol = (currency: string) => {
  const currencySymbols: { [key: string]: string } = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'AED': 'د.إ',
    'AUD': 'A$',
    'BRL': 'R$',
    'CAD': 'C$',
    'CHF': 'Fr',
    'CNY': '¥',
    'CZK': 'Kč',
    'DKK': 'kr',
    'EGP': 'E£',
    'HKD': 'HK$',
    'HUF': 'Ft',
    'IDR': 'Rp',
    'ILS': '₪',
    'INR': '₹',
    'JPY': '¥',
    'KRW': '₩',
    'MAD': 'د.م.',
    'MXN': 'Mex$',
    'NOK': 'kr',
    'NZD': 'NZ$',
    'PLN': 'zł',
    'RON': 'lei',
    'RUB': '₽',
    'SAR': '﷼',
    'SEK': 'kr',
    'SGD': 'S$',
    'THB': '฿',
    'TRY': '₺',
    'ZAR': 'R',
  };
  return currencySymbols[currency] || currency;
};
