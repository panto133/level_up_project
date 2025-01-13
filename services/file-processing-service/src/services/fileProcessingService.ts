/**
 * File Processing Service
 * The service supports multiple shipping providers (DHL, Hellmann, Logwin) and can handle
 * both direct processing and a two-step validation/confirmation flow.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { TrackingData } from '../entities/trackingData';
import { FileParser } from '../utils/fileParser';
import { DateTimeValidator } from '../utils/dateTimeValidator';

/**
 * Represents the result of a file processing operation.
 * Used to communicate success/failure and processing statistics.
 */
interface ProcessingResult {
    filename: string;         // Original name of the processed file
    validRows: number;        // Number of successfully processed records
    invalidRows: number;      // Number of records that failed validation
    processedAt: Date;        // Timestamp of processing completion
    status: 'success' | 'error';  // Overall processing status
    errorMessage?: string;    // Description of error if processing failed
}

/**
 * Contains the results of data validation, separating valid and invalid records
 * and maintaining reasons for validation failures.
 */
interface ValidationResult {
    validRecords: TrackingData[];     // Records that passed all validation checks
    invalidRecords: TrackingData[];   // Records that failed validation
    invalidReasons: string[];         // Corresponding error messages for invalid records
}

@Injectable()
export class FileProcessingService {
    private readonly logger = new Logger(FileProcessingService.name);
    
    // Stores validation results for the two-step validation/confirmation process
    private readonly validationResults: Map<string, ValidationResult>;
    
    // Directory where processing logs will be stored
    private readonly logsDirectory: string;

    constructor(
        @InjectRepository(TrackingData)
        private readonly trackingDataRepository: Repository<TrackingData>,
        private readonly configService: ConfigService,
        private readonly fileParser: FileParser,
        private readonly dateTimeValidator: DateTimeValidator
    ) {
        this.validationResults = new Map();
        
        // Configure logs directory from environment or use default
        this.logsDirectory = path.join(
            __dirname,
            '../../',
            this.configService.get('fileProcessing.logsDirectory', 'logs')
        );
        this.ensureLogsDirectory();
    }

    /**
     * Creates the logs directory if it doesn't exist.
     * This ensures we have a place to store processing logs before any operations begin.
     */
    private ensureLogsDirectory(): void {
        if (!fs.existsSync(this.logsDirectory)) {
            fs.mkdirSync(this.logsDirectory, { recursive: true });
        }
    }

