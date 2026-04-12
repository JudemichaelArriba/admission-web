import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExamSchedule } from '../models/entrance-exam.model';
import { EntranceExam } from '../models/entrance-exam.model';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/exam-schedules`;

  getSchedules(): Observable<ExamSchedule[]> {
    return this.http.get<ExamSchedule[]>(this.API);
  }
  createSchedule(data: Partial<ExamSchedule>): Observable<{message: string, data: ExamSchedule}> {
    return this.http.post<{message: string, data: ExamSchedule}>(this.API, data);
  }
  addApplicants(scheduleId: number, applicantIds: number[]): Observable<{message: string, added: EntranceExam[], errors: string[]}> {
    return this.http.post<{message: string, added: EntranceExam[], errors: string[]}>(`${this.API}/${scheduleId}/applicants`, { applicant_ids: applicantIds });
  }
  removeApplicant(scheduleId: number, applicantId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.API}/${scheduleId}/applicants/${applicantId}`);
  }
  updateSchedule(id: number, data: Partial<ExamSchedule>): Observable<{message: string, data: ExamSchedule}> {
    return this.http.put<{message: string, data: ExamSchedule}>(`${this.API}/${id}`, data);
  }
}