import axios from 'axios';

// Dinamik API URL - boshqa PC'dan ham ishlaydi
const API_URL = `http://${window.location.hostname}:3001/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  register: (fullName: string, phone: string, password: string) => api.post('/auth/register', { fullName, phone, password }),
  getMe: () => api.get('/auth/me'),
};

// Sections (Bo'limlar)
export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  getOne: (id: string) => api.get(`/sections/${id}`),
  create: (data: { name: string; icon?: string; color?: string }) => api.post('/sections', data),
  update: (id: string, data: { name: string; icon?: string; color?: string }) => api.put(`/sections/${id}`, data),
  delete: (id: string) => api.delete(`/sections/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: (sectionId?: string) => api.get('/categories', { params: { sectionId } }),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: { sectionId?: string; name: string; description?: string; icon?: string; color?: string }) => api.post('/categories', data),
  update: (id: string, data: { sectionId?: string; name: string; description?: string; icon?: string; color?: string }) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Lessons
export const lessonsAPI = {
  getAll: (categoryId?: string) => api.get('/lessons', { params: { categoryId } }),
  getOne: (id: string) => api.get(`/lessons/${id}`),
  create: (data: { categoryId: string; title: string; content?: string; duration?: string; type?: string; videoUrl?: string }) => api.post('/lessons', data),
  update: (id: string, data: { title: string; content?: string; duration?: string; type?: string; orderIndex?: number; videoUrl?: string }) => api.put(`/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/lessons/${id}`),
};

// Users (admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  updateSubscription: (id: string, data: { isSubscribed: boolean; days?: number }) => api.put(`/users/${id}/subscription`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getMySubscription: () => api.get('/users/me/subscription'),
};

// Upload
export const uploadAPI = {
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteVideo: (filename: string) => api.delete(`/upload/video/${filename}`),
};

// AI Chat
export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),
};

export default api;
