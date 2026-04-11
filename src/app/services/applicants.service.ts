import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Applicant } from '../models/applicant.model';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  private readonly http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getMe(): Observable<Applicant> {
    return this.http.get<Applicant>(`${this.API}/me/applicant`);
  }
  updateApplicant(id: number, data: Partial<Applicant>): Observable<Applicant> {
    return this.http.put<Applicant>(`${this.API}/applicants/${id}`, data);
  }
  getApplicants(): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(`${this.API}/applicants`);
  }
   updateStatus(
    id: number,
    action: 'approve' | 'reject',
    reason?: string
  ): Observable<{ message: string; applicant: Applicant }> {
    return this.http.post<{ message: string; applicant: Applicant }>(
      `${this.API}/applicants/${id}/status`,
      { action, ...(reason ? { reason } : {}) }
    );
  }
}
