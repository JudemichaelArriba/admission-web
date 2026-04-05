export interface ApplicantDocument {
  id: number;
  applicant_id: number;
  document_type: string;
  file_path: string;
  disk: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  sha256: string;
  scan_status: 'pending' | 'clean' | 'infected';
  created_at?: string;
  updated_at?: string;
}