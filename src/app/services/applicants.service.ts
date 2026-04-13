import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Applicant } from '../models/applicant.model';
import { PaginatedResponse } from '../models/PaginatedResponse';

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
 getApplicants(
    page: number = 1, 
    perPage: number = 10, 
    search: string = '', 
    status: string = 'all'
  ): Observable<PaginatedResponse<Applicant>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) params = params.set('search', search);
    if (status && status !== 'all') params = params.set('status', status);

    return this.http.get<PaginatedResponse<Applicant>>(`${this.API}/applicants`, { params });
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
  getUnscheduledApplicants(): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(`${this.API}/applicants/unscheduled`);
  }
}
