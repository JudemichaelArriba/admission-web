import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EntranceExam } from '../models/entrance-exam.model';

@Injectable({ providedIn: 'root' })
export class ExamsService {
    private readonly http = inject(HttpClient);
    private readonly API = environment.apiUrl;

    getMyExams(): Observable<EntranceExam[]> {
        return this.http.get<EntranceExam[]>(`${this.API}/exams`);
    }
}
