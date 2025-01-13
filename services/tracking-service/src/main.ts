// main.ts - Entry point for the Tracking Service application
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { Logger } from '@nestjs/common';

/**
 * Bootstrap function to initialize and start the NestJS application
 * This function handles: Application creation and configuration,
 * Database connection initialization and Server startup
 */
async function bootstrap() {
    // Create a logger instance for startup logging
    const logger = new Logger('Bootstrap');
    
    try {
        // Create a new NestJS application instance
        const app = await NestFactory.create(AppModule);
        
        // Enable CORS for cross-origin requests
        app.enableCors();

        // Initialize the TypeORM database connection
        await AppDataSource.initialize();
        logger.log('Data Source has been initialized successfully');

        // Start the server on the specified port (default: 3003)
        const port = process.env.PORT || 3003;
        await app.listen(port);
        logger.log(`Application is running on port ${port}`);
    } catch (error) {
        // Log any startup errors and exit the process
        logger.error(`Error starting application: ${error.message}`);
        process.exit(1);
    }
}

// Execute the bootstrap function to start the application
bootstrap();