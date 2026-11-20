import api from './api';

export const getClaims = async (params = {}) => {
  const response = await api.get('/claims/', { params });
  return response.data;
};

export const getClaimById = async (id) => {
  const response = await api.get(`/claims/${id}/`);
  return response.data;
};

export const submitClaim = async (data) => {
  const response = await api.post('/claims/', data);
  return response.data;
};

export const updateClaimStatus = async (id, status, notes = {}) => {
  const payload = { status, ...notes };
  const response = await api.patch(`/claims/${id}/status/`, payload);
  return response.data;
};
