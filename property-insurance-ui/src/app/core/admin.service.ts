import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AgentSummary {
  id: number;
  fullName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/Admin`;

  getAgents(): Observable<AgentSummary[]> {
    return this.http.get<AgentSummary[]>(this.baseUrl + '/agents');
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/Category`);
  }

  addPlan(plan: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/Category/add-plan`, plan);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }

  deletePlan(id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/PropertyPlans/${id}`);
  }

  getStaff(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/staff`);
  }

  createUser(user: any): Observable<any> {
    const url = `${environment.apiBaseUrl}/Auth/create-user`;
    return this.http.post(url, user, { responseType: 'text' as 'json' });
  }
}

