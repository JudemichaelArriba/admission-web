import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EntranceExam } from '../models/entrance-exam.model';

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
}