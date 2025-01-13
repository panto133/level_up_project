/**
 * app.service.ts
 * Basic service providing health check functionality
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Simple health check endpoint
  getHello(): string {
    return 'API Gateway is running!';
  }
}