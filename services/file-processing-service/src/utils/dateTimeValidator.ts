/**
 * DateTime Validator Service
 * 
 * This service handles all date and time validation for the application, specifically
 * designed to handle the complexities of parsing and validating dates from Excel files
 * across multiple shipping providers. It supports various date formats and provides
 * robust validation for shipping-related date fields.
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Represents the result of a date validation operation.
 * Provides comprehensive information about the validation outcome.
 */
export interface DateValidationResult {
    isValid: boolean;       // Whether the date is valid according to business rules
    parsedDate: Date | null; // The parsed Date object if valid, null otherwise
    error?: string;         // Error message if validation failed
}

@Injectable()
export class DateTimeValidator {
    private readonly logger = new Logger(DateTimeValidator.name);
    
    // Set of field names that should be treated as dates in the application
    private readonly dateFields = new Set(['etd', 'eta', 'atd', 'ata', 'pickupDate']);

    /**
     * Checks if a given field name represents a date field in our system.
     * 
     * @param field - The field name to check
     * @returns true if the field is a date field, false otherwise
     */
    isDateField(field: string): boolean {
        return this.dateFields.has(field.toLowerCase());
    }

    /**
     * Validates a date value from any supported format.
     * Handles multiple date formats including:
     * - Excel numeric dates
     * - JavaScript Date objects
     * - String dates in various formats (DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD)
     * 
     * @param value - The date value to validate
     * @param fieldName - Name of the field being validated (for error messages)
     * @returns DateValidationResult with validation status and parsed date
     */
    validateDateValue(value: any, fieldName: string): DateValidationResult {
        this.logger.debug(`Validating ${fieldName} with value: ${value}`);

        // Handle null/undefined values
        if (!value) {
            this.logger.debug(`Empty value for ${fieldName}, returning valid null`);
            return { isValid: true, parsedDate: null };
        }

        // Handle Excel numeric dates
        if (typeof value === 'number') {
            try {
                // Convert Excel date number to JavaScript Date
                // 25569 is the number of days between 1/1/1900 and 1/1/1970
                const date = new Date((value - 25569) * 86400 * 1000);
                this.logger.debug(`Converting Excel number ${value} to date: ${date}`);
                
                if (!isNaN(date.getTime())) {
                    return { isValid: true, parsedDate: date };
                }
            } catch (error) {
                this.logger.error(`Error converting Excel date for ${fieldName}:`, error);
                return {
                    isValid: false,
                    parsedDate: null,
                    error: `Invalid Excel date number for ${fieldName}: ${value}`
                };
            }
        }

        // Handle JavaScript Date objects
        if (value instanceof Date) {
            this.logger.debug(`Processing Date object for ${fieldName}: ${value}`);
            if (!isNaN(value.getTime())) {
                return { isValid: true, parsedDate: value };
            }
            return {
                isValid: false,
                parsedDate: null,
                error: `Invalid Date object for ${fieldName}`
            };
        }

        // Handle string dates
        if (typeof value === 'string') {
            this.logger.debug(`Processing date string for ${fieldName}: ${value}`);
            const result = this.parseDateString(value.trim(), fieldName);
            if (!result.isValid) {
                this.logger.warn(`Invalid date string for ${fieldName}: ${value}`);
            } else {
                this.logger.debug(`Successfully parsed date string: ${result.parsedDate}`);
            }
            return result;
        }

        // Handle unsupported formats
        this.logger.warn(`Unsupported date format for ${fieldName}: ${value}`);
        return {
            isValid: false,
            parsedDate: null,
            error: `Unsupported date format for ${fieldName}: ${value}`
        };
    }

