import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, Upload, Globe, LayoutDashboard, Users, Wallet, UserPlus, Scissors, Heart, MessageCircle, Eye, EyeOff, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { api, user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(user?.logo || null);
  const [settings, setSettings] = useState({
    language: user?.language || 'en',
    theme: user?.theme || 'light',
    receiptPrefix: '',
    receiptCounter: 0,
    logo: null,
    businessName: user?.businessName || '',
    labelLanguage: user?.labelLanguage || 'both',
    // Theme customization
    primaryColor: user?.primaryColor || 'sky',
    navStyle: user?.navStyle || 'default',
    headerStyle: user?.headerStyle || 'default',
    sidebarStyle: user?.sidebarStyle || 'default'
  });

  // Color presets for primary color
  const colorPresets = [
    { name: 'sky', label: 'Sky Blue', colors: { bg: 'bg-sky-500', hover: 'hover:bg-sky-600', light: 'bg-sky-100', text: 'text-sky-600' } },
    { name: 'indigo', label: 'Indigo', colors: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', light: 'bg-indigo-100', text: 'text-indigo-600' } },
    { name: 'violet', label: 'Violet', colors: { bg: 'bg-violet-500', hover: 'hover:bg-violet-600', light: 'bg-violet-100', text: 'text-violet-600' } },
    { name: 'rose', label: 'Rose', colors: { bg: 'bg-rose-500', hover: 'hover:bg-rose-600', light: 'bg-rose-100', text: 'text-rose-600' } },
    { name: 'emerald', label: 'Emerald', colors: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', light: 'bg-emerald-100', text: 'text-emerald-600' } },
    { name: 'amber', label: 'Amber', colors: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', light: 'bg-amber-100', text: 'text-amber-600' } },
    { name: 'slate', label: 'Slate', colors: { bg: 'bg-slate-600', hover: 'hover:bg-slate-700', light: 'bg-slate-100', text: 'text-slate-600' } },
    { name: 'teal', label: 'Teal', colors: { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', light: 'bg-teal-100', text: 'text-teal-600' } }
  ];

  const navStyles = [
    { value: 'default', label: 'Default', desc: 'Standard sidebar with icons and labels' },
    { value: 'compact', label: 'Compact', desc: 'Smaller padding, condensed view' },
    { value: 'pill', label: 'Pill Style', desc: 'Rounded pill-shaped nav items' },
    { value: 'minimal', label: 'Minimal', desc: 'Clean, borderless design' }
  ];

  const headerStyles = [
    { value: 'default', label: 'Default', desc: 'Standard white/dark header' },
    { value: 'colored', label: 'Colored', desc: 'Uses your primary color' },
    { value: 'gradient', label: 'Gradient', desc: 'Beautiful gradient effect' },
    { value: 'transparent', label: 'Transparent', desc: 'Blends with content' }
  ];

  const sidebarStyles = [
    { value: 'default', label: 'Default', desc: 'Standard white/dark sidebar' },
    { value: 'colored', label: 'Colored', desc: 'Uses your primary color' },
    { value: 'dark', label: 'Always Dark', desc: 'Dark sidebar regardless of theme' },
    { value: 'glass', label: 'Glass Effect', desc: 'Semi-transparent backdrop' }
  ];
  const [hiddenNavItems, setHiddenNavItems] = useState(user?.hiddenNavItems || []);

  const navItemsList = [
    { key: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), required: true },
    { key: 'workers', icon: Users, label: t('nav.workers') },
    { key: 'workerAmounts', icon: Wallet, label: t('nav.workerAmounts') },
    { key: 'customers', icon: UserPlus, label: t('nav.customers') },
    { key: 'stitchings', icon: Scissors, label: t('nav.stitchings') },
    { key: 'loyalty', icon: Heart, label: t('nav.loyalty') },
    { key: 'whatsapp', icon: MessageCircle, label: t('nav.whatsapp') }
  ];

  const toggleNavItem = (key) => {
    if (hiddenNavItems.includes(key)) {
      setHiddenNavItems(hiddenNavItems.filter(k => k !== key));
    } else {
      setHiddenNavItems([...hiddenNavItems, key]);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(prev => ({
        ...prev,
        language: response.data.settings.language,
        theme: response.data.settings.theme || prev.theme || user?.theme || 'light',
        receiptPrefix: response.data.settings.receiptPrefix,
        receiptCounter: response.data.settings.receiptCounter,
        logo: null,
        businessName: response.data.settings.businessName || user?.businessName || ''
      }));
      if (response.data.settings.logo && response.data.settings.logo !== 'null') {
        setLogoPreview(response.data.settings.logo);
      } else {
        setLogoPreview(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings({ ...settings, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLanguageChange = async (lang) => {
    setSettings({ ...settings, language: lang });
    i18n.changeLanguage(lang);
  };

  // Live update theme settings
  const handleThemeChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Apply immediately
    updateUser({
      theme: newSettings.theme,
      primaryColor: newSettings.primaryColor,
      navStyle: newSettings.navStyle,
      headerStyle: newSettings.headerStyle,
      sidebarStyle: newSettings.sidebarStyle
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('language', settings.language);
      data.append('theme', settings.theme);
      data.append('receiptPrefix', settings.receiptPrefix);
      data.append('businessName', settings.businessName);
      if (settings.logo) data.append('logo', settings.logo);

      await api.put('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser({ 
        language: settings.language, 
        theme: settings.theme, 
        businessName: settings.businessName, 
        logo: logoPreview, 
        hiddenNavItems, 
        labelLanguage: settings.labelLanguage,
        primaryColor: settings.primaryColor,
        navStyle: settings.navStyle,
        headerStyle: settings.headerStyle,
        sidebarStyle: settings.sidebarStyle
      });
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setLoading(false);
  };

  const handleReceiptSave = async () => {
    try {
      await api.put('/settings/receipt', {
        receiptPrefix: settings.receiptPrefix,
        receiptCounter: settings.receiptCounter
      });
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-gray-400 dark:text-slate-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('settings.title')}</h1>
      </div>

      {/* Business Info */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Business Information</h2>
        </div>
        <CardBody>
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800/60 rounded-xl flex items-center justify-center overflow-hidden">
                {logoPreview && logoPreview !== 'null' && logoPreview !== 'undefined' ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400 dark:text-slate-400" />
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-100 transition-colors">
                    {t('settings.uploadLogo')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                {t('settings.businessName')}
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your business name"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Ultra Premium Theme Customization */}
      <Card className="overflow-hidden">
        <div className="relative px-6 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Theme Studio</h2>
              <p className="text-white/70 text-sm">Customize your experience in real-time</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-xs font-semibold text-white">✨ LIVE</span>
          </div>
        </div>
        
        <CardBody className="space-y-8">
          {/* Mode Toggle */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs">🌓</span>
              Appearance Mode
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeChange('theme', 'light')}
                className={`relative p-5 rounded-2xl border-2 transition-all group overflow-hidden ${
                  settings.theme === 'light'
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 shadow-lg shadow-amber-500/20'
                    : 'border-gray-200 hover:border-amber-300 dark:border-slate-700 dark:hover:border-amber-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="text-4xl mb-3">☀️</div>
                <span className="font-bold text-gray-900 dark:text-slate-100">Light Mode</span>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Clean & bright</p>
                {settings.theme === 'light' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
              <button
                onClick={() => handleThemeChange('theme', 'dark')}
                className={`relative p-5 rounded-2xl border-2 transition-all group overflow-hidden ${
                  settings.theme === 'dark'
                    ? 'border-indigo-400 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 shadow-lg shadow-indigo-500/20'
                    : 'border-gray-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="text-4xl mb-3">🌙</div>
                <span className="font-bold text-gray-900 dark:text-slate-100">Dark Mode</span>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Easy on the eyes</p>
                {settings.theme === 'dark' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg"></span>
              Accent Color
            </h3>
            <div className="flex flex-wrap gap-3">
              {colorPresets.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleThemeChange('primaryColor', color.name)}
                  className={`group relative w-12 h-12 rounded-2xl ${color.colors.bg} transition-all hover:scale-110 hover:shadow-xl ${
                    settings.primaryColor === color.name 
                      ? 'ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-900 ring-gray-900 dark:ring-white scale-110 shadow-xl' 
                      : 'shadow-lg'
                  }`}
                  title={color.label}
                >
                  {settings.primaryColor === color.name && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
              Active: <span className="font-semibold">{colorPresets.find(c => c.name === settings.primaryColor)?.label}</span>
            </p>
          </div>

          {/* Sidebar Style */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              </span>
              Sidebar Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sidebarStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleThemeChange('sidebarStyle', style.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    settings.sidebarStyle === style.value
                      ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 shadow-lg shadow-cyan-500/10'
                      : 'border-gray-200 hover:border-cyan-300 dark:border-slate-700 dark:hover:border-cyan-600'
                  }`}
                >
                  <span className={`text-sm font-bold block mb-1 ${
                    settings.sidebarStyle === style.value ? 'text-cyan-700 dark:text-cyan-300' : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Header Style */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              </span>
              Header Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {headerStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleThemeChange('headerStyle', style.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    settings.headerStyle === style.value
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg shadow-emerald-500/10'
                      : 'border-gray-200 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-600'
                  }`}
                >
                  <span className={`text-sm font-bold block mb-1 ${
                    settings.headerStyle === style.value ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Style */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              </span>
              Navigation Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {navStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleThemeChange('navStyle', style.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    settings.navStyle === style.value
                      ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 shadow-lg shadow-violet-500/10'
                      : 'border-gray-200 hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-600'
                  }`}
                >
                  <span className={`text-sm font-bold block mb-1 ${
                    settings.navStyle === style.value ? 'text-violet-700 dark:text-violet-300' : 'text-gray-900 dark:text-slate-100'
                  }`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Language */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400 dark:text-slate-400" />
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('settings.language')}</h2>
        </div>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  settings.language === lang.code
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-2xl mb-1 block">{lang.flag}</span>
                <span className={`text-sm font-medium ${
                  settings.language === lang.code ? 'text-primary-700 dark:text-primary-200' : 'text-gray-700 dark:text-slate-200'
                }`}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Navigation Customization */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-gray-400 dark:text-slate-400" />
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Navigation Menu</h2>
        </div>
        <CardBody>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Show or hide menu items in the sidebar navigation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {navItemsList.map((item) => {
              const isHidden = hiddenNavItems.includes(item.key);
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => !item.required && toggleNavItem(item.key)}
                  disabled={item.required}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    item.required
                      ? 'border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/40 cursor-not-allowed opacity-60'
                      : isHidden
                        ? 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600'
                        : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isHidden ? 'text-gray-400 dark:text-slate-400' : 'text-primary-600 dark:text-primary-300'}`} />
                  <span className={`flex-1 text-left text-sm font-medium ${isHidden ? 'text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}>
                    {item.label}
                  </span>
                  {item.required ? (
                    <span className="text-xs text-gray-400 dark:text-slate-400">Required</span>
                  ) : isHidden ? (
                    <EyeOff className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                  )}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Print Label Language */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400 dark:text-slate-400" />
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Print Label Language</h2>
        </div>
        <CardBody>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Choose the language for printed order labels</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'en', label: 'English Only', icon: '🇺🇸' },
              { value: 'ar', label: 'Arabic Only / عربي فقط', icon: '🇸🇦' },
              { value: 'both', label: 'Both / كلاهما', icon: '🌍' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, labelLanguage: option.value })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  settings.labelLanguage === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-2xl mb-2 block">{option.icon}</span>
                <span className={`text-sm font-medium ${
                  settings.labelLanguage === option.value ? 'text-primary-700 dark:text-primary-200' : 'text-gray-700 dark:text-slate-200'
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Receipt Settings */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('settings.receiptSettings')}</h2>
        </div>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('settings.receiptPrefix')}
              value={settings.receiptPrefix}
              onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
              placeholder="RCP"
            />
            <Input
              label={t('settings.receiptCounter')}
              type="number"
              value={settings.receiptCounter}
              onChange={(e) => setSettings({ ...settings, receiptCounter: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Button onClick={handleReceiptSave} variant="secondary" className="mt-4">
            {t('common.save')} Receipt Settings
          </Button>
        </CardBody>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} loading={loading} className="w-full">
        {t('common.save')} {t('settings.title')}
      </Button>
    </div>
  );
};

export default Settings;
