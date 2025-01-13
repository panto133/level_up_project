/**
 * health.controller.ts
 * Controller for health check endpoints
 * Provides monitoring and status information about the API Gateway
 */
import { Controller, Get } from '@nestjs/common';
import { AppConfig } from '../config/app.config';
import { Logger } from '../utils/logger';

@Controller('health')
export class HealthController {
    // Track application start time for uptime calculations
    private readonly startTime: Date = new Date();

    /**
     * Basic health check endpoint
     * @returns Simple status object indicating service health
     */
    @Get()
    getHealth() {
        return {
            status: 'ok',
            service: 'api-gateway',
            environment: AppConfig.NODE_ENV,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Detailed health check endpoint providing comprehensive service information
     * @returns Detailed status object including uptime and service connections
     */
    @Get('details')
    getHealthDetails() {
        const currentTime = new Date();
        const uptime = currentTime.getTime() - this.startTime.getTime();
        const uptimeFormatted = this.formatUptime(uptime);

        Logger.debug('Health check requested', { uptime: uptimeFormatted });

        return {
            status: 'ok',
            service: 'api-gateway',
            version: process.env.npm_package_version || '1.0.0',
            environment: AppConfig.NODE_ENV,
            timestamp: currentTime.toISOString(),
            uptime: uptimeFormatted,
            connectedServices: {
                fileProcessing: `${AppConfig.SERVICES.FILE_PROCESSING}/api/upload`,
                tracking: AppConfig.SERVICES.TRACKING,
            }
        };
    }

    /**
     * Formats uptime duration into human-readable string
     * @param uptime - Duration in milliseconds
     * @returns Formatted string (e.g., "2 days, 3 hours and 45 minutes")
     */
    private formatUptime(uptime: number): string {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        const parts: string[] = [];
        
        // Build parts array with appropriate pluralization
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (remainingHours > 0) parts.push(`${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`);
        if (remainingMinutes > 0) parts.push(`${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`);
        if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);

        // Format final string with proper grammar
        if (parts.length > 1) {
            const lastPart = parts.pop();
            return `${parts.join(', ')} and ${lastPart}`;
        }
        
        return parts[0] || '0 seconds';
    }
}