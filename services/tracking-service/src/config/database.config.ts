// database.config.ts - Database connection configuration
import { DataSourceOptions } from 'typeorm';
import { TrackingRecord } from '../entities/tracking.entity';

/**
 * TypeORM database configuration options
 * Defines all settings needed for database connection including:
 * - Connection parameters
 * - Credentials
 * - Entity definitions
 * - Character encoding and timezone settings
 */
export const databaseConfig: DataSourceOptions = {
    type: 'mysql',                                         // Database type
    host: process.env.DB_HOST || 'localhost',             // Database host from env
    port: parseInt(process.env.DB_PORT || '3307'),        // Database port from env
    username: process.env.DB_USER || 'root',              // Database username from env
    password: process.env.DB_PASSWORD || 'root',          // Database password from env
    database: process.env.DB_NAME || 'levelup_db',        // Database name from env
    entities: [TrackingRecord],                           // Entity to be included in the database
    synchronize: true,                                    // Auto-generate database schema 
    charset: 'utf8mb4',                                   // Character encoding for proper text handling
    timezone: '+01:00',                                   // Timezone setting for Serbia (CET)
};