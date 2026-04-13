import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExamSchedule } from '../models/entrance-exam.model';
import { EntranceExam } from '../models/entrance-exam.model';
import { PaginatedResponse } from '../models/PaginatedResponse';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/exam-schedules`;

getSchedules(
    page: number = 1,
    perPage: number = 10,
    search: string = '',
    status: string = 'all'
  ): Observable<PaginatedResponse<ExamSchedule>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) params = params.set('search', search);
    if (status && status !== 'all') params = params.set('status', status);

    return this.http.get<PaginatedResponse<ExamSchedule>>(this.API, { params });
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
  deleteSchedule(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.API}/${id}`);
  }
}