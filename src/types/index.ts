export interface Instrument {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
    source: 'scraped' | 'custom';
    tags: string[];
    createdAt?: number;
}

export interface InstrumentSet {
    id: string;
    name: string;
    instrumentIds: string[];
    notes?: string;
    createdAt?: number;
}
