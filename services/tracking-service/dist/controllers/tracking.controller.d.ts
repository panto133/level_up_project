import { TrackingService } from '../services/tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    findAll(page?: string, limit?: string): unknown;
    findOne(id: string): unknown;
}
