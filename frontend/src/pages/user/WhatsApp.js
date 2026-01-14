import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { MessageCircle, Send, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const WhatsApp = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState({ phone: '+966', text: '' });
  const [copied, setCopied] = useState(false);

  // Message templates
  const templates = [
    { id: 'order_ready', label: 'Order Ready', text: 'السلام عليكم، طلبكم جاهز للاستلام. شكراً لتعاملكم معنا!' },
    { id: 'order_confirm', label: 'Order Confirmed', text: 'السلام عليكم، تم استلام طلبكم بنجاح. سنقوم بإعلامكم عند الجاهزية.' },
    { id: 'reminder', label: 'Pickup Reminder', text: 'السلام عليكم، نود تذكيركم بأن طلبكم جاهز للاستلام. نتطلع لزيارتكم!' },
    { id: 'custom', label: 'Custom Message', text: '' }
  ];

  const generateWhatsAppUrl = () => {
    const cleanPhone = message.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Enter valid phone number');
      return null;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.text)}`;
  };

  const handleOpenWhatsApp = () => {
    const url = generateWhatsAppUrl();
    if (url) {
      window.open(url, '_blank');
      toast.success('Opening WhatsApp...');
    }
  };

  const handleCopyLink = () => {
    const url = generateWhatsAppUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTemplateSelect = (template) => {
    setMessage({ ...message, text: template.text });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-8 h-8 text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('whatsapp.title')}</h1>
      </div>

      {/* Send Message */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">{t('whatsapp.sendMessage')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Send messages via WhatsApp Web - no login required</p>
        </div>
        <CardBody>
          <div className="space-y-5">
            <Input
              label={t('auth.phone')}
              placeholder="+966501234567"
              value={message.phone}
              onChange={(e) => setMessage({ ...message, phone: e.target.value })}
            />

            {/* Message Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      message.text === template.text && template.text
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-200'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Message"
              value={message.text}
              onChange={(e) => setMessage({ ...message, text: e.target.value })}
              placeholder="Type your message in Arabic or English..."
              rows={4}
            />

            <div className="flex gap-3">
              <Button onClick={handleOpenWhatsApp} icon={ExternalLink} className="flex-1">
                Open in WhatsApp
              </Button>
              <Button variant="outline" onClick={handleCopyLink} icon={copied ? CheckCircle : Copy}>
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* How it works */}
      <Card className="p-6 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50">
        <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">How it Works</h3>
        <ol className="text-sm text-emerald-700 dark:text-emerald-200 space-y-2 list-decimal list-inside">
          <li>Enter customer's phone number with country code (+966)</li>
          <li>Select a template or type your custom message</li>
          <li>Click "Open in WhatsApp" to send via WhatsApp Web</li>
          <li>Or copy the link to share via any app</li>
        </ol>
      </Card>

      {/* Info */}
      <Card className="p-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Benefits</h3>
        <ul className="text-sm text-amber-700 dark:text-amber-200 space-y-1">
          <li>• <strong>No blocking</strong> - Uses official WhatsApp Web links</li>
          <li>• <strong>No login required</strong> - Works with your WhatsApp on phone</li>
          <li>• <strong>Safe & Secure</strong> - No data stored on servers</li>
          <li>• <strong>Works everywhere</strong> - Desktop, mobile, tablet</li>
        </ul>
      </Card>
    </div>
  );
};

export default WhatsApp;
