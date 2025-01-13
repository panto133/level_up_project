// Response interface for file upload operations
export interface FileUploadResponse {
    success: boolean;
    message: string;
    data?: {
        filename: string;
        validRows: number;
        invalidRows: number;
        processedAt: Date;
    };
    error?: string;
}

// Options interface for file upload operations
export interface FileUploadOptions {
    validate?: boolean;
    confirm?: boolean;
}

// Response interface for tracking operations
export interface TrackingResponse {
    data: any[];
    total: number;
}

// Error interface for service operations
export interface ServiceError {
    status: number;
    error: string;
    details?: string;
}