import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PolicyChatRequest {
  question: string;
  contextPolicy?: string;
}

export interface PolicyChatResponse {
  answer: string;
  isOutOfScope: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  // Re-use environment apiBaseUrl but override route
  private apiUrl = `${environment.apiBaseUrl}/policy-chat`;

  // Context support
  private contextSubject = new Subject<{ planData: any, prefillMessage: string }>();
  context$ = this.contextSubject.asObservable();

  setContext(planData: any, prefillMessage: string) {
    this.contextSubject.next({ planData, prefillMessage });
  }

  sendMessage(request: PolicyChatRequest): Observable<PolicyChatResponse> {
    return this.http.post<PolicyChatResponse>(this.apiUrl, request);
  }
}
