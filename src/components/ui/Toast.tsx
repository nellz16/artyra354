import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onDismiss }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const styles = {
    success: 'bg-emerald-500 border-emerald-400',
    error: 'bg-red-500 border-red-400',
    info: 'bg-blue-500 border-blue-400'
  };

  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-6 right-6 ${styles[type]} text-white py-4 px-6 rounded-xl shadow-lg flex items-center animate-slide-in-right z-50 border backdrop-blur-sm`}>
      <Icon size={18} className="mr-3 flex-shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Toast;