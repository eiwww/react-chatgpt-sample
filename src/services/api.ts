import axios, { type AxiosResponse } from 'axios'
import type { User, AuthResponse, UpdateProfileRequest } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username: string, password: string): Promise<AxiosResponse<AuthResponse>> => 
    api.post('/user/login', { username, password }),

  updateProfile: async (token: string, userId: string, data: UpdateProfileRequest): Promise<AxiosResponse<User>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.profileImage) {
      data.profileImage.forEach(file => {
        formData.append('image', file);
      });
    }
    const response = await api.put(`/user/${userId}`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  validateToken: (token: string): Promise<User> =>
    api.get('/user/current', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => response.data),
}

export const chatAPI = {
  getChats: (token: string) => api.get('/chat', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => response.data),
  getChatMessages: (token: string, chatId: string) => api.get(`/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => response.data),
  deleteChat: (token: string, chatId: string) => api.delete(`/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => response.data),
}

export default api