// app.service.ts - Basic service implementation for testing/health checks
import { Injectable } from '@nestjs/common';

/**
 * Basic application service that provides a simple health check endpoint
 * This service can be expanded to include common functionality used across the application
 */
@Injectable()
export class AppService {
  /**
   * Simple method that returns a test message
   * Can be used to verify the application is running correctly
   * @returns {string} A test message
   */
  getHello(): string {
    return 'Hello World!';
  }
}