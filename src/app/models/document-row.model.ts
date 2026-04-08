export interface DocumentRow {
    id: number;
    typeLabel: string;
    filename: string;
    mimeLabel: string;
    mimeType: string;              // ADD THIS
    sizeLabel: string;
    scanStatus: 'pending' | 'clean' | 'infected';
    createdAt?: string;
    canOpen: boolean;
}
