import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Scissors, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ur', label: 'اردو' },
    { code: 'bn', label: 'বাংলা' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login({ 
        identifier: credentials.identifier, 
        password: credentials.password 
      });
      
      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (result.role === 'user') {
          navigate('/user/dashboard');
        } else if (result.role === 'worker') {
          navigate('/worker/dashboard');
        }
      } else {
        toast.error(result.error || t('auth.invalidCredentials'));
      }
    } catch (error) {
      toast.error(t('auth.invalidCredentials'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex items-center justify-center p-4">
      {/* Language selector */}
      <div className="absolute top-6 right-6">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <span className="text-sm font-medium text-gray-700">
              {languages.find(l => l.code === i18n.language)?.label || 'English'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                    i18n.language === lang.code ? 'text-amber-600 font-medium bg-amber-50' : 'text-gray-600'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg mb-6">
            <Scissors className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KHAYYAT OS</h1>
          <p className="text-amber-600 text-xs font-medium tracking-[0.2em] mt-1">TAILORING OPERATING SYSTEM</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email / Phone
              </label>
              <input
                type="text"
                value={credentials.identifier}
                onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                placeholder="email@example.com or +966501234567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2024 Khayyat OS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
