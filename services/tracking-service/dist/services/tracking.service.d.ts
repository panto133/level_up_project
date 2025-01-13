import { Repository } from 'typeorm';
import { TrackingRecord } from '../entities/tracking.entity';
export declare class TrackingService {
    private readonly trackingRepository;
    constructor(trackingRepository: Repository<TrackingRecord>);
    findAll(page?: number, limit?: number): unknown;
    findOne(id: string): unknown;
}
