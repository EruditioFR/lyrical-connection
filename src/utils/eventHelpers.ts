
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
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
