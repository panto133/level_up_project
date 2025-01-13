/**
 * File Parser Service
 * 
 * This service is responsible for parsing Excel files from different shipping providers
 * into standardized tracking data records.
 */

import { Injectable, Logger } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { ConfigService } from '@nestjs/config';
import { TrackingData } from '../entities/trackingData';
import { DateTimeValidator } from './dateTimeValidator';
import { ProviderConfig } from '../config/provider.config';

@Injectable()
export class FileParser {
    private readonly logger = new Logger(FileParser.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly dateTimeValidator: DateTimeValidator
    ) {}

    /**
     * Main entry point for parsing Excel files.
     * Coordinates the entire parsing process from raw buffer to tracking records.
     * 
     * @param fileBuffer - Raw buffer containing Excel file data
     * @param provider - Name of the shipping provider (e.g., 'DHL', 'Hellmann', 'Logwin')
     * @returns Promise resolving to array of parsed TrackingData records
     * @throws Error if parsing fails at any stage
     */
    public async parseExcelFile(
        fileBuffer: Buffer,
        provider: string
    ): Promise<TrackingData[]> {
        try {
            const workbook = await this.readWorkbook(fileBuffer);
            const worksheet = await this.getWorksheet(workbook, provider);
            return this.parseWorksheet(worksheet, provider);
        } catch (error) {
            this.logger.error(`Error parsing Excel file for provider ${provider}:`, error);
            throw error;
        }
    }

    /**
     * Reads an Excel workbook from a buffer using the xlsx library.
     * Configures parsing options for optimal data extraction.
     * 
     * @param fileBuffer - Raw file buffer to parse
     * @returns Promise resolving to parsed workbook
     */
    private async readWorkbook(fileBuffer: Buffer): Promise<xlsx.WorkBook> {
        return xlsx.read(fileBuffer, {
            type: 'buffer',    // Read from buffer rather than file
            cellDates: true,   // Convert date values to JavaScript Date objects
            cellNF: true,      // Keep number formats
            cellText: false    // Don't generate text version of cells
        });
    }

    /**
     * Gets the appropriate worksheet based on provider requirements.
     * Different providers may use different sheet names or positions.
     * 
     * @param workbook - Parsed Excel workbook
     * @param provider - Name of the shipping provider
     * @returns Selected worksheet for processing
     * @throws Error if required worksheet is not found
     */
    private getWorksheet(workbook: xlsx.WorkBook, provider: string): xlsx.WorkSheet {
        // Hellmann uses a specific sheet name, others use the first sheet
        const sheetName = provider === 'Hellmann' ? 'Airfreight' : workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }
        
