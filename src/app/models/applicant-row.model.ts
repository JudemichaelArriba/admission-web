export interface ApplicantRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status?: 'pending' | 'approved' | 'rejected' | 'enrolled';
  course?: {
    course_name: string;
  };
}
