/**
 * utils/logger.ts
 * Custom logging utility providing consistent logging format across the application.
 * Supports different log levels and includes metadata in the log messages.
 */
// Define structure for additional logging metadata
export interface LoggerMetadata {
    [key: string]: any;
}

export class Logger {
    /**
     * Formats log messages with timestamp and metadata
     * @param level - Log level (INFO, ERROR, DEBUG)
     * @param message - Main log message
     * @param meta - Optional metadata object
     * @returns Formatted log string
     */
    private static formatMessage(level: string, message: string, meta?: LoggerMetadata): string {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaString}`;
    }

    /**
     * Logs informational messages
     * @param message - Info message
     * @param meta - Optional metadata
     */
    static info(message: string, meta?: LoggerMetadata): void {
        console.log(this.formatMessage('INFO', message, meta));
    }

    /**
     * Logs error messages with stack traces
     * @param message - Error message
     * @param error - Error object containing stack trace
     */
    static error(message: string, error?: any): void {
        console.error(this.formatMessage('ERROR', message, {
            message: error?.message,
            stack: error?.stack,
        }));
    }

    /**
     * Logs debug messages (only in non-production environments)
     * @param message - Debug message
     * @param meta - Optional metadata
     */
    static debug(message: string, meta?: LoggerMetadata): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
}