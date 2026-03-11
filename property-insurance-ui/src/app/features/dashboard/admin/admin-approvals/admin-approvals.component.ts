import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyRequestsService, PolicyRequest } from '../../../../core/policy-requests.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-admin-approvals',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-approvals.component.html',
})
export class AdminApprovalsComponent implements OnInit {
    private readonly policyRequests = inject(PolicyRequestsService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    pendingRequests: PolicyRequest[] = [];
    loading = false;
    error = '';
    processingIds = new Set<number>();

    ngOnInit(): void {
        this.loadPending();
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

    getRequestsForApproval(): PolicyRequest[] {
        return this.pendingRequests.filter(
            (r) => r.status === 'CustomerConfirmed' || (r.status as any) === 5
        );
    }

    approveAfterCustomer(requestId: number): void {
        if (this.processingIds.has(requestId)) return;

        this.processingIds.add(requestId);
        this.cdr.detectChanges();

        this.policyRequests.adminApprove(requestId).subscribe({
            next: () => {
                this.notifications.show({ title: 'Policy approved', message: `Request #${requestId} approved.`, type: 'success' });
                this.processingIds.delete(requestId);
                this.loadPending();
            },
            error: (err) => {
                this.error = err?.error?.title || 'Failed to approve.';
                this.processingIds.delete(requestId);
                this.cdr.detectChanges();
            },
        });
    }
}
