import { User } from './user.model';
import { Applicant } from './applicant.model';

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  applicant?: Applicant;
  applicant_id?: number;
}