import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Clock, MapPin } from 'lucide-react';
import { formatCurrency, generateAvailableDates, availableDeliveryTimes } from '../utils/helpers';

const CheckoutPage = ({ cart, onPlaceOrder, onBack }) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerClass, setBuyerClass] = useState('');
  const [notes, setNotes] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [error, setError] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const availableDates = generateAvailableDates();

  const handleSubmitOrder = () => {
    setError('');
    
    if (!buyerName.trim()) {
      setError('Nama Pembeli wajib diisi.');
      return;
    }
    if (!waNumber || waNumber.length < 9) {
      setError('Nomor WhatsApp valid wajib diisi.');
      return;
    }
    if (!paymentMethod) {
      setError('Silakan pilih metode pembayaran.');
      return;
    }
    if (paymentMethod === 'cod' && (!deliveryDate || !deliveryTime)) {
      setError('Silakan pilih tanggal dan jam pengiriman untuk COD.');
      return;
    }

    const numericId = Date.now();
    const orderId = `TYO-${numericId}`;
    
    const orderDetails = {
      numericId,
      id: orderId,
      customer: {
        name: buyerName,
        kelas: buyerClass,
        wa: `+62${waNumber}`
      },
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        qty: item.quantity,
        toppings: item.toppings || []
      })),
      total,
      status: 'pending',
      notes,
      orderDate: new Date(),
      paymentMethod,
      ...(paymentMethod === 'cod' && {
        deliveryInfo: {
          date: deliveryDate,
          time: deliveryTime
        }
      })
    };

    onPlaceOrder(orderDetails);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="container mx-auto p-6 max-w-6xl animate-fade-in">
        <button 
          onClick={onBack} 
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold bg-white hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali Belanja
        </button>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Checkout</span>
          </h1>
          <p className="text-gray-600 text-lg">Lengkapi pesanan Anda dan pilih metode pembayaran</p>
        </div>

        {/* Check for out of stock items */}
        {cart.some(item => item.stock !== null && item.stock <= 0) && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 mb-8 rounded-xl shadow-sm" role="alert">
            <p className="font-medium">Beberapa item dalam keranjang Anda sudah habis stok. Silakan hapus item tersebut atau pilih item lain.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 mb-8 rounded-xl shadow-sm" role="alert">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Detail Pembeli */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                Detail Pembeli
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Pembeli *</label>
                  <input 
                    type="text" 
                    value={buyerName} 
                    onChange={e => setBuyerName(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 h-12 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 shadow-sm" 
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas (Opsional)</label>
                  <input 
                    type="text" 
                    value={buyerClass} 
                    onChange={e => setBuyerClass(e.target.value)} 
                    className="w-full rounded-xl border-gray-200 h-12 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    placeholder="Contoh: XII-A"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">No. WhatsApp *</label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 h-12 text-gray-600 font-medium">
                    +62
                  </span>
                  <input 
                    type="tel" 
                    value={waNumber} 
                    onChange={e => setWaNumber(e.target.value.replace(/\D/g, ''))} 
                    className="flex-1 rounded-none rounded-r-xl border-gray-200 h-12 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 shadow-sm" 
                    placeholder="8123456789" 
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (Opsional)</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  rows="3" 
                  className="w-full rounded-xl border-gray-200 p-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                  placeholder="Tambahkan catatan khusus..."
                />
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                Metode Pembayaran
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'gopay' 
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setPaymentMethod('gopay')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <span className="font-bold text-gray-900">GoPay</span>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="gopay" 
                      checked={paymentMethod === 'gopay'} 
                      onChange={() => setPaymentMethod('gopay')}
                      className="h-4 w-4 text-indigo-600"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Transfer langsung ke akun GoPay</p>
                </div>

                <div 
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'cod' 
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                        <Truck size={20} className="text-white" />
                      </div>
                      <span className="font-bold text-gray-900">COD</span>
                    </div>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-indigo-600"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Bayar saat pesanan diantar</p>
                </div>
              </div>

              {/* Instruksi GoPay */}
              {paymentMethod === 'gopay' && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center">
                    <CreditCard size={18} className="mr-2" />
                    Instruksi Pembayaran GoPay
                  </h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <p>1. Buka aplikasi Gojek atau GoPay</p>
                    <p>2. Pilih menu Transfer atau Kirim Uang</p>
                    <p>3. Transfer ke nomor: <strong className="font-mono bg-white px-2 py-1 rounded text-green-800">085216467520</strong></p>
                    <p>4. Masukkan jumlah: <strong>{formatCurrency(total)}</strong></p>
                    <p>5. Konfirmasi pembayaran dan simpan bukti transfer</p>
                  </div>
                </div>
              )}

              {/* Pengaturan COD */}
              {paymentMethod === 'cod' && (
                <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                  <h3 className="font-bold text-orange-800 mb-4 flex items-center">
                    <MapPin size={18} className="mr-2" />
                    Atur Jadwal Pengiriman
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-orange-700 mb-2">Tanggal Pengiriman</label>
                      <select 
                        value={deliveryDate} 
                        onChange={e => setDeliveryDate(e.target.value)}
                        className="w-full rounded-xl border-orange-200 h-12 px-4 focus:border-orange-500 focus:ring-orange-500 bg-white"
                        required
                      >
                        <option value="">Pilih tanggal</option>
                        {availableDates.map(date => (
                          <option key={date.value} value={date.value}>{date.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-orange-700 mb-2">Jam Pengiriman</label>
                      <select 
                        value={deliveryTime} 
                        onChange={e => setDeliveryTime(e.target.value)}
                        className="w-full rounded-xl border-orange-200 h-12 px-4 focus:border-orange-500 focus:ring-orange-500 bg-white"
                        required
                      >
                        <option value="">Pilih jam</option>
                        {availableDeliveryTimes.map(time => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-orange-700">
                    <p className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      Pesanan akan diantar sesuai jadwal yang dipilih
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                Ringkasan Pesanan
              </h2>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" 
                      loading="lazy" 
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                      {item.toppings && item.toppings.length > 0 && (
                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                          Topping: {item.toppings.join(', ')}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-100 mt-6 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">Total Pembayaran</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(total)}
                  </span>
                </div>

                <button 
                  onClick={handleSubmitOrder} 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Buat Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;