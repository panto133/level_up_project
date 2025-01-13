// page.tsx - Dynamic route page component for tracking details
'use client';

import React from 'react';
import DetailPageClient from './DetailPageClient';

/**
 * Page component that handles the dynamic routing for tracking details
 * Unwraps the route parameters and passes them to the client component
 * 
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - Route parameters containing the tracking ID
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap the params promise to get the tracking ID
    const resolvedParams = React.use(params);
    const id = resolvedParams.id;

    // Render the client component with the tracking ID
    return <DetailPageClient id={id} />;
}