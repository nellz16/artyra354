export const getStatusChip = (status) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    paid: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dikirim: 'bg-blue-100 text-blue-800 border border-blue-200',
    selesai: 'bg-gray-100 text-gray-800 border border-gray-200',
    dibatalkan: 'bg-red-100 text-red-800 border border-red-200'
  };
  return `px-3 py-1.5 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.selesai}`;
};

export const formatCurrency = (amount) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      value: date.toISOString().split('T')[0],
      label: i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    });
  }
  
  return dates;
};

export const availableDeliveryTimes = [
  { value: '07:00', label: '07:00 - Pagi' },
  { value: '16:30', label: '16:30 - Sore' }
];