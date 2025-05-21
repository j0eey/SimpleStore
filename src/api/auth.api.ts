import api from '../api/apiClient';
import { AxiosError } from 'axios';

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const signupApi = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<ApiResponse<{ email: string }>> => {
  try {
    const response = await api.post('/api/auth/signup', {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error('An unknown error occurred during signup');
  }
};

export const loginApi = async (
  email: string, 
  password: string
): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error('An unknown error occurred during login');
  }
};

export const refreshTokenApi = async (refreshToken: string) => {
  const response = await api.post('/api/auth/refresh-token', {
    refreshToken,
  });
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await api.post('/api/auth/forgot-password', {
    email,
  });
  return response.data;
};

export const verifyOtpApi = async (
  email: string,
  otp: string
): Promise<ApiResponse<{ isEmailVerified: boolean }>> => {
  try {
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error('An unknown error occurred during OTP verification');
  }
};

export const resendVerificationOtpApi = async (
  email: string
): Promise<ApiResponse> => {
  try {
    const response = await api.post('/api/auth/resend-verification-otp', { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error('An unknown error occurred while resending OTP');
  }
};