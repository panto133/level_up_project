/**
 * Database connection configuration using TypeORM
 * This file sets up the connection to MySQL database and defines core database settings
 */

import { DataSource } from "typeorm";
import { TrackingData } from "./entities/trackingData";
import * as dotenv from 'dotenv';
import "reflect-metadata";

// Load environment variables from .env file
dotenv.config();

// Create and export TypeORM DataSource instance
export const AppDataSource = new DataSource({
    type: "mysql",
    // Database connection parameters with fallback values
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || "levelup_db",
    
    // Database behavior configuration
    synchronize: true,    // Automatically create database schema
    logging: true,        // Log database queries and errors
    
    // Entity configuration
    entities: [TrackingData],  // Database models/entities
    migrations: [],            // Database migrations
    subscribers: [],           // Event subscribers
    
    // Character set and timezone configuration for proper text handling
    charset: 'utf8mb4',        // Support full UTF-8 character set including emojis
    timezone: '+01:00',        // Set timezone for date/time operations
});

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source initialized");
    })
    .catch((error) => {
        console.error("Error initializing Data Source:", error);
    });