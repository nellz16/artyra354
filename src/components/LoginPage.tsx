import React, { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

const LoginPage = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'Han07' && password === 'rehan7890') {
      onLogin();
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            ArTyra 354
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Admin Panel</h2>
          <p className="text-gray-600 mt-2">Masuk untuk mengelola sistem</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
              placeholder="Masukkan username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Masukkan password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Masuk ke Admin Panel
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onBack} 
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-semibold mx-auto hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft size={16} className="mr-2" />
            Kembali ke Toko
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;