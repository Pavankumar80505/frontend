import api from './api';

export const getNearbyItems = async (lat, lon, radius = 25, type = 'all', category = null) => {
  const params = { lat, lon, radius, type };
  if (category) params.category = category;
  const response = await api.get('/locations/nearby/', { params });
  return response.data;
};

export const getMapMarkers = async (type = 'all', category = null) => {
  const params = { type };
  if (category) params.category = category;
  const response = await api.get('/locations/', { params });
  return response.data;
};
