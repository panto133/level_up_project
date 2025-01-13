import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ITrackingRecord } from '../interfaces/tracking-record.interface';

@Entity('tracking_records')
export class TrackingRecord implements ITrackingRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    status?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    poNumber?: string;

    @Column({ type: 'datetime', nullable: true })
    etd?: Date;

    @Column({ type: 'datetime', nullable: true })
    eta?: Date;

    @Column({ type: 'datetime', nullable: true })
    atd?: Date;

    @Column({ type: 'datetime', nullable: true })
    ata?: Date;

    @Column({ type: 'int', nullable: true })
    packages?: number;

    @Column({ type: 'varchar', precision: 10, scale: 2, nullable: true })
    weight?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    volume?: number;

    @Column({ type: 'varchar', length: 200, nullable: true })
    shipper?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    shipperCountry?: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    receiver?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    receiverCountry?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    houseAwb?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    shipperRefNo?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    carrier?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    incoTerm?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    flightNo?: string;

    @Column({ type: 'datetime', nullable: true })
    pickupDate?: Date;

    @Column({ type: 'varchar', length: 200, nullable: true })
    latestCheckpoint?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    sourceFile?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    provider?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}