    /**
     * Main method for processing uploaded Excel files.
     * Handles both validation-only mode and full processing mode.
     * 
     * In validation-only mode (validateOnly = true):
     * - Validates the file and records without saving to database
     * - Stores validation results for later confirmation
     * 
     * In full processing mode (validateOnly = false):
     * - Validates and processes the file
     * - Saves valid records to database
     * - Generates processing logs
     * 
     * @param file - The uploaded Excel file to process
     * @param validateOnly - If true, only performs validation without saving
     * @returns ProcessingResult containing status and statistics
     */
    public async processFile(
        file: Express.Multer.File,
        validateOnly = false
    ): Promise<ProcessingResult> {
        try {
            this.logger.debug(`Processing file: ${file.originalname} (validateOnly: ${validateOnly})`);
    
            // Determine the shipping provider from the filename
            const provider = this.detectProvider(file.originalname);
            if (!provider) {
                throw new Error('Unable to determine file provider.');
            }
    
            // Parse the Excel file into tracking records
            const records = await this.fileParser.parseExcelFile(file.buffer, provider);
            if (!records || records.length === 0) {
                throw new Error('No records found in file.');
            }
    
            // Validate all records
            const validationResult = this.validateRecords(records);
            this.logger.debug(
                `Validation results: ${validationResult.validRecords.length} valid, ` +
                `${validationResult.invalidRecords.length} invalid`
            );
    
            // Handle validation-only mode
            if (validationResult.invalidRecords.length > 0 && validateOnly) {
                // Store results for later confirmation
                const fileKey = `${file.originalname}_${Date.now()}`;
                this.validationResults.set(fileKey, validationResult);
                this.logger.debug(`Stored validation results for key: ${fileKey}`);
            } else {
                // Process valid records if any exist
                if (validationResult.validRecords.length > 0) {
                    this.logger.debug(`Saving ${validationResult.validRecords.length} valid records`);
                    await this.saveRecords(validationResult.validRecords);
                    
                    // Generate processing log
                    await this.createLogFile(
                        file.originalname,
                        provider,
                        records.length,
                        validationResult
                    );
                }
            }
    
            // Return processing results
            return {
                filename: file.originalname,
                validRows: validationResult.validRecords.length,
                invalidRows: validationResult.invalidRecords.length,
                processedAt: new Date(),
                status: 'success'
            };
        } catch (error) {
            this.logger.error('File processing error:', error);
            return {
                filename: file.originalname,
                validRows: 0,
                invalidRows: 0,
                processedAt: new Date(),
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Determines the shipping provider from the filename.
     * Supports DHL, Hellmann, and Logwin providers.
     * 
     * @param filename - Name of the uploaded file
     * @returns Provider name or null if provider cannot be determined
     */
    private detectProvider(filename: string): string | null {
        const lowerCaseName = filename.toLowerCase();
        if (lowerCaseName.includes('dhl')) return 'DHL';
        if (lowerCaseName.includes('hellmann')) return 'Hellmann';
        if (lowerCaseName.includes('logwin')) return 'Logwin';
        return null;
    }

    /**
     * Validates a batch of tracking records.
     * Separates records into valid and invalid groups based on validation rules.
     * 
     * @param records - Array of tracking records to validate
     * @returns ValidationResult containing valid and invalid records with error reasons
     */
    private validateRecords(records: TrackingData[]): ValidationResult {
        const validRecords: TrackingData[] = [];
        const invalidRecords: TrackingData[] = [];
        const invalidReasons: string[] = [];

        for (const record of records) {
            const errors = this.validateRecord(record);
            
            if (errors.length > 0) {
                invalidRecords.push(record);
                invalidReasons.push(errors.join('. '));
                this.logger.debug(`Record invalid with errors: ${errors.join(', ')}`);
            } else {
                validRecords.push(record);
                this.logger.debug('Record valid');
            }
        }

        return { validRecords, invalidRecords, invalidReasons };
    }

    /**
     * Validates a single tracking record against all business rules.
     * Checks include:
     * - Date field validations and relationships
     * - Weight and package number validations
     * - Required field presence
     * 
     * @param record - Single tracking record to validate
     * @returns Array of error messages (empty if record is valid)
     */
    private validateRecord(record: TrackingData): string[] {
        const errors: string[] = [];
        this.logger.debug('Validating record:', record);

        // Validate all date fields
        const dateFields = {
            pickupDate: { value: record.pickupDate, name: 'Pickup Date' },
            eta: { value: record.eta, name: 'ETA' },
            etd: { value: record.etd, name: 'ETD' },
            ata: { value: record.ata, name: 'ATA' },
            atd: { value: record.atd, name: 'ATD' }
        };

        // Store validated dates for relationship checks
        const validatedDates: { [key: string]: Date | null } = {};

        // Validate each date field
        for (const [field, { value, name }] of Object.entries(dateFields)) {
            if (value) {
                this.logger.debug(`Validating ${name}:`, value);
                const validationResult = this.dateTimeValidator.validateDateValue(value, name);
                if (!validationResult.isValid && validationResult.error) {
                    this.logger.debug(`${name} validation failed:`, validationResult.error);
                    errors.push(validationResult.error);
                } else if (validationResult.parsedDate) {
                    this.logger.debug(`${name} validated successfully:`, validationResult.parsedDate);
                }
                validatedDates[field] = validationResult.parsedDate;
            }
        }

        // Validate date relationships
        this.validateDateRelationships(validatedDates, errors);

        // Validate numeric fields
        this.validateNumericFields(record, errors);

        // Validate required fields
        if (!record.houseAwb) {
            errors.push('House AWB is required');
        }

        return errors;
    }

    /**
     * Validates relationships between dates in a tracking record.
     * Ensures logical date ordering (e.g., ETD before ETA).
     * 
     * @param dates - Object containing validated dates
     * @param errors - Array to collect validation errors
     */
    private validateDateRelationships(
        dates: { [key: string]: Date | null },
        errors: string[]
    ): void {
        // Check ETD/ETA relationship
        if (dates.etd && dates.eta) {
            const relationError = this.dateTimeValidator.validateDateRelationship(
                dates.etd,
                dates.eta,
                'ETD',
                'ETA'
            );
            if (relationError) errors.push(relationError);
        }

        // Check ATD/ATA relationship
        if (dates.atd && dates.ata) {
            const relationError = this.dateTimeValidator.validateDateRelationship(
                dates.atd,
                dates.ata,
                'ATD',
                'ATA'
            );
            if (relationError) errors.push(relationError);
        }
    }

    /**
     * Validates numeric fields in a tracking record.
     * Checks weight and package count for valid values.
     * 
     * @param record - Tracking record to validate
     * @param errors - Array to collect validation errors
     */
    private validateNumericFields(record: TrackingData, errors: string[]): void {
        // Validate weight
        if (record.weight) {
            const weightNum = parseFloat(String(record.weight).replace(/[^\d.]/g, ''));
            if (isNaN(weightNum) || weightNum <= 0) {
                errors.push('Weight must be a positive number');
            }
        }

        // Validate packages
        if (record.packages !== undefined && record.packages !== null) {
            if (!Number.isInteger(record.packages) || record.packages <= 0) {
                errors.push('Packages must be a positive integer');
            }
        }
    }

    /**
     * Saves valid records to the database in chunks to manage memory usage.
     * 
     * @param records - Array of valid tracking records to save
     * @throws Error if database operation fails
     */
    private async saveRecords(records: TrackingData[]): Promise<void> {
        const chunkSize = this.configService.get('fileProcessing.chunkSize', 100);
        this.logger.debug(`Saving records in chunks of ${chunkSize}`);
        
        for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);
            this.logger.debug(`Saving chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(records.length/chunkSize)}`);
            try {
                if (chunk.length > 0) {
                    this.logger.debug('Sample record from chunk:', JSON.stringify(chunk[0]));
                }
                await this.trackingDataRepository.save(chunk);
                this.logger.debug(`Successfully saved chunk of ${chunk.length} records`);
            } catch (error) {
                this.logger.error(`Error saving chunk: ${error}`);
                throw error;
            }
        }
    }

    /**
     * Creates a processing log file for audit purposes.
     * Logs include processing timestamp, counts, and details of all records.
     * 
     * @param filename - Original filename
     * @param provider - Shipping provider
     * @param totalRecords - Total number of records processed
     * @param validationResult - Results of validation
     */
    private async createLogFile(
        filename: string,
        provider: string,
        totalRecords: number,
        validationResult: ValidationResult
    ): Promise<void> {
        try {
            const timestamp = new Date();
            const logFileName = this.formatLogFileName(provider, timestamp);
            const logContent = this.generateLogContent(
                filename,
                timestamp,
                totalRecords,
                validationResult
            );

            await fs.promises.writeFile(
                path.join(this.logsDirectory, logFileName),
                logContent
            );
            this.logger.debug(`Created log file: ${logFileName}`);
        } catch (error) {
            this.logger.error('Error creating log file:', error);
        }
    }

    /**
     * Formats the log filename with timestamp and provider information.
     * Format: "Provider DD.MM.YYYY hh.mm.ss.log"
     * 
     * @param provider - Shipping provider name
     * @param timestamp - Processing timestamp
     * @returns Formatted log filename
     */
    private formatLogFileName(provider: string, timestamp: Date): string {
        const day = String(timestamp.getDate()).padStart(2, '0');
        const month = String(timestamp.getMonth() + 1).padStart(2, '0');
        const year = timestamp.getFullYear();
        const hours = String(timestamp.getHours()).padStart(2, '0');
        const minutes = String(timestamp.getMinutes()).padStart(2, '0');
        const seconds = String(timestamp.getSeconds()).padStart(2, '0');

        return `${provider} ${day}.${month}.${year} ${hours}.${minutes}.${seconds}.log`;
    }

    /**
     * Generates the content for the processing log file.
     * Creates a detailed audit log containing:
     * - File processing metadata (filename, timestamp)
     * - Summary statistics (total, valid, and invalid record counts)
     * - Detailed information for each processed record
     * - Error reasons for invalid records
     * 
     * @param filename - Name of the processed file
     * @param timestamp - When the processing occurred
     * @param totalRecords - Total number of records in the file
     * @param validationResult - Results of the validation process
     * @returns Formatted log content as a string
     */
    private generateLogContent(
        filename: string,
        timestamp: Date,
        totalRecords: number,
        validationResult: ValidationResult
    ): string {
        const { validRecords, invalidRecords, invalidReasons } = validationResult;

        // Build log content sections
        const content = [
            // Header section with summary information
            `File Name: ${filename}`,
            `Processed At: ${timestamp.toLocaleString('en-GB')}`,
            `Total Rows: ${totalRecords}`,
            `Valid Rows: ${validRecords.length}`,
            `Invalid Rows: ${invalidRecords.length}`,
            '',
            // Detailed record information section
            'Detailed Row Information:',
            // Include all valid records with their data
            ...validRecords.map(record => `Valid: ${JSON.stringify(record)}`),
            // Include invalid records with their error reasons
            ...invalidRecords.map((record, index) =>
                `Invalid: ${JSON.stringify(record)} | Reason: ${invalidReasons[index]}`
            )
        ];

        // Join all sections with newlines
        return content.join('\n');
    }
}