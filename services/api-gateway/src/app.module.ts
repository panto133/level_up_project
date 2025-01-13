/**
 * app.module.ts
 * Root module of the API Gateway
 * Configures dependencies and defines the application structure
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './controllers/health.controller';
import { ProxyController } from './controllers/proxy.controller';
import { ProxyService } from './services/proxy/proxy.service';

@Module({
  imports: [
    // Configure environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,  // Make config available throughout the app
      cache: true,     // Cache config values for better performance
    }),
    // Configure HTTP client for making requests to other services
    HttpModule.register({
      timeout: 60000,           // 60 second timeout
      maxRedirects: 5,          // Allow up to 5 redirects
      maxContentLength: Infinity,// No limit on response size
      validateStatus: (status) => status < 500, // Consider only 500+ as errors
    }),
  ],
  controllers: [HealthController, ProxyController],
  providers: [ProxyService],
})
export class AppModule {}