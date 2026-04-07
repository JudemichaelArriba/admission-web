import { Course } from "./course.model";

export interface Applicant {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  course_id: number;
  course?: Course;
  status?: 'pending' | 'approved' | 'rejected' | 'enrolled';
  created_at?: string;
  updated_at?: string;
}