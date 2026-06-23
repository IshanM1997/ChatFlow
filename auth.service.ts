import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, User } from './auth.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): User | null { return this.userSubject.value; }
  get isLoggedIn():  boolean     { return !!this.userSubject.value; }
  get accessToken(): string | null { return localStorage.getItem('access_token'); }
  get refreshToken(): string | null { return localStorage.getItem('refresh_token'); }

  login(creds: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, creds).pipe(
      tap(res => {
        localStorage.setItem('access_token',  res.accessToken);
        localStorage.setItem('refresh_token', res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  refreshAccessToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${API}/auth/refresh`, {
      refreshToken: this.refreshToken
    }).pipe(
      tap(res => localStorage.setItem('access_token', res.accessToken))
    );
  }

  logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
  }

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); }
    catch { return null; }
  }
}
