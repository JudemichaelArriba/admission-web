export interface ExamSchedule {
    id: number;
    exam_date: string;
    exam_end_time: string;
    room: string;
    created_at?: string;
    updated_at?: string;
}


export interface EntranceExam {
    id: number;
    applicant_id: number;
    exam_schedule_id: number; // New foreign key
    exam_score?: number | null;
    status: 'scheduled' | 'evaluated' | 'completed';
    created_at?: string;
    updated_at?: string;
    
    // The related data from the 'with' query in Laravel
    schedule: ExamSchedule; 
    applicant?: any; // Only present for Admin views
}