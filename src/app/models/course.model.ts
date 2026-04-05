export interface Course {
    id?: number;
    course_code: string;
    course_name: string;
    units: number;
    department: string;
    status: 'active' | 'inactive'; 
    type: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}