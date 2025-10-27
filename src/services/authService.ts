// Authentication Service
import { apiClient } from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', credentials);
    apiClient.setToken(response.data.token);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);
    apiClient.setToken(response.data.token);
    return response.data;
  },

  async logout() {
    apiClient.setToken(null);
  },

  async getCurrentUser() {
    const response = await apiClient.get<{ data: AuthResponse['user'] }>('/auth/me');
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },
};
