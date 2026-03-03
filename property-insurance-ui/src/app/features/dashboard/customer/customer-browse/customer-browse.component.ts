import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    PolicyRequestsService,
    PropertyPlan,
} from '../../../../core/policy-requests.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-customer-browse',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-browse.component.html',
})
export class CustomerBrowseComponent implements OnInit {
    private readonly policies = inject(PolicyRequestsService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    plans: PropertyPlan[] = [];
    createMessage = '';

    ngOnInit(): void {
        this.loadPlans();
    }

    loadPlans(): void {
        this.policies.getAllPlans().subscribe({
            next: (plans) => {
                this.plans = plans;
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }

    getInstallmentAmount(plan: PropertyPlan): number {
        const freq = plan.frequency;
        if (freq === 1 || freq === 'Quarterly') return plan.basePremium / 4;
        if (freq === 2 || freq === 'HalfYearly') return plan.basePremium / 2;
        return plan.basePremium;
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

    createRequestForPlan(planId: number): void {
        if (!planId) return;
        this.createMessage = '';
        this.policies.createRequest(planId).subscribe({
            next: (msg) => {
                this.createMessage = msg;
                this.notifications.show({ title: 'Request created', message: 'Your policy request has been submitted.', type: 'success' });
            },
            error: (err) => {
                this.createMessage = err?.error || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
    }
}
