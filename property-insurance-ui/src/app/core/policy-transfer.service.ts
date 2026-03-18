import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum TransferReason {
  Sale = 'Sale',
  Inheritance = 'Inheritance',
  Gift = 'Gift'
}

export enum TransferStatus {
  Pending = 'Pending',
  UnderReview = 'UnderReview',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface TransferDocument {
  id: number;
  documentType: string;
  filePath: string;
  uploadedAt: Date;
  extractedText?: string;
  extractedDataJson?: string;
  aiSummary?: string;
}

export interface TransferRequest {
  id: number;
  policyId: number;
  policyPlanName: string;
  currentOwnerId: number;
  currentOwnerName: string;
  newOwnerName: string;
  newOwnerEmail: string;
  newOwnerPhone: string;
  transferReason: TransferReason;
  status: TransferStatus;
  requestedAt: Date;
  officerNotes?: string;
  documents: TransferDocument[];
}

@Injectable({
  providedIn: 'root'
})
export class PolicyTransferService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/policy-transfer`;

  createRequest(payload: {
    policyId: number;
    newOwnerName: string;
    newOwnerEmail: string;
    newOwnerPhone: string;
    transferReason: string;
  }): Observable<{ requestId: number; message: string }> {
    return this.http.post<{ requestId: number; message: string }>(`${this.baseUrl}/request`, payload);
  }

  uploadDocument(requestId: number, documentType: string, file: File): Observable<{ documentId: number; filePath: string; message: string }> {
    const formData = new FormData();
    formData.append('transferRequestId', requestId.toString());
    formData.append('documentType', documentType);
    formData.append('file', file);

    return this.http.post<{ documentId: number; filePath: string; message: string }>(`${this.baseUrl}/upload-document`, formData);
  }

  saveDocumentAnalysis(documentId: number, analysis: {
    extractedText: string;
    extractedDataJson: string;
    aiSummary: string;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/document/${documentId}/analysis`, analysis);
  }

  getMyRequests(): Observable<TransferRequest[]> {
    return this.http.get<TransferRequest[]>(`${this.baseUrl}/my-requests`);
  }

  getPendingRequests(): Observable<TransferRequest[]> {
    return this.http.get<TransferRequest[]>(`${this.baseUrl}/pending`);
  }

  approveRequest(id: number, officerNotes?: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/approve/${id}`, { officerNotes }, { responseType: 'text' });
  }

  rejectRequest(id: number, officerNotes?: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/reject/${id}`, { officerNotes }, { responseType: 'text' });
  }
}
