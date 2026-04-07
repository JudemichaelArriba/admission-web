export interface ExamRow {
    id: number;
    examDate: Date | null;
    examEndTime: Date | null;
    room: string;
    status?: 'scheduled' | 'evaluated';
}
