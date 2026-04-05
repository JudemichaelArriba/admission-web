import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Applicant } from '../models/applicant.model';
import { SignupPayload, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';
  private readonly APP_ID_KEY = 'applicant_id';

  constructor(private http: HttpClient) {}

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/auth/applicant/signup`, payload)
      .pipe(tap(res => this.persist(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/auth/login`, { email, password })
      .pipe(tap(res => this.persist(res)));
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.API}/auth/logout`, {})
      .pipe(tap(() => this.clear()));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  getApplicantId(): number | null {
    const raw = localStorage.getItem(this.APP_ID_KEY);
    return raw ? Number(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    const id = res.applicant?.id ?? res.applicant_id;
    if (id) localStorage.setItem(this.APP_ID_KEY, String(id));
  }

  private clear(): void {
    [this.TOKEN_KEY, this.USER_KEY, this.APP_ID_KEY].forEach(k =>
      localStorage.removeItem(k)
    );
  }
}