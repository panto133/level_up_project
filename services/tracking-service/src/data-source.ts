// data-source.ts - TypeORM database connection configuration
import { DataSource } from "typeorm";
import { TrackingRecord } from "./entities/tracking.entity";

/**
 * TypeORM DataSource configuration for the database connection
 * This defines all database-related settings including:
 * - Connection details (host, port, credentials)
 * - Database type and name
 * - Entity definitions
 * - Development features (logging, synchronization)
 */
export const AppDataSource = new DataSource({
    type: "mysql",                                          // Database type
    host: process.env.DB_HOST || "localhost",              // Database host
    port: parseInt(process.env.DB_PORT || "3307"),         // Database port
    username: process.env.DB_USERNAME || "root",           // Database username
    password: process.env.DB_PASSWORD || "root",           // Database password
    database: process.env.DB_DATABASE || "levelup_db",     // Database name
    synchronize: true,                                     // Auto-create database schema
    logging: true,                                         // Enable SQL query logging
    entities: [TrackingRecord],                           // Entity classes to be included
    subscribers: [],                                       // TypeORM subscribers
    migrations: [],                                        // Database migrations
});