// tracking.service.ts - Service handling tracking business logic
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingRecord } from '../entities/tracking.entity';

/**
 * Service responsible for handling all tracking-related business logic
 * Provides methods for retrieving tracking records with pagination
 */
@Injectable()
export class TrackingService {
    /**
     * Constructor injects the TrackingRecord repository
     * @param trackingRepository TypeORM repository for TrackingRecord entities
     */
    constructor(
        @InjectRepository(TrackingRecord)
        private readonly trackingRepository: Repository<TrackingRecord>,
    ) {}

    /**
     * Retrieves a paginated list of tracking records
     * @param page Page number (default: 1)
     * @param limit Number of items per page (default: 50)
     * @returns Paginated list of tracking records with metadata
     */
    async findAll(page: number = 1, limit: number = 50) {
        // Fetch data and total count in parallel for better performance
        const [data, total] = await Promise.all([
            this.trackingRepository.find({
                skip: (page - 1) * limit,  // Calculate offset
                take: limit,               // Number of items to take
                order: {
                    createdAt: 'DESC'      // Sort by creation date, newest first
                }
            }),
            this.trackingRepository.count()
        ]);

        // Return paginated response with metadata
        return {
            data,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            itemsPerPage: limit
        };
    }

    /**
     * Retrieves a single tracking record by ID
     * @param id UUID of the tracking record to retrieve
     * @returns Single tracking record or null if not found
     */
    async findOne(id: string) {
        return this.trackingRepository.findOne({ where: { id } });
    }
}