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
}
