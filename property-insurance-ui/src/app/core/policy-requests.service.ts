import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PropertyPlan {
  id: number;
  planName: string;
  baseCoverageAmount: number;
  coverageRate: number;
  basePremium: number;
  agentCommission: number;
  frequency: string | number;
}

export interface PolicyRequest {
  id: number;
  planId: number;
  customerId?: number;
  agentId?: number;
  status: string;
  riskScore?: number;
  totalPremium?: number;
  installmentCount?: number;
  installmentAmount?: number;
  agentCommissionAmount?: number;
  adminNotes?: string;
  propertyAddress?: string;
  propertyValue?: number;
  propertyAge?: number;
  customer?: {
    fullName: string;
    email: string;
  } | null;
  plan?: {
    planName: string;
  } | null;

  claimsOfficerId?: number;
  claimsOfficerName?: string;
  claimId?: number;
  claimStatus?: string;

  customerName?: string;
  planName?: string;
  agentName?: string;
  formType?: string;
}

export interface SubmitPropertyPayload {
  propertyAddress: string;
  propertyValue: number;
  propertyAge: number;
  propertyDetailsJson?: string;
}

export interface CalculateRiskResponse {
  id: number;
  planId: number;
  planName: string;
  riskScore: number;
  totalPremium: number;
  frequency: string;
  installmentCount: number;
  installmentAmount: number;
  agentCommissionAmount: number;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class PolicyRequestsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/PolicyRequests`;
  private readonly plansUrl = `${environment.apiBaseUrl}/PropertyPlans`;

  getAllPlans(subCategoryId?: number): Observable<PropertyPlan[]> {
    let url = this.plansUrl;
    if (subCategoryId) {
      url += `?subCategoryId=${subCategoryId}`;
    }
    return this.http.get<PropertyPlan[]>(url);
  }

  createRequest(planId: number): Observable<string> {
    return this.http.post(this.baseUrl + '/create', { planId }, {
      responseType: 'text',
    }) as Observable<string>;
  }

  getAdminPending(): Observable<PolicyRequest[]> {
    return this.http.get<PolicyRequest[]>(this.baseUrl + '/admin/pending').pipe(
      map(requests => requests.map(req => ({
        ...req,
        riskScore: req.riskScore !== undefined ? Math.min(100, req.riskScore) : undefined
      })))
    );
  }

  assignAgent(requestId: number, agentId: number, adminNotes?: string): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/${requestId}/assign-agent/${agentId}`,
      JSON.stringify(adminNotes || ''),
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text'
      },
    ) as Observable<string>;
  }

  sendForm(requestId: number, formType: string): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/${requestId}/send-form?formType=${encodeURIComponent(formType)}`,
      {},
      { responseType: 'text' },
    ) as Observable<string>;
  }

  submitProperty(
    requestId: number,
    payload: SubmitPropertyPayload,
  ): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/${requestId}/submit-form`,
      payload,
      { responseType: 'text' },
    ) as Observable<string>;
  }

  calculateRisk(requestId: number): Observable<CalculateRiskResponse> {
    return this.http.put<CalculateRiskResponse>(
      `${this.baseUrl}/${requestId}/calculate-risk`,
      {},
    ).pipe(
      map(res => ({
        ...res,
        riskScore: Math.min(100, res.riskScore)
      }))
    );
  }

  buyPolicy(requestId: number): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/${requestId}/buy`,
      {},
      { responseType: 'text' },
    ) as Observable<string>;
  }

  adminApprove(requestId: number): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/${requestId}/admin-approve`,
      {},
      { responseType: 'text' },
    ) as Observable<string>;
  }

  getMyRequests(): Observable<PolicyRequest[]> {
    return this.http.get<PolicyRequest[]>(
      this.baseUrl + '/customer/my-requests',
    ).pipe(
      map(requests => requests.map(req => ({
        ...req,
        riskScore: req.riskScore !== undefined ? Math.min(100, req.riskScore) : undefined
      })))
    );
  }

  getAgentApproved(): Observable<PolicyRequest[]> {
    return this.http.get<PolicyRequest[]>(
      this.baseUrl + '/agent/approved',
    ).pipe(
      map(requests => requests.map(req => ({
        ...req,
        riskScore: req.riskScore !== undefined ? Math.min(100, req.riskScore) : undefined
      })))
    );
  }

  getAgentAssigned(): Observable<PolicyRequest[]> {
    return this.http.get<PolicyRequest[]>(
      this.baseUrl + '/agent/assigned',
    ).pipe(
      map(requests => requests.map(req => ({
        ...req,
        riskScore: req.riskScore !== undefined ? Math.min(100, req.riskScore) : undefined
      })))
    );
  }

  getAdminAllRequests(): Observable<PolicyRequest[]> {
    return this.http.get<PolicyRequest[]>(`${this.baseUrl}/admin/all`).pipe(
      map(requests => requests.map(req => ({
        ...req,
        riskScore: req.riskScore !== undefined ? Math.min(100, req.riskScore) : undefined
      })))
    );
  }
}

