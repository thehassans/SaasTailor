import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerForm = () => {
  const { t } = useTranslation();
  const { api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
    measurements: {
      length: '',
      shoulderWidth: '',
      chest: '',
      sleeveLength: '',
      neck: '',
      wrist: '',
      expansion: '',
      armhole: ''
    }
  });

  useEffect(() => {
    if (isEdit) fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      const customer = response.data.customer;
      setFormData({
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes || '',
        measurements: customer.measurements || {}
      });
    } catch (error) {
      toast.error('Failed to load customer');
      navigate('/user/customers');
    }
  };

  const handleMeasurementChange = (field, value) => {
    setFormData({
      ...formData,
      measurements: {
        ...formData.measurements,
        [field]: value ? parseFloat(value) : ''
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        phone: formData.phone,
        notes: formData.notes,
        measurements: Object.fromEntries(
          Object.entries(formData.measurements).filter(([_, v]) => v !== '' && v !== null)
        )
      };

      if (isEdit) {
        await api.put(`/customers/${id}`, data);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', data);
        toast.success('Customer created');
      }
      navigate('/user/customers');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
    setLoading(false);
  };

  const measurementFields = [
    { key: 'length', label: t('measurements.length') },
    { key: 'shoulderWidth', label: t('measurements.shoulderWidth') },
    { key: 'chest', label: t('measurements.chest') },
    { key: 'sleeveLength', label: t('measurements.sleeveLength') },
    { key: 'neck', label: t('measurements.neck') },
    { key: 'wrist', label: t('measurements.wrist') },
    { key: 'expansion', label: t('measurements.expansion') },
    { key: 'armhole', label: t('measurements.armhole') }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/user/customers')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('customers.editCustomer') : t('customers.createCustomer')}
        </h1>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('customers.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label={t('customers.phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('customers.measurements')} (optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {measurementFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                    <input
                      type="number"
                      value={formData.measurements[field.key] || ''}
                      onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                      step="0.1"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              label={t('customers.notes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                {isEdit ? t('common.save') : t('customers.createCustomer')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/user/customers')}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomerForm;
