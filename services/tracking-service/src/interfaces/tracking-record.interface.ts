export interface ITrackingRecord {
    id: string;
    status?: string;
    poNumber?: string;
    etd?: Date;
    eta?: Date;
    atd?: Date;
    ata?: Date;
    packages?: number;
    weight?: string;
    volume?: number;
    shipper?: string;
    shipperCountry?: string;
    receiver?: string;
    receiverCountry?: string;
    houseAwb?: string;
    shipperRefNo?: string;
    carrier?: string;
    incoTerm?: string;
    flightNo?: string;
    pickupDate?: Date;
    latestCheckpoint?: string;
    sourceFile?: string;
    provider?: string;
    createdAt: Date;
    updatedAt: Date;
}