// configuration.module.ts - Configuration module for environment variables
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Configuration module that loads and provides access to environment variables
 * Makes environment configuration available throughout the application
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,           // Make config available globally
            envFilePath: '.env',      // Load variables from .env file
        }),
    ],
})
export class ConfigurationModule {}