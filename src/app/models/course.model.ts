export interface Course {
    id?: number;
    course_code: string;
    course_name: string;
    department: string;
    status: 'active' | 'inactive'; 
    description?: string;
    created_at?: string;
    updated_at?: string;
}