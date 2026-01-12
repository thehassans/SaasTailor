import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { Plus, Search, UserPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Stitchings = () => {
  const { t } = useTranslation();
  const { api } = useAuth();
  const navigate = useNavigate();
  const [stitchings, setStitchings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignModal, setAssignModal] = useState({ open: false, stitching: null });

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const [stitchRes, workersRes] = await Promise.all([
        api.get(`/stitchings?${params}`),
        api.get('/worker')
      ]);
      setStitchings(stitchRes.data.stitchings);
      setWorkers(workersRes.data.workers);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleAssign = async (workerId) => {
    try {
      await api.put(`/stitchings/${assignModal.stitching._id}/assign`, { workerId });
      toast.success('Worker assigned');
      setAssignModal({ open: false, stitching: null });
      fetchData();
    } catch (error) {
      toast.error('Failed to assign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await api.delete(`/stitchings/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/stitchings/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('stitchings.title')}</h1>
        <Button onClick={() => navigate('/user/stitchings/new')} icon={Plus}>
          {t('stitchings.createOrder')}
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('stitchings.receiptNumber')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">{t('stitchings.statusPending')}</option>
            <option value="assigned">{t('stitchings.statusAssigned')}</option>
            <option value="in_progress">{t('stitchings.statusInProgress')}</option>
            <option value="completed">{t('stitchings.statusCompleted')}</option>
            <option value="delivered">{t('stitchings.statusDelivered')}</option>
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : stitchings.length > 0 ? (
          <Table>
            <Thead>
              <Tr>
                <Th>{t('stitchings.receiptNumber')}</Th>
                <Th>{t('stitchings.customer')}</Th>
                <Th>{t('stitchings.worker')}</Th>
                <Th>{t('stitchings.quantity')}</Th>
                <Th>{t('stitchings.price')}</Th>
                <Th>{t('common.status')}</Th>
                <Th>{t('common.actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stitchings.map((stitch) => (
                <Tr key={stitch._id}>
                  <Td className="font-medium">{stitch.receiptNumber}</Td>
                  <Td>
                    <div>
                      <p>{stitch.customerId?.name || '-'}</p>
                      <p className="text-xs text-gray-500">{stitch.customerId?.phone}</p>
                    </div>
                  </Td>
                  <Td>
                    {stitch.workerId ? (
                      <span className="text-emerald-600">{stitch.workerId.name}</span>
                    ) : (
                      <button
                        onClick={() => setAssignModal({ open: true, stitching: stitch })}
                        className="text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        {t('stitchings.assignWorker')}
                      </button>
                    )}
                  </Td>
                  <Td>{stitch.quantity}</Td>
                  <Td>${stitch.price}</Td>
                  <Td>
                    <select
                      value={stitch.status}
                      onChange={(e) => handleStatusChange(stitch._id, e.target.value)}
                      className="text-sm bg-transparent border-none cursor-pointer"
                    >
                      <option value="pending">{t('stitchings.statusPending')}</option>
                      <option value="assigned">{t('stitchings.statusAssigned')}</option>
                      <option value="in_progress">{t('stitchings.statusInProgress')}</option>
                      <option value="completed">{t('stitchings.statusCompleted')}</option>
                      <option value="delivered">{t('stitchings.statusDelivered')}</option>
                    </select>
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleDelete(stitch._id)}
                      className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <div className="p-12 text-center text-gray-500">{t('common.noData')}</div>
        )}
      </Card>

      {/* Assign Worker Modal */}
      <Modal 
        isOpen={assignModal.open} 
        onClose={() => setAssignModal({ open: false, stitching: null })} 
        title={t('stitchings.assignWorker')}
      >
        <div className="space-y-3">
          {workers.filter(w => w.isActive).map((worker) => (
            <button
              key={worker._id}
              onClick={() => handleAssign(worker._id)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-medium">{worker.name?.charAt(0)}</span>
              </div>
              <div className="text-left">
                <p className="font-medium">{worker.name}</p>
                <p className="text-sm text-gray-500">{worker.phone}</p>
              </div>
            </button>
          ))}
          {workers.filter(w => w.isActive).length === 0 && (
            <p className="text-center text-gray-500 py-4">{t('common.noData')}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Stitchings;
