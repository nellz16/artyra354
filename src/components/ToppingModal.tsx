import React, { useState } from 'react';
import Modal from './ui/Modal';

const ToppingModal = ({ selection, onClose, onAddToCart, showToast }) => {
  const [selectedToppings, setSelectedToppings] = useState([]);

  if (!selection.isOpen) return null;

  const handleToppingChange = (topping) => {
    const isSelected = selectedToppings.includes(topping);
    if (isSelected) {
      setSelectedToppings(prev => prev.filter(t => t !== topping));
    } else {
      if (selectedToppings.length < 5) {
        setSelectedToppings(prev => [...prev, topping]);
      } else {
        showToast('Maksimal 5 topping dapat dipilih', 'info');
      }
    }
  };

  const handleSubmit = () => {
    if (selectedToppings.length === 0) {
      showToast('Silakan pilih minimal 1 topping', 'info');
      return;
    }
    onAddToCart(selection.product, selectedToppings);
    setSelectedToppings([]);
    onClose();
  };

  return (
    <Modal isOpen={selection.isOpen} onClose={onClose} title={`Pilih Topping untuk ${selection.product?.name}`}>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-sm text-gray-700 font-medium">
            Pilih hingga 5 topping untuk melengkapi {selection.product?.name} Anda
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {selectedToppings.length}/5 topping dipilih
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {selection.product?.toppings?.map(topping => (
            <label 
              key={topping} 
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedToppings.includes(topping) 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' 
                  : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <input 
                type="checkbox" 
                name="topping" 
                value={topping} 
                checked={selectedToppings.includes(topping)} 
                onChange={() => handleToppingChange(topping)} 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
              />
              <span className="ml-4 text-sm font-medium text-gray-800">{topping}</span>
            </label>
          ))}
        </div>
        
        <button 
          onClick={handleSubmit} 
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Tambah ke Keranjang
        </button>
      </div>
    </Modal>
  );
};

export default ToppingModal;