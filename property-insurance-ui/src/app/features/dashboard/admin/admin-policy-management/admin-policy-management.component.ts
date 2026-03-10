import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyRequestsService, PolicyRequest } from '../../../../core/policy-requests.service';

@Component({
    selector: 'app-admin-policy-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-policy-management.component.html'
})
export class AdminPolicyManagementComponent implements OnInit {
    private readonly policyService = inject(PolicyRequestsService);
    private readonly cdr = inject(ChangeDetectorRef);

    allRequests: PolicyRequest[] = [];
    loading = false;
    error = '';
    searchTerm = '';

    get filteredRequests(): PolicyRequest[] {
        if (!this.searchTerm.trim()) return this.allRequests;
        const lowSearch = this.searchTerm.toLowerCase();
        return this.allRequests.filter(req =>
            req.customerName?.toLowerCase().includes(lowSearch) ||
            req.planName?.toLowerCase().includes(lowSearch) ||
            req.status.toLowerCase().includes(lowSearch)
        );
    }

    ngOnInit(): void {
        this.loadAllRequests();
    }

    loadAllRequests(): void {
        this.loading = true;
        this.error = '';
        this.policyService.getAdminAllRequests().subscribe({
            next: (data) => {
                this.allRequests = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Failed to load policy data.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'PolicyApproved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'PendingAdmin': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    }

    getClaimStatusClass(status?: string): string {
        if (!status) return 'bg-slate-50 text-slate-400 dark:bg-slate-800/50';
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    }
}
