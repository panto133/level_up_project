// UploadPage.tsx - Component for handling Excel file uploads with validation
'use client';
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

/**
 * Extended type for file input events to ensure proper typing of file input elements
 */
interface FileEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
}

/**
 * Structure of the response expected from the upload API
 * Contains information about processed files and any potential errors
 */
interface UploadResponse {
    filename?: string;
    validRows?: number;
    invalidRows?: number;
    processedAt?: Date;
    error?: string;
}

export default function UploadPage() {
    // State management for file handling and UI feedback
    const [file, setFile] = useState<File | null>(null);           // Currently selected file
    const [message, setMessage] = useState<string>('');            // User feedback messages
    const [isLoading, setIsLoading] = useState<boolean>(false);    // Loading state for UI
    
    // Detailed statistics about processed rows
    const [rowDetails, setRowDetails] = useState<{
        total: number;
        valid: number;
        invalid: number;
    } | null>(null);
    
    // State for managing the confirmation dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingResponse, setPendingResponse] = useState<UploadResponse | null>(null);

    // API endpoint configuration with fallback
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

     /**
     * Handles file selection from the input
     * Resets all states when a new file is selected
     */
     const handleFileChange = (event: FileEvent) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setMessage('');                // Clear any previous messages
            setRowDetails(null);           // Reset row statistics
            setPendingResponse(null);      // Clear any pending uploads
        }
    };

    /**
     * Processes the upload response and determines next steps based on data validation
     * There are three possible outcomes:
     * 1. All rows are invalid - Show error message
     * 2. Some rows are valid, some invalid - Show confirmation dialog
     * 3. All rows are valid - Show success message
     */
    const processUploadResponse = (data: UploadResponse) => {
        const totalRows = (data.validRows || 0) + (data.invalidRows || 0);
        
        if (data.validRows === 0) {
            // Handle case where no valid rows were found
            setMessage(`File "${data.filename}" was unable to be processed. Reason: No Valid Rows.`);
            setRowDetails({
                total: totalRows,
                valid: 0,
                invalid: data.invalidRows || 0
            });
        } else if (data.invalidRows && data.invalidRows > 0) {
            // Handle case with both valid and invalid rows - prompt for user decision
            setPendingResponse(data);
            setShowConfirmDialog(true);
        } else {
            // Handle case where all rows are valid
            setMessage(`File ${data.filename} processed successfully!`);
            setRowDetails({
                total: totalRows,
                valid: data.validRows || 0,
                invalid: data.invalidRows || 0
            });
        }
    };

    /**
     * Handles the initial file upload and validation
     * Prevents default form submission and validates file presence
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Send file for initial validation
            const response = await fetch(`${API_URL}/api/upload?validate=true`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Validation response:', data);

            if (response.ok && data.status === 'success') {
                processUploadResponse(data);
            } else {
                setMessage(`Upload failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the user's decision from the confirmation dialog
     * If confirmed, proceeds with uploading valid rows
     * If cancelled, cleans up the upload state
     */
    const handleConfirmUpload = async (confirmed: boolean) => {
        setShowConfirmDialog(false);

        if (!confirmed || !file) {
            setMessage('Upload cancelled by user.');
            setPendingResponse(null);
            return;
        }

        setIsLoading(true);

        try {
            // Prepare and send the confirmed upload
            const formData = new FormData();
            formData.append('file', file);

            console.log('Sending confirmation request...');
            const response = await fetch(`${API_URL}/api/upload?confirm=true`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Confirmation response:', data);

            // Handle the final upload response
            if (response.ok && data.status === 'success') {
                setMessage(`File uploaded successfully!`);
                setRowDetails({
                    total: (data.validRows || 0) + (data.invalidRows || 0),
                    valid: data.validRows || 0,
                    invalid: data.invalidRows || 0
                });
            } else {
                setMessage(`Upload failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Clean up all states after upload completion
            setIsLoading(false);
            setPendingResponse(null);
            setFile(null);
        }
    };

    // The component's render method includes a form for file selection,
    // feedback messages, and a confirmation dialog when needed
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-[#004B87] mb-8 text-center">Upload Excel File</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="w-full flex justify-center">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".xlsx,.xls"
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#004B87] file:text-white hover:file:bg-[#003666] cursor-pointer"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!file || isLoading}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold flex items-center justify-center gap-2 ${
                            !file || isLoading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-[#004B87] hover:bg-[#003666]'
                        }`}
                    >
                        <Upload size={20} />
                        {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
                
                {message && (
                    <div
                        className={`mt-6 p-4 rounded-md ${
                            message.includes('Error') 
                                ? 'bg-red-100 text-red-700'
                                : message.includes('unable to be processed')
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {message}
                    </div>
                )}
                
                {rowDetails && (
                    <div className="mt-6 p-4 bg-blue-100 text-blue-700 rounded-md">
                        <p>Total Rows: {rowDetails.total}</p>
                        <p>Valid Rows: {rowDetails.valid}</p>
                        <p>Invalid Rows: {rowDetails.invalid}</p>
                    </div>
                )}

                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    title="Invalid Rows Detected"
                    message={`There are ${pendingResponse?.invalidRows} invalid rows. Would you like to upload the remaining ${pendingResponse?.validRows} valid rows?`}
                    onConfirm={() => handleConfirmUpload(true)}
                    onCancel={() => handleConfirmUpload(false)}
                />
            </div>
        </div>
    );
}