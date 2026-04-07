export interface EntranceExam {
    id: number;
    applicant_id: number;
    exam_date: string;     
    exam_end_time: string;  
    room: string;
    exam_score?: number | null;
    status?: 'scheduled' | 'evaluated';
    created_at?: string;
    updated_at?: string;
}
