/**
 * proxy.service.ts
 * Service handling communication with microservices
 * Implements core business logic for file processing and tracking
 */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { AppConfig } from '../../config/app.config';
import { Logger } from '../../utils/logger';
import { ErrorHandler } from '../../utils/error.handler';
import { FileUploadResponse, FileUploadOptions, TrackingResponse } from '../../interfaces/file.interface';

@Injectable()
export class ProxyService {
    constructor(private readonly httpService: HttpService) {}

    /**
     * Handles file upload process to file processing service
     * @param file - The file to be uploaded
     * @param options - Upload options (validation, confirmation)
     * @returns Promise containing the processing results
     */
    async handleFileUpload(
        file: Express.Multer.File,
        options: FileUploadOptions,
    ): Promise<FileUploadResponse> {
        try {
            // Monitor file size and log appropriate warnings
            const fileSizeKB = file.size / 1024;
            Logger.info(`Processing file upload request`, {
                filename: file.originalname,
                fileSize: `${fileSizeKB.toFixed(2)} KB`,
                options,
            });

            // Warn about potential delays for large files
            if (fileSizeKB > 150) {
                Logger.info(`Processing large file, this may take several seconds`, {
                    filename: file.originalname,
                    fileSize: `${fileSizeKB.toFixed(2)} KB`,
                });
            }

            // Prepare and send the upload request
            const formData = await this.createFormData(file);
            const url = this.buildUploadUrl(options);
            const startTime = Date.now();
            const response = await this.sendUploadRequest(url, formData);
            
            // Log processing metrics
            const processingTime = (Date.now() - startTime) / 1000;
            Logger.info(`File processing completed`, {
                filename: file.originalname,
                processingTime: `${processingTime.toFixed(2)} seconds`,
                rowsProcessed: response.data?.validRows || 0,
            });

            return response.data;
        } catch (error) {
            // Enhanced error handling for timeouts
            if (error.code === 'ECONNABORTED') {
                Logger.error(`Request timed out while processing file`, {
                    filename: file.originalname,
                    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
                    timeout: `${this.httpService.axiosRef.defaults.timeout / 1000} seconds`,
                });
            }
            return ErrorHandler.handleServiceError(error, 'File Processing');
        }
    }

    /**
     * Forwards tracking-related requests to tracking service
     * @param req - The original request to be forwarded
     * @returns Promise containing tracking data
     */
    async forwardToTracking(req: Request): Promise<TrackingResponse> {
        try {
            const targetUrl = `${AppConfig.SERVICES.TRACKING}${req.url}`;
            Logger.debug('Forwarding request to tracking service', { targetUrl });

            const response = await firstValueFrom(this.httpService.get(targetUrl));
            
            return this.transformTrackingResponse(response.data);
        } catch (error) {
            return ErrorHandler.handleServiceError(error, 'Tracking');
        }
    }

    /**
     * Creates FormData object for file upload
     * @param file - The file to be included in the form
     */
    private async createFormData(file: Express.Multer.File): Promise<FormData> {
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('file', blob, file.originalname);
        return formData;
    }

    /**
     * Builds the upload URL with appropriate query parameters
     * @param options - Upload options to be included in URL
     */
    private buildUploadUrl(options: FileUploadOptions): string {
        const baseUrl = `${AppConfig.SERVICES.FILE_PROCESSING}/api/upload`;
        const queryParams = [];
        
        if (options.validate) queryParams.push('validate=true');
        if (options.confirm) queryParams.push('confirm=true');
        
        return queryParams.length > 0 ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;
    }

    /**
     * Sends the actual upload request to the file processing service
     * @param url - Target URL
     * @param formData - Form data containing the file
     */
    private async sendUploadRequest(url: string, formData: FormData) {
        return firstValueFrom(
            this.httpService.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        );
    }

    /**
     * Transforms tracking service response into standardized format
     * @param response - Raw response from tracking service
     * @returns Standardized tracking response
     */
    private transformTrackingResponse(response: any): TrackingResponse {
        return {
            data: Array.isArray(response.data) ? response.data : [response.data],
            total: response.total || (Array.isArray(response.data) ? response.data.length : 1),
        };
    }
}