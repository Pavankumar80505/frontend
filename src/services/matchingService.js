import api from './api';

export const getMatches = async (params = {}) => {
  const response = await api.get('/matches/', { params });
  return response.data;
};

export const getMatchById = async (id) => {
  const response = await api.get(`/matches/${id}/`);
  return response.data;
};

export const respondToMatch = async (id, action) => {
  const response = await api.post(`/matches/${id}/respond/`, { action });
  return response.data;
};

export const generateMatches = async (itemType = null, itemId = null) => {
  const payload = {};
  if (itemType && itemId) {
    payload.type = itemType;
    payload.item_id = itemId;
  }
  const response = await api.post('/matches/generate/', payload);
  return response.data;
};
