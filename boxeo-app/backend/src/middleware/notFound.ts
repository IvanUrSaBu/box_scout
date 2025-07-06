import { Request, Response } from 'express';
import { ApiResponse } from 'boxeo-shared';

export const notFound = (req: Request, res: Response<ApiResponse<null>>) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};