import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApplicantDocument } from '../models/applicant-document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  upload(
    applicantId: number,
    file: File,
    documentType: string
  ): Observable<ApplicantDocument> {
    const form = new FormData();
    form.append('file', file);
    form.append('document_type', documentType);
    return this.http.post<ApplicantDocument>(
      `${this.API}/applicants/${applicantId}/documents`,
      form
    );
  }

  list(applicantId: number): Observable<ApplicantDocument[]> {
    return this.http.get<ApplicantDocument[]>(
      `${this.API}/applicants/${applicantId}/documents`
    );
  }
}