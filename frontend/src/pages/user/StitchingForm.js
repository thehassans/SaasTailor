import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ArrowLeft, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const StitchingForm = () => {
  const { t } = useTranslation();
  const { api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    price: 0,
    paidAmount: 0,
    description: '',
    dueDate: '',
    measurements: {}
  });

  useEffect(() => {
    if (isEdit) fetchStitching();
  }, [id]);

  useEffect(() => {
    if (searchQuery.length >= 2) searchCustomers();
  }, [searchQuery]);

  const fetchStitching = async () => {
    try {
      const response = await api.get(`/stitchings/${id}`);
      const stitch = response.data.stitching;
      setSelectedCustomer(stitch.customerId);
      setFormData({
        quantity: stitch.quantity,
        price: stitch.price,
        paidAmount: stitch.paidAmount || 0,
        description: stitch.description || '',
        dueDate: stitch.dueDate ? new Date(stitch.dueDate).toISOString().split('T')[0] : '',
        measurements: stitch.measurements || {}
      });
    } catch (error) {
      toast.error('Failed to load');
      navigate('/user/stitchings');
    }
  };

  const searchCustomers = async () => {
    try {
      const response = await api.get(`/customers/search?q=${searchQuery}`);
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      ...formData,
      measurements: customer.measurements || {}
    });
    setSearchQuery('');
    setCustomers([]);
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
    if (!selectedCustomer) {
      toast.error('Select a customer');
      return;
    }
    setLoading(true);

    try {
      const data = {
        customerId: selectedCustomer._id,
        quantity: formData.quantity,
        price: formData.price,
        paidAmount: formData.paidAmount,
        description: formData.description,
        dueDate: formData.dueDate || null,
        measurements: formData.measurements
      };

      if (isEdit) {
        await api.put(`/stitchings/${id}`, data);
        toast.success('Updated');
      } else {
        await api.post('/stitchings', data);
        toast.success('Order created');
      }
      navigate('/user/stitchings');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
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
        <button onClick={() => navigate('/user/stitchings')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('stitchings.editOrder') : t('stitchings.createOrder')}
        </h1>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('stitchings.customer')} *
              </label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">{selectedCustomer.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('loyalty.searchCustomer')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {customers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 max-h-48 overflow-y-auto">
                      {customers.map((customer) => (
                        <button
                          key={customer._id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left"
                        >
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 text-sm font-medium">{customer.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('stitchings.quantity')}
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
              <Input
                label={t('stitchings.price')}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
              />
              <Input
                label={t('stitchings.paidAmount')}
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>

            <Input
              label={t('stitchings.dueDate')}
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('customers.measurements')}</h3>
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
              label={t('stitchings.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                {isEdit ? t('common.save') : t('stitchings.createOrder')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/user/stitchings')}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default StitchingForm;
