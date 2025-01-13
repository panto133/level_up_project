/**
 * proxy.controller.ts
 * Controller handling routing of requests to appropriate microservices
 * Acts as the main entry point for file processing and tracking operations
 */
import { 
    Controller, 
    Post,
    Get,
    UseInterceptors,
    Query,
    UploadedFile,
    Req,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Express } from 'express-serve-static-core';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ProxyService } from '../services/proxy/proxy.service';
import { Logger } from '../utils/logger';
import { FileUploadOptions } from '../interfaces/file.interface';

@Controller('api')
export class ProxyController {
    constructor(private readonly proxyService: ProxyService) {}
  
    /**
     * Handles file upload requests
     * @param file - The uploaded file
     * @param validate - Optional flag for validation mode
     * @param confirm - Optional flag for confirmation mode
     * @throws HttpException if no file is provided
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('validate') validate?: string,
        @Query('confirm') confirm?: string
    ) {
        // Validate file presence
        if (!file) {
            Logger.error('File upload attempted without file');
            throw new HttpException(
                { success: false, message: 'No file provided' },
                HttpStatus.BAD_REQUEST
            );
        }

        // Prepare options for file processing
        const options: FileUploadOptions = {
            validate: validate === 'true',
            confirm: confirm === 'true'
        };
    
        return this.proxyService.handleFileUpload(file, options);
    }

    /**
     * Routes for tracking data retrieval
     */
    @Get('tracking')
    async getAllTracking(@Req() req: Request) {
        return this.proxyService.forwardToTracking(req);
    }

    @Get('tracking/:id')
    async getTrackingById(@Req() req: Request) {
        return this.proxyService.forwardToTracking(req);
    }
}