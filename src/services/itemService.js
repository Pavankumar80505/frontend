import api from './api';

export const getCategories = async () => {
  const response = await api.get('/items/categories/');
  return response.data;
};

export const getLostItems = async (params = {}) => {
  const response = await api.get('/lost-items/', { params });
  return response.data;
};

export const getLostItemById = async (id) => {
  const response = await api.get(`/lost-items/${id}/`);
  return response.data;
};

export const createLostItem = async (formData) => {
  const response = await api.post('/lost-items/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateLostItem = async (id, formData) => {
  const response = await api.patch(`/lost-items/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteLostItem = async (id) => {
  const response = await api.delete(`/lost-items/${id}/`);
  return response.data;
};

export const getMyLostItems = async () => {
  const response = await api.get('/lost-items/my/');
  return response.data;
};

export const getFoundItems = async (params = {}) => {
  const response = await api.get('/found-items/', { params });
  return response.data;
};

export const getFoundItemById = async (id) => {
  const response = await api.get(`/found-items/${id}/`);
  return response.data;
};

export const createFoundItem = async (formData) => {
  const response = await api.post('/found-items/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateFoundItem = async (id, formData) => {
  const response = await api.patch(`/found-items/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteFoundItem = async (id) => {
  const response = await api.delete(`/found-items/${id}/`);
  return response.data;
};

export const getMyFoundItems = async () => {
  const response = await api.get('/found-items/my/');
  return response.data;
};
