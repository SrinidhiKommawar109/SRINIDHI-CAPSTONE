import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PolicyRequestsService,
  PolicyRequest,
} from '../../../core/policy-requests.service';
import { AdminService, AgentSummary } from '../../../core/admin.service';
import { NotificationsService } from '../../../core/notifications.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private readonly policyRequests = inject(PolicyRequestsService);
  private readonly adminService = inject(AdminService);
  private readonly notifications = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);

  pendingRequests: PolicyRequest[] = [];
  pendingLoading = false;
  pendingError = '';
  agents: AgentSummary[] = [];
  agentSelections: Record<number, number> = {};
  adminNotes: Record<number, string> = {};

  activeView: 'managePlans' | 'assignAgents' | 'approvals' | 'analytics' = 'assignAgents';

  showAddPlanForm = false;
  categories: any[] = [];
  filteredSubCategories: any[] = [];
  stats: any = null;

  newPlan = {
    planName: '',
    baseCoverageAmount: 0,
    coverageRate: 0,
    basePremium: 0,
    agentCommission: 0,
    frequency: 3,
    subCategoryId: 0,
    categoryId: 0,
  };

  ngOnInit(): void {
    this.loadPending();
    this.loadAgents();
    this.loadCategories();
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  getViewTitle(): string {
    switch (this.activeView) {
      case 'managePlans': return 'Plan Management';
      case 'assignAgents': return 'Agent Assignments';
      case 'approvals': return 'Policy Approvals';
      default: return 'Admin Dashboard';
    }
  }

  getViewSubtitle(): string {
    switch (this.activeView) {
      case 'managePlans': return 'Create and manage insurance plans across different categories.';
      case 'assignAgents': return 'Delegate policy requests to specialized insurance agents.';
      case 'approvals': return 'Review and finalize policies once customers provide confirmation.';
      default: return 'Administrative control center.';
    }
  }

  getPendingAssignmentRequests(): PolicyRequest[] {
    return this.pendingRequests.filter(r =>
      r.status === 'PendingAdmin' || (r.status as any) === 0
    );
  }

  getRequestsForApproval(): PolicyRequest[] {
    return this.pendingRequests.filter(r =>
      r.status === 'CustomerConfirmed' || (r.status as any) === 5
    );
  }

  getFrequencyLabel(freq: string | number): string {
    if (typeof freq === 'number') {
      switch (freq) {
        case 1: return 'Quarterly';
        case 2: return 'Half-Yearly';
        case 3: return 'Yearly';
        default: return 'Unknown';
      }
    }
    return freq || 'Unknown';
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  onCategoryChange(): void {
    const cat = this.categories.find((c) => c.id === this.newPlan.categoryId);
    this.filteredSubCategories = cat ? cat.subCategories : [];
    this.newPlan.subCategoryId = 0;
  }

  toggleAddPlanForm(): void {
    this.showAddPlanForm = !this.showAddPlanForm;
    if (!this.showAddPlanForm) {
      this.resetPlanForm();
    }
  }

  resetPlanForm(): void {
    this.newPlan = {
      planName: '',
      baseCoverageAmount: 0,
      coverageRate: 0,
      basePremium: 0,
      agentCommission: 0,
      frequency: 3,
      subCategoryId: 0,
      categoryId: 0,
    };
    this.filteredSubCategories = [];
  }

  submitPlan(): void {
    if (!this.newPlan.planName || !this.newPlan.subCategoryId) {
      this.notifications.show({
        title: 'Validation Error',
        message: 'Please provide a plan name and select a sub-category.',
        type: 'error',
      });
      return;
    }

    this.adminService.addPlan(this.newPlan).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Plan Added',
          message: `Successfully added plan: ${this.newPlan.planName}`,
          type: 'success',
        });
        this.showAddPlanForm = false;
        this.resetPlanForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
        this.cdr.detectChanges();
      },
    });
  }

  loadAgents(): void {
    this.adminService.getAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  loadPending(): void {
    this.pendingLoading = true;
    this.pendingError = '';
    this.policyRequests.getAdminPending().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.pendingLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
        this.pendingLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  assignAgent(requestId: number): void {
    const agentId = this.agentSelections[requestId] || 0;
    const notes = this.adminNotes[requestId] || '';
    if (!agentId) {
      this.pendingError = 'Please select an agent before assigning.';
      return;
    }

    this.policyRequests.assignAgent(requestId, agentId, notes).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Agent assigned',
          message: `Request #${requestId} assigned successfully.`,
          type: 'success',
        });
        this.loadPending();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
        this.cdr.detectChanges();
      },
    });
  }

  approveAfterCustomer(requestId: number): void {
    this.policyRequests.adminApprove(requestId).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Policy approved',
          message: `Request #${requestId} approved successfully.`,
          type: 'success',
        });
        this.loadPending();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
        this.cdr.detectChanges();
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

