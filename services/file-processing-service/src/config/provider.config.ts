/**
 * Provider configuration for different shipping companies
 * Defines mapping rules for each provider's Excel format
 */
import { registerAs } from '@nestjs/config';

export interface ProviderConfig {
    headerRow: number;      // Row number containing headers
    dataRow: number;        // First row containing data
    mapping: Record<string, string>; // Maps provider columns to internal fields
}

export interface ProvidersConfig {
    DHL: ProviderConfig;
    Hellmann: ProviderConfig;
    Logwin: ProviderConfig;
}

// Configuration for each provider's Excel format
export const providerConfig = registerAs('providers', () => ({
    // DHL specific mapping configuration
    DHL: {
        headerRow: 11,
        dataRow: 12,
        mapping: {
            'Payer Account Number': 'shipperRefNo',
            'Waybill Number': 'houseAwb',
            'Shipper Reference Number': 'shipperRefNo',
            'Receiver': 'receiver',
            'Pieces': 'packages',
            'Manifested Weight': 'weight',
            'Estimated Delivery Date': 'eta',
            'Latest Checkpoint': 'latestCheckpoint',
            'Pickup Date': 'pickupDate',
            'Origin Country/Territory IATA code': 'shipperCountry',
            'Destination Country/Territory IATA code': 'receiverCountry'
        }
    },
    // Hellmann specific mapping configuration
    Hellmann: {
        headerRow: 2,
        dataRow: 3,
        mapping: {
            'Status': 'status',
            'House AWB': 'houseAwb',
            'Shipper Name': 'shipper',
            'Shipper Country': 'shipperCountry',
            'Consignee Name': 'receiver',
            'Consignee Country': 'receiverCountry',
            'No of Packages': 'packages',
            'Gross Weight (Kg)': 'weight',
            'Flight ETD': 'etd',
            'Flight ETA': 'eta',
            'Flight ATD': 'atd',
            'Flight ATA': 'ata',
        }
    },
    // Logwin specific mapping configuration
    Logwin: {
        headerRow: 0,
        dataRow: 1,
        mapping: {
            'Status': 'status',
            'House': 'houseAwb',
            'PO Number': 'poNumber',
            'Shipper': 'shipper',
            'Consignee': 'receiver',
            'ETD': 'etd',
            'ETA': 'eta',
            'ATD': 'atd',
            'ATA': 'ata',
            'Packages': 'packages',
            'Weight': 'weight',
            'Volume': 'volume',
            'Carrier': 'carrier'
        }
    }
} as ProvidersConfig));

export default providerConfig;