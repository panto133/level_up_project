// route.ts - API route handler for fetching individual tracking records
import { NextResponse } from 'next/server';

/**
 * GET handler for retrieving a single tracking record
 * Acts as a proxy between the frontend and tracking service
 * 
 * @param {Request} request - The incoming HTTP request
 * @param {Object} params - Route parameters containing the tracking ID
 * @returns {Promise<NextResponse>} JSON response with tracking data or error
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Resolve the params promise to get the tracking ID
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // Forward the request to the tracking service
        const response = await fetch(`http://localhost:3003/api/tracking/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Return the tracking data to the client
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching tracking detail:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracking detail' },
            { status: 500 }
        );
    }
}