    /**
     * Validates if a given combination of day, month, and year represents a valid date.
     * Takes into account:
     * - Valid month ranges (1-12)
     * - Days in each month (including leap years)
     * - Two-digit year conversion
     * 
     * @param day - Day of the month
     * @param month - Month (1-12)
     * @param year - Year (handles both 2 and 4 digit formats)
     * @returns boolean indicating if the date is valid
     */
    private isValidMonthDayYear(day: number, month: number, year: number): boolean {
        // Basic month validation
        if (month < 1 || month > 12) return false;
        if (year < 0) return false;

        // Convert two-digit years to four digits
        // Assumes years 00-99 are in the 2000s
        if (year < 100) {
            year += 2000;
        }

        // Check if day is valid for the given month
        // Uses JavaScript Date to handle leap years automatically
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        return day >= 1 && day <= lastDayOfMonth;
    }

    /**
     * Parses a date string in various formats.
     * Supports multiple date formats and attempts to intelligently determine
     * the correct interpretation of ambiguous dates.
     * 
     * Supported formats:
     * - MM/DD/YYYY (American)
     * - DD/MM/YYYY (European)
     * - YYYY/MM/DD (ISO-like)
     * Also handles various separators (/, -, .) and two-digit years
     * 
     * @param dateStr - The date string to parse
     * @param fieldName - Field name for error messages
     * @returns DateValidationResult with parsing outcome
     */
    private parseDateString(dateStr: string, fieldName: string): DateValidationResult {
        // Remove any characters except digits and common separators
        const cleanDate = dateStr.replace(/[^\d/.-]/g, '');
        
        // Split into components using any common separator
        const parts = cleanDate.split(/[/.-]/);
        if (parts.length !== 3) {
            return {
                isValid: false,
                parsedDate: null,
                error: `Invalid date format for ${fieldName}: ${dateStr}`
            };
        }

        // Convert all parts to numbers
        const nums = parts.map(Number);
        if (nums.some(isNaN)) {
            return {
                isValid: false,
                parsedDate: null,
                error: `Invalid date components for ${fieldName}: ${dateStr}`
            };
        }

        // Try different possible interpretations of the numbers
        const interpretations = [
            { month: nums[0], day: nums[1], year: nums[2] },  // MM/DD/YYYY
            { month: nums[1], day: nums[0], year: nums[2] },  // DD/MM/YYYY
            { month: nums[1], day: nums[2], year: nums[0] }   // YYYY/MM/DD
        ];

        // Try each interpretation until a valid one is found
        for (const { month, day, year } of interpretations) {
            let adjustedYear = year;
            if (year < 100) {
                adjustedYear = 2000 + year;  // Convert two-digit years
            }

            if (this.isValidMonthDayYear(day, month, adjustedYear)) {
                const date = new Date(adjustedYear, month - 1, day);
                // Ensure date is in reasonable range (2000-2100)
                if (date.getFullYear() >= 2000 && date.getFullYear() <= 2100) {
                    return {
                        isValid: true,
                        parsedDate: date
                    };
                }
            }
        }

        // If no valid interpretation found, return error
        return {
            isValid: false,
            parsedDate: null,
            error: `No valid date interpretation found for ${fieldName}: ${dateStr}`
        };
    }

    /**
     * Formats a Date object into a standardized string format (DD/MM/YYYY)
     * Used for consistent date representation across the application
     * 
     * @param date - The Date object to format
     * @returns Formatted date string
     */
    formatDate(date: Date): string {
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }

    /**
     * Validates the logical relationship between two dates.
     * Ensures that start dates come before end dates (e.g., ETD before ETA)
     * 
     * @param startDate - The earlier date in the relationship
     * @param endDate - The later date in the relationship
     * @param startFieldName - Name of the start date field for error messages
     * @param endFieldName - Name of the end date field for error messages
     * @returns Error message if validation fails, null if valid
     */
    validateDateRelationship(
        startDate: Date | null,
        endDate: Date | null,
        startFieldName: string,
        endFieldName: string
    ): string | null {
        if (startDate && endDate && startDate > endDate) {
            return `${startFieldName} cannot be later than ${endFieldName}`;
        }
        return null;
    }
}