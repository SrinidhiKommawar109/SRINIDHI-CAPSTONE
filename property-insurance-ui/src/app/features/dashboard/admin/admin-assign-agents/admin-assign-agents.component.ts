import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyRequestsService, PolicyRequest } from '../../../../core/policy-requests.service';
import { AdminService, AgentSummary } from '../../../../core/admin.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-admin-assign-agents',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-assign-agents.component.html',
})
export class AdminAssignAgentsComponent implements OnInit {
    private readonly policyRequests = inject(PolicyRequestsService);
    private readonly adminService = inject(AdminService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    pendingRequests: PolicyRequest[] = [];
    agents: AgentSummary[] = [];
    agentSelections: Record<number, number> = {};
    adminNotes: Record<number, string> = {};
    loading = false;
    error = '';

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loadPending();
        this.loadAgents();
    }

    loadPending(): void {
        this.loading = true;
        this.error = '';
        this.policyRequests.getAdminPending().subscribe({
            next: (requests) => {
                this.pendingRequests = requests;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = err?.error?.title || 'Failed to load requests.';
                this.loading = false;
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
            error: () => this.cdr.detectChanges(),
        });
    }

    getPendingAssignmentRequests(): PolicyRequest[] {
        return this.pendingRequests.filter(
            (r) => r.status === 'PendingAdmin' || (r.status as any) === 0
        );
    }

    assignAgent(requestId: number): void {
        const agentId = this.agentSelections[requestId] || 0;
        const notes = this.adminNotes[requestId] || '';
        if (!agentId) {
            this.error = 'Please select an agent before assigning.';
            return;
        }
        this.policyRequests.assignAgent(requestId, agentId, notes).subscribe({
            next: () => {
                this.notifications.show({ title: 'Agent assigned', message: `Request #${requestId} assigned.`, type: 'success' });
                this.loadPending();
            },
            error: (err) => {
                this.error = err?.error?.title || 'Failed to assign agent.';
                this.cdr.detectChanges();
            },
        });
    }
}
