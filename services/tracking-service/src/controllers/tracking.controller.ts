// tracking.controller.ts - Controller handling HTTP requests for tracking data
import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackingService } from '../services/tracking.service';

/**
 * Controller responsible for handling all tracking-related HTTP requests
 * Routes are prefixed with 'api/tracking'
 */
@Controller('api/tracking')
export class TrackingController {
    /**
     * Constructor injects the TrackingService for handling business logic
     * @param trackingService Service containing tracking-related operations
     */
    constructor(private readonly trackingService: TrackingService) {}

    /**
     * GET endpoint to retrieve all tracking records with pagination
     * @param page Current page number (default: 1)
     * @param limit Number of items per page (default: 50)
     * @returns Paginated list of tracking records and metadata
     */
    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50'
    ) {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        return this.trackingService.findAll(pageNumber, limitNumber);
    }

    /**
     * GET endpoint to retrieve a single tracking record by ID
     * @param id UUID of the tracking record to retrieve
     * @returns Single tracking record matching the provided ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.trackingService.findOne(id);
    }
}