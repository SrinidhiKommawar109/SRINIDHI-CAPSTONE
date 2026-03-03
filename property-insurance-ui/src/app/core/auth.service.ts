import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export type UserRole = 'Admin' | 'Agent' | 'Customer' | 'ClaimsOfficer';

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  role: UserRole | string;
  expiration: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'pis_token';
  private readonly ROLE_KEY = 'pis_role';
  private readonly authStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  readonly authState$ = this.authStateSubject.asObservable();

  login(request: LoginRequest): Observable<AuthResponse> {
    const url = `${environment.apiBaseUrl}/Auth/login`;
    return this.http.post<AuthResponse>(url, request).pipe(
      tap((res) => {
        const normalizedRole = (res.role ?? '').toString() as string;
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.ROLE_KEY, normalizedRole);
        this.authStateSubject.next(true);
      }),
    );
  }

  register(request: RegisterRequest): Observable<any> {
    const url = `${environment.apiBaseUrl}/Auth/register`;
    return this.http.post(url, request);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

