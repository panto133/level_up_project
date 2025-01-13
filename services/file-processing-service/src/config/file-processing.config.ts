/**
 * Configuration for file processing settings
 * Defines core parameters for file handling and logging
 */
import { registerAs } from '@nestjs/config';

export const fileProcessingConfig = registerAs('fileProcessing', () => ({
    logsDirectory: process.env.LOGS_DIRECTORY || 'logs',     // Directory for log files
    chunkSize: parseInt(process.env.FILE_CHUNK_SIZE, 10) || 1000, // Size of processing chunks
}));