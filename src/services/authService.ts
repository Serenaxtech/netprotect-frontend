interface LoginResponse {
  message: string;
  error?: string;
}

interface AuthUser {
  role: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const AUTH_ENDPOINT = `${BASE_URL}/user`;

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${AUTH_ENDPOINT}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${AUTH_ENDPOINT}/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async checkAuth(): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${AUTH_ENDPOINT}/check-auth`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  }
};