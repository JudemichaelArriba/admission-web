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