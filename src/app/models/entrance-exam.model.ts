import { PaginatedResponse } from "./PaginatedResponse";


export interface EvaluationQueueResponse {
  exams: PaginatedResponse<EntranceExam>;
  pending_count: number;
  evaluated_count: number;
}



export interface ExamSchedule {
    id: number;
    exam_date: string;
    exam_end_time: string;
    room: string;
    status: 'upcoming' | 'completed';
    created_at?: string;
    updated_at?: string;
    exams?: EntranceExam[];
}


export interface EntranceExam {
    id: number;
    applicant_id: number;
    exam_schedule_id: number; 
    exam_score?: number | null;
    status: 'scheduled' | 'evaluated' | 'completed';
    created_at?: string;
    updated_at?: string;
    schedule: ExamSchedule; 
    applicant?: any;
}