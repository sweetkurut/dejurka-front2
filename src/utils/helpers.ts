export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
};

export const getRoomLabel = (rooms: number): string => {
  const labels = {
    1: '1-комн.',
    2: '2-комн.',
    3: '3-комн.',
    4: '4-комн.',
    5: '5-комн.',
  };
  return labels[rooms as keyof typeof labels] || `${rooms}-комн.`;
};

export const getRepairLabel = (repair: string): string => {
  const labels = {
    designer: 'Дизайнерский',
    euro: 'Евроремонт',
    good: 'Хорошее',
    cosmetic: 'Косметика',
    pso: 'ПСО',
    old: 'Старый',
  };
  return labels[repair as keyof typeof labels] || repair;
};

export const getFurnitureLabel = (furniture: string): string => {
  const labels = {
    full: 'Полностью меблированная',
    partial: 'Частично меблированная',
    none: 'Без мебели',
  };
  return labels[furniture as keyof typeof labels] || furniture;
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};