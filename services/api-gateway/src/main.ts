/**
 * main.ts
 * Entry point for the API Gateway service
 * This file bootstraps the NestJS application and configures global middleware
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfig } from './config/app.config';
import { Logger } from './utils/logger';

async function bootstrap() {
  try {
    // Create a new NestJS application instance
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS with configuration from AppConfig
    // This allows the frontend to make requests to the API Gateway
    app.enableCors(AppConfig.CORS);
    
    // Configure global validation pipe for automatic request validation
    // This ensures all incoming requests are properly validated before processing
    app.useGlobalPipes(new ValidationPipe(AppConfig.VALIDATION));
    
    // Start the server on the configured port
    await app.listen(AppConfig.PORT);
    
    // Log successful startup information
    Logger.info(`API Gateway is running on port ${AppConfig.PORT}`, {
      environment: AppConfig.NODE_ENV,
      uploadEndpoint: `http://localhost:${AppConfig.PORT}/api/upload`,
    });
  } catch (error) {
    // Log startup failures and exit the process
    Logger.error('Failed to start API Gateway', error);
    process.exit(1);
  }
}

// Initialize the application
bootstrap();