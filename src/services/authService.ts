// Authentication Service
import { apiClient } from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    apiClient.setToken(response.token);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    apiClient.setToken(response.token);
    return response;
  },

  async logout() {
    apiClient.setToken(null);
  },

  async getCurrentUser() {
    return apiClient.get<AuthResponse['user']>('/auth/me');
  },
};
