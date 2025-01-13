// [id]/DetailPageClient.tsx
'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, Calendar, MapPin, FileText, Info } from 'lucide-react';
import { formatDateTime } from '@/utils/dateFormatters';

/**
 * Represents all possible fields in a tracking record
 */
interface TrackingDetail {
    id: string;
    status: string;
    poNumber: string;
    etd: string | null;
    eta: string | null;
    atd: string | null;
    ata: string | null;
    packages: number;
    weight: string | number;
    volume: number | null;
    shipper: string | null;
    shipperCountry: string;
    receiver: string;
    receiverCountry: string;
    houseAwb: string;
    shipperRefNo: string;
    carrier: string;
    incoTerm: string | null;
    flightNo: string | null;
    pickupDate: string | null;
    latestCheckpoint: string;
    sourceFile: string;
}

export default function TrackingDetailPageClient({ id }: { id: string }) {
    const [trackingData, setTrackingData] = useState<TrackingDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    /**
    * Effect hook to fetch tracking details and manage component lifecycle
    * Implements cleanup to prevent memory leaks and race conditions
    */
    useEffect(() => {
    // Flag to track if the component is mounted/subscribed
    let isSubscribed = true;

    /**
     * Async function to fetch tracking data from the API
     * Uses the isSubscribed flag to prevent state updates after unmount
     */
    const fetchData = async () => {
        try {
            // Attempt to fetch tracking data from the API
            const response = await fetch(`/api/tracking/${id}`);
            
            // Check if the response was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Only update state if the component is still mounted
            if (isSubscribed) {
                setTrackingData(data);    // Update tracking data state
                setError(null);           // Clear any previous errors
            }
        } catch (err) {
            // Handle errors only if the component is still mounted
            if (isSubscribed) {
                // Set error message
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Fetch error:', err);
            }
        } finally {
            // Update loading state only if component is still mounted
            if (isSubscribed) {
                setIsLoading(false);
            }
        }
    };

    // Initiate the data fetching
    fetchData();

    // Cleanup function runs when component unmounts or id changes
    return () => {
        isSubscribed = false;  // Prevent state updates after unmount
    };
}, [id]); // Re-run effect when id changes
    /**
    * Formats display values, showing a dash for empty/null values
    * @param {any} value - The value to format
    * @returns {string} Formatted value or dash for empty values
    */
    const formatValue = (value: any) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }
        return value;
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!trackingData) return <div className="p-8 text-center">No data found</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <button 
                onClick={() => window.history.back()} 
                className="inline-flex items-center text-[#004B87] hover:text-[#003666] mb-8 cursor-pointer border-none bg-transparent"
            >
                <ArrowLeft className="mr-2" size={20} />
                Back to Overview
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#004B87] p-6">
                    <h1 className="text-2xl font-bold text-white">Tracking Details</h1>
                    <p className="text-gray-200 mt-2">PO Number: {formatValue(trackingData.poNumber)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                    <div className="flex flex-col gap-8">
                        <div className="bg-gray-50 p-4 rounded-lg flex-1">
                            <h2 className="text-lg font-semibold text-[#004B87] mb-4 flex items-center">
                                <Package className="mr-2" /> Shipment Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.status)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">House AWB</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.houseAwb)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Shipper Ref. No</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.shipperRefNo)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Latest Checkpoint</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.latestCheckpoint)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg flex-1">
                            <h2 className="text-lg font-semibold text-[#004B87] mb-4 flex items-center">
                                <Info className="mr-2" /> Package Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Packages</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.packages)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Weight</p>
                                    <p className="font-medium text-gray-900">
                                        {trackingData.weight ? `${trackingData.weight} kg` : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Volume</p>
                                    <p className="font-medium text-gray-900">
                                        {trackingData.volume ? `${trackingData.volume} m³` : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg flex-1">
                            <h2 className="text-lg font-semibold text-[#004B87] mb-4 flex items-center">
                                <Truck className="mr-2" /> Transport Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Carrier</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.carrier)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Flight No</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.flightNo)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Incoterm</p>
                                    <p className="font-medium text-gray-900">{formatValue(trackingData.incoTerm)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="bg-gray-50 p-4 rounded-lg flex-1">
                            <h2 className="text-lg font-semibold text-[#004B87] mb-4 flex items-center">
                                <Calendar className="mr-2" /> Time Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">ETD</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(trackingData.etd)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">ETA</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(trackingData.eta)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">ATD</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(trackingData.atd)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">ATA</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(trackingData.ata)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pickup Date</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(trackingData.pickupDate)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg flex-1">
                            <h2 className="text-lg font-semibold text-[#004B87] mb-4 flex items-center">
                                <MapPin className="mr-2" /> Location Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-600">Shipper</p>
                                        <p className="font-medium text-gray-900">{formatValue(trackingData.shipper)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Country</p>
                                        <p className="font-medium text-gray-900">{formatValue(trackingData.shipperCountry)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-600">Receiver</p>
                                        <p className="font-medium text-gray-900">{formatValue(trackingData.receiver)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Country</p>
                                        <p className="font-medium text-gray-900">{formatValue(trackingData.receiverCountry)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mx-6 mb-6">
                    <div className="flex items-center gap-2">
                        <FileText size={20} className="text-[#004B87]" />
                        <p className="text-sm text-gray-600">Source File</p>
                    </div>
                    <p className="font-medium text-gray-900 mt-1">{formatValue(trackingData.sourceFile)}</p>
                </div>
            </div>
        </div>
    );
}