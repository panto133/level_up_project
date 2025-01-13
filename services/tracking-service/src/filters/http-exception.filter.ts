// http-exception.filter.ts - Global exception filter for HTTP errors
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { TrackingErrorDto } from '../dto/tracking-error.dto';

/**
 * Global exception filter that catches all HttpExceptions
 * Transforms exceptions into a standardized error response format
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    /**
     * Catches and formats HTTP exceptions
     * @param exception The thrown HTTP exception
     * @param host ArgumentsHost containing the HTTP context
     */
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        // Create standardized error response
        const errorResponse: TrackingErrorDto = {
            statusCode: status,
            message: exception.message,
        };

        // Send formatted error response
        response
            .status(status)
            .json(errorResponse);
    }
}