// app.controller.ts - Basic controller serving as a health check endpoint
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root level controller that provides basic application endpoints
 * Typically used for health checks and simple API verification
 */
@Controller()
export class AppController {
    /**
     * Constructor injects the AppService
     * This is an example of dependency injection in NestJS
     * @param appService Service containing the business logic
     */
    constructor(private readonly appService: AppService) {}

    /**
     * Simple GET endpoint that returns a test message
     * @returns {string} A simple greeting message from the AppService
     */
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}