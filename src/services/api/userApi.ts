import { ApiResponse } from './types';

export interface UserCreateData {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  organizations: string[];
  password: string;
  confirm_password: string;
}

export interface UserResponse {
  message: string;
}

export interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export class UserApi {
  private static readonly USER_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/user`;

  static async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${this.USER_ENDPOINT}/all`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  static async createUser(userData: UserCreateData, userType: 'normal' | 'integrator'): Promise<ApiResponse<UserResponse>> {
    try {
      const endpoint = userType === 'normal' 
        ? this.USER_ENDPOINT 
        : `${this.USER_ENDPOINT}/${userType}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

}