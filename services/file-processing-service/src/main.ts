/**
 * Main entry point for the File Processing Service
 * This file bootstraps the NestJS application and configures core functionality
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Bootstraps the NestJS application
 * Handles core setup including CORS, validation pipes, and graceful shutdown
 */
async function bootstrap() {
  try {
    // Create NestJS application instance with Express as the underlying HTTP framework
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // Get ConfigService instance to access environment variables
    const configService = app.get(ConfigService);
    
    // Configure CORS to allow requests from frontend applications
    // This is necessary for browser security when frontend and backend are on different domains
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
      methods: ['GET', 'POST'],                                   // Allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'],          // Allowed headers
      credentials: true                                           // Allow credentials (cookies, auth headers)
    });

    // Set up global validation pipe for automatic request validation
    // This validates incoming requests against DTOs and transforms primitives
    app.useGlobalPipes(new ValidationPipe({
      transform: true,               // Automatically transform payloads to DTO instances
      whitelist: true,              // Strip properties not defined in DTOs
      forbidNonWhitelisted: true,   // Throw error if non-whitelisted properties are present
    }));

    // Get configured port from environment variables, default to 3002 if not set
    const port = configService.get<number>('PORT', 3002);
    
    // Start the HTTP server
    await app.listen(port);
    console.log(`File Processing Service is running on: http://localhost:${port}`);
    
    // Handle graceful shutdown on SIGTERM signal
    // This ensures ongoing operations complete before shutting down
    process.on('SIGTERM', async () => {
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    // Log any startup errors and exit with failure code
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

// Initialize the application
bootstrap().catch(err => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});