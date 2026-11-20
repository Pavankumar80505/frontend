import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats/');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/auth/users/', { params });
  return response.data;
};

export const updateAdminUser = async (id, data) => {
  const response = await api.patch(`/auth/users/${id}/`, data);
  return response.data;
};
