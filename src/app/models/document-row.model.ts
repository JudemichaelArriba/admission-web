export interface DocumentRow {
    id: number;
    rawType: string;
    typeLabel: string;
    filename: string;
    mimeLabel: string;
    mimeType: string;             
    sizeLabel: string;
    scanStatus: 'pending' | 'clean' | 'infected';
    createdAt?: string;
    canOpen: boolean;
}
