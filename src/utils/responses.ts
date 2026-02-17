import { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 500,
  errors?: unknown
) => {
  const response: { success: boolean; message: string; errors?: unknown } = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};
