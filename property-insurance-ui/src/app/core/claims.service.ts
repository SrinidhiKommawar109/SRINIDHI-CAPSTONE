import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Claim {
  id: number;
  policyRequestId: number;
  policyRequest?: {
    plan?: {
      planName: string;
    };
    customer?: {
      fullName: string;
      email: string;
    };
  };
  propertyAddress: string;
  propertyValue: number;
  propertyAge: number;
  claimAmount: number;
  status: string;
  remarks?: string;
  assignedOfficerId?: number;
  assignedOfficer?: {
    fullName: string;
    email: string;
  };
  photoUrls?: string;
}

export interface VerifyClaimPayload {
  isAccepted: boolean;
  remarks?: string;
}

export interface CreateClaimPayload {
  policyRequestId: number;
  propertyAddress: string;
  propertyValue: number;
  propertyAge: number;
  claimAmount: number;
  photos?: File[];
}

@Injectable({
  providedIn: 'root',
})
export class ClaimsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/Claims`;

  getPendingClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.baseUrl + '/pending');
  }

  getClaimsHistory(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.baseUrl + '/history');
  }

  createClaim(payload: CreateClaimPayload): Observable<string> {
    const formData = new FormData();
    formData.append('policyRequestId', payload.policyRequestId.toString());
    formData.append('propertyAddress', payload.propertyAddress);
    formData.append('propertyValue', payload.propertyValue.toString());
    formData.append('propertyAge', payload.propertyAge.toString());
    formData.append('claimAmount', payload.claimAmount.toString());

    if (payload.photos) {
      payload.photos.forEach(file => {
        formData.append('photos', file, file.name);
      });
    }

    return this.http.post(this.baseUrl, formData, {
      responseType: 'text',
    }) as Observable<string>;
  }

  verifyClaim(id: number, payload: VerifyClaimPayload): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/${id}/verify`,
      payload,
      { responseType: 'text' },
    ) as Observable<string>;
  }
}

