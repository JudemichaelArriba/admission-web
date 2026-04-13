import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EntranceExam, EvaluationQueueResponse } from '../models/entrance-exam.model';

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/exams`;

 
  getExams(applicantId?: number): Observable<EntranceExam[]> {
    const url = applicantId ? `${this.API}/${applicantId}` : this.API;
    return this.http.get<EntranceExam[]>(url);
  }


  evaluateExam(examId: number, exam_score: number): Observable<any> {
    return this.http.put(`${this.API}/${examId}/evaluate`, { exam_score });
  }

getEvaluationQueue(
    page: number = 1,
    perPage: number = 10,
    search: string = '',
    filter: string = 'all'
  ): Observable<EvaluationQueueResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) params = params.set('search', search);
    if (filter && filter !== 'all') params = params.set('filter', filter);

    return this.http.get<EvaluationQueueResponse>(`${this.API}/evaluation-queue`, { params });
  }
}