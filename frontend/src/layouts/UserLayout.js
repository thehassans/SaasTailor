import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  Wallet,
  Scissors,
  Heart,
  MessageCircle,
  Settings,
  LogOut, 
  Menu,
  ChevronDown
} from 'lucide-react';

const UserLayout = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/user/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/user/workers', icon: Users, label: t('nav.workers') },
    { to: '/user/worker-amounts', icon: Wallet, label: t('nav.workerAmounts') },
    { to: '/user/customers', icon: UserPlus, label: t('nav.customers') },
    { to: '/user/stitchings', icon: Scissors, label: t('nav.stitchings') },
    { to: '/user/loyalty', icon: Heart, label: t('nav.loyalty') },
    { to: '/user/whatsapp', icon: MessageCircle, label: t('nav.whatsapp') },
    { to: '/user/settings', icon: Settings, label: t('nav.settings') }
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ur', label: 'اردو' },
    { code: 'bn', label: 'বাংলা' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          {user?.logo ? (
            <img src={user.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="p-2 bg-primary-100 rounded-lg">
              <Scissors className="w-6 h-6 text-primary-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">{user?.businessName || t('common.appName')}</h1>
            <p className="text-xs text-gray-500 truncate">{user?.name}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('auth.logout')}
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
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

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