        return worksheet;
    }

    /**
     * Parses a worksheet into tracking records.
     * Gets provider configuration and processes the worksheet in chunks.
     * 
     * @param worksheet - Excel worksheet to parse
     * @param provider - Name of the shipping provider
     * @returns Array of parsed tracking records
     */
    private parseWorksheet(worksheet: xlsx.WorkSheet, provider: string): TrackingData[] {
        const config = this.getProviderConfig(provider);
        const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        return this.processInChunks(worksheet, range, config, provider);
    }

    /**
     * Retrieves provider-specific configuration from environment.
     * This includes header mappings and row positions.
     * 
     * @param provider - Name of the shipping provider
     * @returns Provider configuration object
     * @throws Error if configuration is not found
     */
    private getProviderConfig(provider: string): ProviderConfig {
        const config = this.configService.get(`providers.${provider}`);
        if (!config) {
            throw new Error(`No configuration found for provider: ${provider}`);
        }
        return config;
    }

    /**
     * Processes worksheet data in manageable chunks to avoid memory issues.
     * This is crucial for handling large Excel files efficiently.
     * 
     * @param worksheet - Excel worksheet to process
     * @param range - Range of cells containing data
     * @param config - Provider-specific configuration
     * @param provider - Name of the shipping provider
     * @returns Array of all parsed tracking records
     */
    private processInChunks(
        worksheet: xlsx.WorkSheet,
        range: xlsx.Range,
        config: ProviderConfig,
        provider: string
    ): TrackingData[] {
        const chunkSize = this.configService.get('fileProcessing.chunkSize', 1000);
        const headers = this.extractHeaders(worksheet, config.headerRow, range);
        const records: TrackingData[] = [];

        this.logger.debug('Extracted headers:', headers);
        this.logger.debug('Provider config mapping:', config.mapping);

        // Process rows in chunks to manage memory usage
        for (let row = config.dataRow; row <= range.e.r; row += chunkSize) {
            const endRow = Math.min(row + chunkSize, range.e.r);
            const chunkRecords = this.processChunk(
                worksheet,
                headers,
                row,
                endRow,
                config,
                provider
            );
            records.push(...chunkRecords);
        }

        return records;
    }

    /**
     * Processes a chunk of rows from the worksheet.
     * This is where the actual row-by-row parsing happens.
     * 
     * @param worksheet - Excel worksheet being processed
     * @param headers - Array of header names
     * @param startRow - First row of the chunk
     * @param endRow - Last row of the chunk
     * @param config - Provider configuration
     * @param provider - Provider name
     * @returns Array of parsed records from this chunk
     */
    private processChunk(
        worksheet: xlsx.WorkSheet,
        headers: string[],
        startRow: number,
        endRow: number,
        config: ProviderConfig,
        provider: string
    ): TrackingData[] {
        const records: TrackingData[] = [];

        for (let row = startRow; row <= endRow; row++) {
            const record = this.createRecord(worksheet, headers, row, config, provider);
            if (record) {
                records.push(record);
            }
        }

        return records;
    }

    /**
     * Extracts and cleans header names from the worksheet.
     * Critical for mapping provider columns to standardized fields.
     * 
     * @param worksheet - Excel worksheet
     * @param headerRow - Row number containing headers
     * @param range - Range of cells in worksheet
     * @returns Array of cleaned header strings
     */
    private extractHeaders(
        worksheet: xlsx.WorkSheet,
        headerRow: number,
        range: xlsx.Range
    ): string[] {
        const headers: string[] = [];
        
        for (let col = 0; col <= range.e.c; col++) {
            const cell = worksheet[xlsx.utils.encode_cell({ r: headerRow, c: col })];
            if (cell && cell.v !== undefined) {
                const headerValue = this.cleanHeaderString(cell.v.toString());
                headers[col] = headerValue;
                this.logger.debug(`Header at column ${col}: "${headerValue}"`);
            } else {
                headers[col] = '';
            }
        }

        return headers;
    }

    /**
     * Standardizes header strings by removing extra whitespace.
     * 
     * @param header - Raw header string from Excel
     * @returns Cleaned header string
     */
    private cleanHeaderString(header: string): string {
        return header.replace(/\s+/g, ' ').trim();
    }

    /**
     * Creates a single tracking record from a row of data.
     * Maps Excel cell values to appropriate tracking data fields.
     * 
     * @param worksheet - Excel worksheet
     * @param headers - Array of header names
     * @param row - Current row number
     * @param config - Provider configuration
     * @param provider - Provider name
     * @returns New tracking record or null if row is empty
     */
    private createRecord(
        worksheet: xlsx.WorkSheet,
        headers: string[],
        row: number,
        config: ProviderConfig,
        provider: string
    ): TrackingData | null {
        const record = new TrackingData();
        record.sourceFile = provider;
        record.provider = provider;
        record.carrier = provider;
        let hasData = false;

        for (let col = 0; col < headers.length; col++) {
            const header = headers[col];
            const cell = worksheet[xlsx.utils.encode_cell({ r: row, c: col })];
            const field = config.mapping[header];

            if (header && cell && field) {
                let value = cell.v;
                
                if (value === undefined || value === '') {
                    continue;
                }

                if (typeof value === 'string') {
                    value = value.trim();
                }

                // Special handling for date fields
                if (this.dateTimeValidator.isDateField(field)) {
                    this.logger.debug(`Raw date value for ${field}:`, value);
                }

                const processedValue = this.cleanFieldValue(field, value, cell.t);
                if (processedValue !== null) {
                    record[field] = processedValue;
                    hasData = true;

                    if (this.dateTimeValidator.isDateField(field)) {
                        this.logger.debug(`Processed date value for ${field}:`, processedValue);
                    }
                }
            }
        }

        return hasData ? record : null;
    }

    /**
     * Cleans and formats cell values based on field type.
     * Handles special processing for dates, weights, and package counts.
     * 
     * @param field - Name of the field being processed
     * @param value - Raw cell value
     * @param cellType - Excel cell type
     * @returns Processed value in appropriate format
     */
    private cleanFieldValue(field: string, value: any, cellType: string): any {
        if (value === null || value === undefined) {
            return null;
        }

        // Special handling for date fields
        if (this.dateTimeValidator.isDateField(field)) {
            if (value instanceof Date) {
                return value;
            }
            
            if (typeof value === 'number') {
                try {
                    const date = new Date((value - 25569) * 86400 * 1000);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                } catch (error) {
                    this.logger.warn(`Error converting Excel date number: ${value}`);
                }
            }

            if (typeof value === 'string') {
                try {
                    const parsedDate = new Date(value);
                    if (!isNaN(parsedDate.getTime())) {
                        return parsedDate;
                    }
                } catch (error) {
                    this.logger.warn(`Error parsing date string: ${value}`);
                }
                return value.trim();
            }

            return null;
        }

        // Handle special numeric fields
        if (field === 'weight') {
            return this.formatWeightValue(value);
        }

        if (field === 'packages') {
            return this.formatPackagesValue(value);
        }

        return value;
    }

    /**
     * Formats weight values, ensuring consistent string representation.
     * Removes non-numeric characters except decimal point.
     * 
     * @param value - Raw weight value
     * @returns Formatted weight string or null
     */
    private formatWeightValue(value: any): string | null {
        if (typeof value === 'number') {
            return value.toString();
        }
        if (typeof value === 'string') {
            const weightStr = value.replace(/[^\d.]/g, '');
            return weightStr || null;
        }
        return null;
    }

    /**
     * Formats package count values as integers.
     * Handles both numeric and string inputs.
     * 
     * @param value - Raw package count value
     * @returns Integer package count or null
     */
    private formatPackagesValue(value: any): number | null {
        if (typeof value === 'number') {
            return Math.round(value);
        }
        if (typeof value === 'string') {
            const numValue = parseInt(value.replace(/[^\d]/g, ''));
            return !isNaN(numValue) ? numValue : null;
        }
        return null;
    }
}