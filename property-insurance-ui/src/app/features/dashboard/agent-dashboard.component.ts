import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolicyRequestsService,
  CalculateRiskResponse,
  PolicyRequest,
} from '../../core/policy-requests.service';
import { NotificationsService } from '../../core/notifications.service';
@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'agent-dashboard.component.html'
})
export class AgentDashboardComponent implements OnInit {
  private readonly policies = inject(PolicyRequestsService);
  private readonly notifications = inject(NotificationsService);

  assignedRequests: PolicyRequest[] = [];
  loading = false;
  lastRisk: CalculateRiskResponse | null = null;
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
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        this.loading = false;
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
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
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
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
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
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
      },
    });
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

