import axios from 'axios';
import { getApiBaseUrl } from '../config/apiEndpoint';

const api = axios.create({
  baseURL: 'https://api-inventory.isavralabel.com/srgroup-kas-stok/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getMaterials = (params) => api.get('/materials', { params });
export const postMaterial = (data) => api.post('/materials', data);
export const putMaterial = (id, data) => api.put(`/materials/${id}`, data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

export const getLocations = (params) => api.get('/locations', { params });
export const postLocation = (data) => api.post('/locations', data);
export const putLocation = (id, data) => api.put(`/locations/${id}`, data);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);

export const getMaterialMasuk = (params) => api.get('/material-masuk', { params });
export const postMaterialMasuk = (data) => api.post('/material-masuk', data);
export const deleteMaterialMasuk = (id) => api.delete(`/material-masuk/${id}`);

export const getMaterialKeluar = (params) => api.get('/material-keluar', { params });
export const postMaterialKeluar = (data) => api.post('/material-keluar', data);
export const deleteMaterialKeluar = (id) => api.delete(`/material-keluar/${id}`);

export const getPemasukan = (params) => api.get('/pemasukan', { params });
export const postPemasukan = (data) => api.post('/pemasukan', data);
export const putPemasukan = (id, data) => api.put(`/pemasukan/${id}`, data);
export const deletePemasukan = (id) => api.delete(`/pemasukan/${id}`);

export const getPengeluaran = (params) => api.get('/pengeluaran', { params });
export const postPengeluaran = (data) => api.post('/pengeluaran', data);
export const putPengeluaran = (id, data) => api.put(`/pengeluaran/${id}`, data);
export const deletePengeluaran = (id) => api.delete(`/pengeluaran/${id}`);

export const getGaji = (params) => api.get('/gaji', { params });
export const postGaji = (data) => api.post('/gaji', data);
export const putGaji = (id, data) => api.put(`/gaji/${id}`, data);
export const deleteGaji = (id) => api.delete(`/gaji/${id}`);

export const getBelanjaMaterial = (params) => api.get('/belanja-material', { params });
export const postBelanjaMaterial = (data) => api.post('/belanja-material', data);
export const putBelanjaMaterial = (id, data) => api.put(`/belanja-material/${id}`, data);
export const deleteBelanjaMaterial = (id) => api.delete(`/belanja-material/${id}`);

export const getStok = (params) => api.get('/stok', { params });

export const getDashboard = () => api.get('/dashboard');
export const getRekap = (params) => api.get('/rekap', { params });

export const login = (data) => api.post('/login', data);
export const getMe = () => api.get('/me');

export const getUsers = () => api.get('/users');
export const postUser = (data) => api.post('/users', data);
export const putUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
