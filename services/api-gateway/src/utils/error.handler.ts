/**
 * utils/error.handler.ts
 * Centralized error handling utility for consistent error management across the application.
 * Provides standardized error formatting and logging for all service-related errors.
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { ServiceError } from '../interfaces/file.interface';
import { Logger } from './logger';

export class ErrorHandler {
    /**
     * Handles errors from microservices in a consistent way
     * @param error - The caught error object
     * @param serviceName - Name of the service where the error occurred
     * @throws HttpException with standardized error format
     */
    static handleServiceError(error: any, serviceName: string): never {
        // Create standardized error response
        const errorResponse: ServiceError = {
            status: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            error: `${serviceName} service error`,
            details: error.message,
        };

        // Log the error for debugging and monitoring
        Logger.error(`${serviceName} service error`, error);

        // Throw HTTP exception with appropriate status code
        throw new HttpException(
            errorResponse,
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}