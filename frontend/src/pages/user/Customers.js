import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Customers = () => {
  const { t } = useTranslation();
  const { api } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const params = search ? `?search=${search}` : '';
      const response = await api.get(`/customers${params}`);
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete customer and all orders?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h1>
        <Button onClick={() => navigate('/user/customers/new')} icon={Plus}>
          {t('customers.createCustomer')}
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('loyalty.searchCustomer')}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : customers.length > 0 ? (
          <Table>
            <Thead>
              <Tr>
                <Th>{t('customers.name')}</Th>
                <Th>{t('customers.phone')}</Th>
                <Th>{t('customers.totalOrders')}</Th>
                <Th>{t('customers.totalSpent')}</Th>
                <Th>{t('common.actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customers.map((customer) => (
                <Tr key={customer._id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">{customer.name?.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </Td>
                  <Td>{customer.phone}</Td>
                  <Td>{customer.totalOrders || 0}</Td>
                  <Td className="font-medium">${customer.totalSpent || 0}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/user/customers/${customer._id}/edit`)}
                        className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <div className="p-12 text-center text-gray-500">{t('common.noData')}</div>
        )}
      </Card>
    </div>
  );
};

export default Customers;
