import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export type UserRole = 'Admin' | 'Agent' | 'Customer' | 'ClaimsOfficer';

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
  referralCode: string;
  referralBalance: number;
  referralsCount: number;
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
  referralCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'pis_token';
  private readonly ROLE_KEY = 'pis_role';
  private readonly NAME_KEY = 'pis_name';
  private readonly EMAIL_KEY = 'pis_email';
  private readonly authStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  readonly authState$ = this.authStateSubject.asObservable();

  login(request: LoginRequest): Observable<AuthResponse> {
    const url = `${environment.apiBaseUrl}/Auth/login`;
    return this.http.post<AuthResponse>(url, request).pipe(
      tap((res) => {
        const normalizedRole = (res.role ?? '').toString() as string;
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.ROLE_KEY, normalizedRole);

        // Try to get name and email from response, then from token
        let name = res.fullName || (res as any).name || (res as any).userName || '';
        let email = res.email || (res as any).Email || '';

        if (!name || !email) {
          const decoded = this.decodeToken(res.token);
          if (decoded) {
            name = name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || decoded.name || '';
            email = email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || '';
          }
        }

        localStorage.setItem(this.NAME_KEY, name);
        localStorage.setItem(this.EMAIL_KEY, email);
        localStorage.setItem('pis_referral', res.referralCode);
        localStorage.setItem('pis_balance', res.referralBalance.toString());
        localStorage.setItem('pis_referrals_count', res.referralsCount.toString());
        this.authStateSubject.next(true);
      }),
    );
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch {
      return null;
    }
  }

  register(request: RegisterRequest): Observable<any> {
    const url = `${environment.apiBaseUrl}/Auth/register`;
    return this.http.post(url, request);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.NAME_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem('pis_referral');
    localStorage.removeItem('pis_balance');
    localStorage.removeItem('pis_referrals_count');
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  getFullName(): string | null {
    return localStorage.getItem(this.NAME_KEY);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  getReferralCode(): string | null {
    return localStorage.getItem('pis_referral');
  }

  getReferralBalance(): number {
    return parseFloat(localStorage.getItem('pis_balance') || '0');
  }

  getReferralsCount(): number {
    return parseInt(localStorage.getItem('pis_referrals_count') || '0', 10);
  }

  redeem(amount: number) {
    const email = this.getEmail();
    if (!email) return;
    return this.http.post(`${environment.apiBaseUrl}/Auth/redeem`, { email: email, amount });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
