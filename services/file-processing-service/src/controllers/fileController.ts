/**
 * File Controller
 * Handles HTTP requests for file uploads and processing in the File Processing Service
 * This controller manages the upload endpoint and coordinates with the FileProcessingService
 */

import { 
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Query,
    BadRequestException,
    InternalServerErrorException,
    Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FileProcessingService } from '../services/fileProcessingService';
import { multerConfig } from '../config/multer.config';

/**
 * Controller handling file upload endpoints under /api/upload
 * Provides functionality for file validation and processing
 */
@Controller('api/upload')
export class FileController {
    private readonly logger = new Logger(FileController.name);

    constructor(
        private readonly fileProcessingService: FileProcessingService
    ) {}

    /**
     * Handles file upload requests with optional validation and confirmation steps
     * 
     * @param file - The uploaded Excel file
     * @param validate - Query parameter indicating if this is a validation request
     * @param confirm - Query parameter indicating if this is a confirmation request
     * 
     * The upload process can work in two modes:
     * 1. Direct upload (validate=false): File is processed and saved immediately
     * 2. Validation flow (validate=true):
     *    - First request (validate=true, confirm=false): Only validates the file
     *    - Second request (validate=true, confirm=true): Processes and saves the file
     * 
     * @throws BadRequestException if no file is provided or validation fails
     * @throws InternalServerErrorException for unexpected processing errors
     * @returns ProcessingResult with status and processing details
     */
    @Post()
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('validate') validate?: string,
        @Query('confirm') confirm?: string
    ) {
        try {
            // Verify file presence
            if (!file) {
                throw new BadRequestException('No file provided');
            }

            // Parse validation flow parameters
            const isValidation = validate === 'true';
            const isConfirmation = confirm === 'true';

            // Log processing attempt with mode
            this.logger.log(`Processing file: ${file.originalname}`, {
                isValidation,
                isConfirmation
            });

            // Process file based on mode (validation or confirmation)
            const result = await this.fileProcessingService.processFile(
                file,
                isValidation && !isConfirmation  // Validate only if in validation phase and not confirmation
            );

            // Handle successful processing
            if (result.status === 'success') {
                return {
                    status: 'success',
                    message: 'File processed successfully',
                    ...result
                };
            } else {
                // Handle processing errors
                throw new BadRequestException(result.errorMessage || 'Error processing file');
            }
        } catch (error) {
            // Log error details
            this.logger.error('Error processing upload:', error);

            // Preserve BadRequestException for validation errors
            if (error instanceof BadRequestException) {
                throw error;
            }

            // Wrap unexpected errors
            throw new InternalServerErrorException(
                'An error occurred while processing the file'
            );
        }
    }
}