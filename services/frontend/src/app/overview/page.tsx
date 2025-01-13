'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatDateTime } from '@/utils/dateFormatters';

/**
 * Represents a single tracking record in the overview table
 */
interface TrackingData {
    id: string;
    status: string;
    poNumber: string;
    ata: string;
    shipper: string;
    carrier: string;
}

/**
 * Response structure for paginated tracking data
 */
interface PaginationResponse {
    data: TrackingData[];
    total: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
}



export default function TrackingPage() {
    const [data, setData] = useState<TrackingData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 50;
    const router = useRouter();

    /**
    * Effect hook responsible for fetching paginated tracking data
    * Triggers whenever the current page changes and manages the loading state
    */
useEffect(() => {
    // Set loading state to true before starting the fetch
    // This triggers loading indicators in the UI
    setIsLoading(true);

    // Make a GET request to the tracking service API
    // The URL includes query parameters for pagination
    fetch(`http://localhost:3003/api/tracking?page=${currentPage}&limit=${itemsPerPage}`)
        .then(async (response) => {
            // First, check if the response was successful
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            // Parse the JSON response and type it as PaginationResponse
            const result: PaginationResponse = await response.json();

            // Update the state with the new data
            setData(result.data);
            setTotalPages(result.totalPages);
        })
        .catch((error) => {
            // Log the error and set data to empty
            console.error('Error fetching data:', error);
            setData([]);
        })
        .finally(() => {
            // Whether the fetch succeeds or fails, set loading state back to false
            // This block ensures the loading state is always cleaned up
            setIsLoading(false);
        });
}, [currentPage]); // Only re-run this effect when currentPage changes

    /**
    * Handles navigation to the detail page when a row is clicked
    * @param {string} id - The ID of the tracking record
    */
    const handleRowClick = (id: string) => {
        router.push(`/overview/${id}`);
    };

    /**
    * Updates the current page number and triggers a data refresh
    * @param {number} page - The page number to navigate to
    */
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    /**
     * PaginationControls component handles the pagination UI and logic
     * Provides controls for navigating between pages of tracking data
    */
    const PaginationControls = () => (
        <div className="flex items-center justify-center my-4 space-x-2">
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed border border-[#004B87] text-[#004B87]"
            >
                <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed border border-[#004B87] text-[#004B87]"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="mx-4">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed border border-[#004B87] text-[#004B87]"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed border border-[#004B87] text-[#004B87]"
            >
                <ChevronsRight className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-[#004B87] mb-8 text-center">Tracking Overview</h1>
            
            {/* Top pagination controls */}
            {!isLoading && data.length > 0 && <PaginationControls />}

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : data.length > 0 ? (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table content remains the same */}
                        <thead className="bg-[#004B87]">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Carrier</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Shipper</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">ATA</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => handleRowClick(item.id)}
                                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.status}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.poNumber}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.carrier}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.shipper}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{formatDateTime(item.ata)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8">No data available</div>
            )}

            {/* Bottom pagination controls */}
            {!isLoading && data.length > 0 && <PaginationControls />}
        </div>
    );
}