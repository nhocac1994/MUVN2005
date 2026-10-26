import { getBackendBaseUrl } from '@/config/backend.config';

/**
 * API Client — gọi trực tiếp backend (cùng base URL với getBackendUrl / BACKEND_API_URL).
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Account {
  username: string;
  characterName: string;
  email: string;
  createdDate?: string;
  blockStatus: number;
  accountLevel: number;
  accountExpireDate?: string;
}

export interface Character {
  name: string;
  level: number;
  class: number;
  resetCount: number;
  masterResetCount: number;
  money: number;
  mapNumber: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UpdatePasswordRequest {
  accountId: string;
  newPassword: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = getBackendBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Đăng nhập
   */
  async login(username: string, password: string): Promise<ApiResponse<Account>> {
    return this.request<Account>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /**
   * Lấy thông tin account
   */
  async getAccount(accountId: string): Promise<ApiResponse<Account>> {
    return this.request<Account>(`/api/account/${accountId}`);
  }

  /**
   * Cập nhật mật khẩu
   */
  async updatePassword(accountId: string, newPassword: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/api/account/password', {
      method: 'PUT',
      body: JSON.stringify({ accountId, newPassword }),
    });
  }

  /**
   * Lấy danh sách characters
   */
  async getCharacters(accountId: string): Promise<ApiResponse<Character[]>> {
    return this.request<Character[]>(`/api/character/${accountId}`);
  }

  /**
   * Lấy dashboard data (account + characters)
   */
  async getDashboard(accountId: string): Promise<ApiResponse<{ account: Account; characters: Character[] }>> {
    return this.request<{ account: Account; characters: Character[] }>(`/api/dashboard/${accountId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

