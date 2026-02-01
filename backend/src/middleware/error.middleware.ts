import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseHandler.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err : null);
};
