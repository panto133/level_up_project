// app.module.ts - Main application module configuration
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './controllers/tracking.controller';
import { TrackingService } from './services/tracking.service';
import { TrackingRecord } from './entities/tracking.entity';
import { databaseConfig } from './config/database.config';
import { ConfigurationModule } from './config/configuration.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';

/**
 * Main application module that configures:
 * - Database connection and entities
 * - Controllers for handling HTTP requests
 * - Services for business logic
 * - Exception filters for error handling
 * - Environment configuration
 */
@Module({
    imports: [
        ConfigurationModule,                               // Load environment configuration
        TypeOrmModule.forRoot(databaseConfig),            // Configure database connection
        TypeOrmModule.forFeature([TrackingRecord])        // Register tracking entity repository
    ],
    controllers: [TrackingController],                    // Register HTTP request handlers
    providers: [
        TrackingService,                                  // Register business logic service
        {
            provide: APP_FILTER,                          // Register global exception filter
            useClass: HttpExceptionFilter,
        }
    ],
})
export class AppModule {}