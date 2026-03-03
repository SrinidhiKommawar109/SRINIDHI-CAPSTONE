import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolicyRequestsService,
  CalculateRiskResponse,
  PolicyRequest,
} from '../../../core/policy-requests.service';
import { NotificationsService } from '../../../core/notifications.service';
@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'agent-dashboard.component.html'
})
export class AgentDashboardComponent implements OnInit {
  private readonly policies = inject(PolicyRequestsService);
  private readonly notifications = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);

  assignedRequests: PolicyRequest[] = [];
  loading = false;
  lastRisk: CalculateRiskResponse | null = null;
  selectedRequestDetails: PolicyRequest | null = null;
  errorMessage = '';
  totalCommission = 0;

  ngOnInit(): void {
    this.loadAssignedRequests();
    this.loadApprovedCommission();
  }

  loadAssignedRequests(): void {
    this.loading = true;
    this.policies.getAgentAssigned().subscribe({
      next: (requests) => {
        this.assignedRequests = requests;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadApprovedCommission(): void {
    this.policies.getAgentApproved().subscribe({
      next: (requests) => {
        this.totalCommission = requests.reduce(
          (sum, req) => sum + (req.agentCommissionAmount || 0),
          0,
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        this.cdr.detectChanges();
      },
    });
  }

  sendForm(requestId: number): void {
    if (!requestId) {
      return;
    }
    this.errorMessage = '';
    this.policies.sendForm(requestId).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Form sent',
          message: `Request #${requestId} sent to customer.`,
          type: 'success',
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        this.cdr.detectChanges();
      },
    });
  }

  calculateRisk(requestId: number): void {
    if (!requestId) {
      return;
    }
    this.errorMessage = '';
    this.policies.calculateRisk(requestId).subscribe({
      next: (res) => {
        this.lastRisk = res;
        this.notifications.show({
          title: 'Risk calculated',
          message: 'Premium and commission calculated.',
          type: 'success',
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        this.cdr.detectChanges();
      },
    });
  }

  viewDetails(req: PolicyRequest): void {
    this.selectedRequestDetails = req;
  }

  closeDetails(): void {
    this.selectedRequestDetails = null;
  }

  private extractError(err: any): string {
    if (err?.error && typeof err.error === 'string') {
      return err.error;
    }
    if (err?.error?.title) {
      return err.error.title;
    }
    return 'Something went wrong while processing the request.';
  }
}

