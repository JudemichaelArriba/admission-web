import { User } from './user.model';
import { Applicant } from './applicant.model';

export interface SignupPayload {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  course_id: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  applicant?: Applicant;
  applicant_id?: number;
}