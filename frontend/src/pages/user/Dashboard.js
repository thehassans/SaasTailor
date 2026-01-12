import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Users, UserPlus, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { api } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-1">{t('common.welcome')}</p>
      </div>

      {/* Subscription Alert */}
      {data?.subscription?.daysRemaining <= 7 && data?.subscription?.type !== 'lifetime' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800">
            {t('dashboard.subscriptionStatus')}: {data.subscription.daysRemaining} {t('dashboard.daysRemaining')}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={t('dashboard.totalWorkers')}
          value={data?.stats?.workersCount || 0}
          color="primary"
        />
        <StatCard
          icon={UserPlus}
          label={t('dashboard.totalCustomers')}
          value={data?.stats?.customersCount || 0}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label={t('dashboard.pendingOrders')}
          value={data?.stats?.pendingStitchings || 0}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label={t('dashboard.totalRevenue')}
          value={`$${data?.stats?.totalRevenue?.toLocaleString() || 0}`}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('dashboard.inProgress')}</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{data?.stats?.inProgressStitchings || 0}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('common.completed')}</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{data?.stats?.completedStitchings || 0}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('common.pending')} Payments</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">${data?.stats?.pendingPayments?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('dashboard.recentOrders')}</h2>
        </div>
        {data?.recentStitchings?.length > 0 ? (
          <Table>
            <Thead>
              <Tr>
                <Th>{t('stitchings.receiptNumber')}</Th>
                <Th>{t('stitchings.customer')}</Th>
                <Th>{t('stitchings.worker')}</Th>
                <Th>{t('common.status')}</Th>
                <Th>{t('stitchings.price')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.recentStitchings.map((stitch) => (
                <Tr key={stitch._id} onClick={() => navigate(`/user/stitchings/${stitch._id}/edit`)}>
                  <Td className="font-medium">{stitch.receiptNumber}</Td>
                  <Td>{stitch.customerId?.name || '-'}</Td>
                  <Td>{stitch.workerId?.name || '-'}</Td>
                  <Td><StatusBadge status={stitch.status} /></Td>
                  <Td>${stitch.price}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            {t('common.noData')}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserDashboard;
