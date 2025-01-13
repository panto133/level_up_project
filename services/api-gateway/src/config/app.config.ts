/**
 * config/app.config.ts
 * Central configuration file defining application settings
 */
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Define CORS configuration with proper typing
const corsConfig: CorsOptions = {
    origin: process.env.CORS_ORIGIN || true,  // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,  // Allow credentials (cookies, auth headers)
};

// Application configuration object
export const AppConfig = {
    // Server settings
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // CORS settings
    CORS: corsConfig,

    // Microservice endpoints
    SERVICES: {
        FILE_PROCESSING: process.env.FILE_PROCESSING_URL || 'http://localhost:3002',
        TRACKING: process.env.TRACKING_SERVICE_URL || 'http://localhost:3003',
    },

    // Request validation settings
    VALIDATION: {
        transform: true,               // Transform payloads to DTO instances
        whitelist: true,              // Strip unknown properties
        forbidNonWhitelisted: true,   // Reject requests with unknown properties
    },
};

// Export type for TypeScript support
export type AppConfigType = typeof AppConfig;