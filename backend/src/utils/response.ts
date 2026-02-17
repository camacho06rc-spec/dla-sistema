import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function successResponse<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  
  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

export function errorResponse(res: Response, error: string, statusCode = 400): void {
  const response: ApiResponse = {
    success: false,
    error,
  };

  res.status(statusCode).json(response);
}
