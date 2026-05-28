import api from '@/services/api';

export const getPackages = async () => {
  const response = await api.get('/subscriptions/packages');
  return response.data;
};

export const getAdminPackages = async () => {
  const response = await api.get('/subscriptions/admin/packages');
  return response.data;
};

export const createPackage = async (data: any) => {
  const response = await api.post('/subscriptions/admin/packages', data);
  return response.data;
};

export const deletePackage = async (id: string) => {
  const response = await api.delete(`/subscriptions/admin/packages/${id}`);
  return response.data;
};

export const subscribeToPackage = async (packageId: string) => {
  const response = await api.post('/subscriptions/buy', { packageId });
  return response.data;
};
