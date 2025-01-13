/**
 * Root module of the File Processing Service
 * Configures all dependencies, database connections, and service providers
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './controllers/fileController';
import { FileProcessingService } from './services/fileProcessingService';
import { FileParser } from './utils/fileParser';
import { DateTimeValidator } from './utils/dateTimeValidator';
import { TrackingData } from './entities/trackingData';
import { fileProcessingConfig } from './config/file-processing.config';
import { providerConfig } from './config/provider.config';

@Module({
  imports: [
    // Global configuration module setup
    ConfigModule.forRoot({
      isGlobal: true,  // Make configuration accessible throughout the app
      load: [fileProcessingConfig, providerConfig], // Load custom configuration
    }),
    
    // Database connection configuration using TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        // Database connection parameters from environment
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [TrackingData],
        synchronize: true,
        charset: 'utf8mb4',
        timezone: '+01:00',
      }),
      inject: [ConfigService],
    }),
    
    // Register TrackingData entity with TypeORM
    TypeOrmModule.forFeature([TrackingData]),
  ],
  
  // Register HTTP controllers
  controllers: [FileController],
  
  // Register service providers
  providers: [
    FileProcessingService,  // Handles file processing logic
    FileParser,            // Parses Excel files
    DateTimeValidator,     // Validates date/time fields
  ],
})
export class AppModule {}