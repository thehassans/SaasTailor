import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Scissors, Shield, Store, Wrench, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { adminLogin, userLogin, workerLogin } = useAuth();
  const navigate = useNavigate();
  
  const [loginType, setLoginType] = useState('user');
  const [credentials, setCredentials] = useState({ email: '', phone: '', password: '' });
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

    let result;
    try {
      if (loginType === 'admin') {
        result = await adminLogin({ email: credentials.email, password: credentials.password });
        if (result.success) navigate('/admin/dashboard');
      } else if (loginType === 'user') {
        result = await userLogin({ phone: credentials.phone, password: credentials.password });
        if (result.success) navigate('/user/dashboard');
      } else {
        result = await workerLogin({ phone: credentials.phone, password: credentials.password });
        if (result.success) navigate('/worker/dashboard');
      }

      if (!result.success) {
        toast.error(result.error || t('auth.invalidCredentials'));
      }
    } catch (error) {
      toast.error(t('auth.invalidCredentials'));
    }
    setLoading(false);
  };

  const loginTypes = [
    { id: 'user', label: t('auth.loginAsUser'), icon: Store, color: 'primary' },
    { id: 'worker', label: t('auth.loginAsWorker'), icon: Wrench, color: 'emerald' },
    { id: 'admin', label: t('auth.loginAsAdmin'), icon: Shield, color: 'violet' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
          >
            <span className="text-sm font-medium">{languages.find(l => l.code === i18n.language)?.label || 'English'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    i18n.language === lang.code ? 'text-primary-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Scissors className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('common.appName')}</h1>
          <p className="text-gray-500 mt-1">Professional Tailoring Management</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-2 mb-6">
          {loginTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setLoginType(type.id)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                loginType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <type.icon className={`w-5 h-5 ${loginType === type.id ? `text-${type.color}-600` : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${loginType === type.id ? `text-${type.color}-700` : 'text-gray-600'}`}>
                {type.id === 'user' ? 'Shop' : type.id === 'worker' ? 'Worker' : 'Admin'}
              </span>
            </button>
          ))}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {loginType === 'admin' ? t('auth.loginAsAdmin') : loginType === 'user' ? t('auth.loginAsUser') : t('auth.loginAsWorker')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginType === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  value={credentials.phone}
                  onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="+1234567890"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
                loginType === 'admin' 
                  ? 'bg-violet-600 hover:bg-violet-700' 
                  : loginType === 'worker'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('common.loading')}
                </span>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 SaaS Tailor. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
