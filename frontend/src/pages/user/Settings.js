import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, Upload, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { api, user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(user?.logo || null);
  const [settings, setSettings] = useState({
    language: user?.language || 'en',
    receiptPrefix: '',
    receiptCounter: 0,
    logo: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings({
        language: response.data.settings.language,
        receiptPrefix: response.data.settings.receiptPrefix,
        receiptCounter: response.data.settings.receiptCounter,
        logo: null
      });
      if (response.data.settings.logo) {
        setLogoPreview(response.data.settings.logo);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('language', settings.language);
      data.append('receiptPrefix', settings.receiptPrefix);
      if (settings.logo) data.append('logo', settings.logo);

      await api.put('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser({ language: settings.language });
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
        <SettingsIcon className="w-8 h-8 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>

      {/* Business Info */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Business Information</h2>
        </div>
        <CardBody>
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
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

            {/* Business Name (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.businessName')}
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                {user?.businessName}
                <span className="text-xs text-gray-400 ml-2">(unchangeable)</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Language */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">{t('settings.language')}</h2>
        </div>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  settings.language === lang.code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-1 block">{lang.flag}</span>
                <span className={`text-sm font-medium ${
                  settings.language === lang.code ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Receipt Settings */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('settings.receiptSettings')}</h2>
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
