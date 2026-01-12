import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { MessageCircle, Wifi, WifiOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const WhatsApp = () => {
  const { t } = useTranslation();
  const { api } = useAuth();
  const [status, setStatus] = useState({ connected: false, status: 'not_initialized' });
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ phone: '', text: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/whatsapp/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await api.post('/whatsapp/connect');
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
      }
      toast.success('Initializing WhatsApp...');
      setTimeout(checkStatus, 5000);
    } catch (error) {
      toast.error('Failed to connect');
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/whatsapp/disconnect');
      setStatus({ connected: false, status: 'not_initialized' });
      setQrCode(null);
      toast.success('Disconnected');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const handleSendMessage = async () => {
    if (!message.phone || !message.text) {
      toast.error('Enter phone and message');
      return;
    }
    setSending(true);
    try {
      await api.post('/whatsapp/send', { phone: message.phone, message: message.text });
      toast.success('Message sent');
      setMessage({ phone: '', text: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send');
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-8 h-8 text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900">{t('whatsapp.title')}</h1>
      </div>

      {/* Connection Status */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${status.connected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {status.connected ? (
                  <Wifi className="w-6 h-6 text-emerald-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('whatsapp.status')}</h3>
                <p className={`text-sm ${status.connected ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {status.connected ? t('whatsapp.connected') : 
                   status.status === 'connecting' ? t('whatsapp.connecting') : t('whatsapp.disconnected')}
                </p>
              </div>
            </div>
            {status.connected ? (
              <Button variant="danger" onClick={handleDisconnect}>
                {t('whatsapp.disconnect')}
              </Button>
            ) : (
              <Button onClick={handleConnect} loading={loading}>
                {t('whatsapp.connect')}
              </Button>
            )}
          </div>

          {/* QR Code */}
          {qrCode && !status.connected && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-4">{t('whatsapp.scanQR')}</p>
              <div className="inline-block p-4 bg-white rounded-lg">
                <pre className="text-xs leading-none font-mono">{qrCode}</pre>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Send Message */}
      {status.connected && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t('whatsapp.sendMessage')}</h2>
          </div>
          <CardBody>
            <div className="space-y-4">
              <Input
                label={t('auth.phone')}
                placeholder="+1234567890"
                value={message.phone}
                onChange={(e) => setMessage({ ...message, phone: e.target.value })}
              />
              <Textarea
                label="Message"
                value={message.text}
                onChange={(e) => setMessage({ ...message, text: e.target.value })}
                placeholder="Type your message..."
              />
              <Button onClick={handleSendMessage} loading={sending} icon={Send}>
                {t('whatsapp.sendMessage')}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Info */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2">Important Notes</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• WhatsApp Web integration uses your personal WhatsApp account</li>
          <li>• Keep your phone connected to the internet for messages to send</li>
          <li>• Avoid sending bulk messages to prevent account restrictions</li>
          <li>• Only message customers who have opted in to receive notifications</li>
        </ul>
      </Card>
    </div>
  );
};

export default WhatsApp;
