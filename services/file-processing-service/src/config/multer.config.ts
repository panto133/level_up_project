/**
 * Multer configuration for file uploads
 * Defines file upload constraints and validation
 */
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';

export const multerConfig: MulterOptions = {
  storage: undefined, // Use memory storage for file processing
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, callback) => {
    // Define allowed Excel file types
    const allowedMimes = [
      'application/vnd.ms-excel',                                         // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];
    
    // Validate file type
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException('Invalid file type. Only Excel files are allowed.'),
        false
      );
    }
  }
};