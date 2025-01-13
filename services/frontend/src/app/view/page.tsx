'use client';
import { useState, useEffect } from 'react';

interface TrackingData {
    id: number;
    status: string;
    poNumber: string;
    etd: string;
    eta: string;
    atd: string;
    ata: string;
    packages: number;
    weight: number;
    volume: number;
    shipper: string;
    shipperCountry: string;
    receiver: string;
    receiverCountry: string;
    houseAwb: string;
    shipperRefNo: string;
    carrier: string;
    incoTerm: string;
    flightNo: string;
    pickupDate: string;
    latestCheckpoint: string;
    sourceFile: string;
    createdAt: string;
    updatedAt: string;
}

export default function ViewPage() {
    const [data, setData] = useState<TrackingData[]>([]);

    useEffect(() => {
        fetch('http://localhost:3003/api/tracking')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Tracking Data</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Status</th>
                            <th className="border border-gray-300 p-2">PO Number</th>
                            <th className="border border-gray-300 p-2">ETD</th>
                            <th className="border border-gray-300 p-2">ETA</th>
                            <th className="border border-gray-300 p-2">ATD</th>
                            <th className="border border-gray-300 p-2">ATA</th>
                            <th className="border border-gray-300 p-2">Packages</th>
                            <th className="border border-gray-300 p-2">Weight</th>
                            <th className="border border-gray-300 p-2">Volume</th>
                            <th className="border border-gray-300 p-2">Shipper</th>
                            <th className="border border-gray-300 p-2">Shipper Country</th>
                            <th className="border border-gray-300 p-2">Receiver</th>
                            <th className="border border-gray-300 p-2">Receiver Country</th>
                            <th className="border border-gray-300 p-2">House AWB</th>
                            <th className="border border-gray-300 p-2">Shipper Ref No</th>
                            <th className="border border-gray-300 p-2">Carrier</th>
                            <th className="border border-gray-300 p-2">Inco Term</th>
                            <th className="border border-gray-300 p-2">Flight No</th>
                            <th className="border border-gray-300 p-2">Pickup Date</th>
                            <th className="border border-gray-300 p-2">Latest Checkpoint</th>
                            <th className="border border-gray-300 p-2">Source File</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2">{item.status}</td>
                                <td className="border border-gray-300 p-2">{item.poNumber}</td>
                                <td className="border border-gray-300 p-2">{item.etd}</td>
                                <td className="border border-gray-300 p-2">{item.eta}</td>
                                <td className="border border-gray-300 p-2">{item.atd}</td>
                                <td className="border border-gray-300 p-2">{item.ata}</td>
                                <td className="border border-gray-300 p-2">{item.packages}</td>
                                <td className="border border-gray-300 p-2">{item.weight}</td>
                                <td className="border border-gray-300 p-2">{item.volume}</td>
                                <td className="border border-gray-300 p-2">{item.shipper}</td>
                                <td className="border border-gray-300 p-2">{item.shipperCountry}</td>
                                <td className="border border-gray-300 p-2">{item.receiver}</td>
                                <td className="border border-gray-300 p-2">{item.receiverCountry}</td>
                                <td className="border border-gray-300 p-2">{item.houseAwb}</td>
                                <td className="border border-gray-300 p-2">{item.shipperRefNo}</td>
                                <td className="border border-gray-300 p-2">{item.carrier}</td>
                                <td className="border border-gray-300 p-2">{item.incoTerm}</td>
                                <td className="border border-gray-300 p-2">{item.flightNo}</td>
                                <td className="border border-gray-300 p-2">{item.pickupDate}</td>
                                <td className="border border-gray-300 p-2">{item.latestCheckpoint}</td>
                                <td className="border border-gray-300 p-2">{item.sourceFile}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}