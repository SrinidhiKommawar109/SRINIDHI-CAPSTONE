import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    PolicyRequestsService,
    PropertyPlan,
} from '../../../../core/policy-requests.service';
import { AdminService } from '../../../../core/admin.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { ChatbotComponent } from '../../../chatbot/chatbot.component';
import { ChatbotService } from '../../../chatbot/chatbot.service';

@Component({
    selector: 'app-customer-browse',
    standalone: true,
    imports: [CommonModule, FormsModule, ChatbotComponent],
    templateUrl: './customer-browse.component.html',
})
export class CustomerBrowseComponent implements OnInit {
    private readonly policies = inject(PolicyRequestsService);
    private readonly adminService = inject(AdminService);
    private readonly notifications = inject(NotificationsService);
    private readonly chatbotService = inject(ChatbotService);
    private readonly cdr = inject(ChangeDetectorRef);

    plans: PropertyPlan[] = [];
    subCategories: any[] = [];
    selectedSubCategoryId: number = 0;

    ngOnInit(): void {
        this.loadPlans();
        this.loadSubCategories();
    }

    loadSubCategories(): void {
        this.adminService.getCategories().subscribe({
            next: (cats: any[]) => {
                // Flatten subcategories from all categories
                this.subCategories = cats.reduce((acc: any[], cat: any) => {
                    return [...acc, ...(cat.subCategories || [])];
                }, []);
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }

    loadPlans(): void {
        this.policies.getAllPlans(this.selectedSubCategoryId || undefined).subscribe({
            next: (plans) => {
                this.plans = plans;
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }

    onFilterChange(): void {
        this.loadPlans();
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
        this.policies.createRequest(planId).subscribe({
            next: (msg) => {
                this.notifications.show({ title: 'Request created', message: 'Your policy request has been submitted.', type: 'success' });
            },
            error: (err) => {
                this.notifications.show({ title: 'Error', message: err?.error || 'Something went wrong.', type: 'error' });
            },
        });
    }

    askAssistantForPlan(plan: PropertyPlan): void {
        const { agentCommission, ...planWithoutCommission } = plan;
        this.chatbotService.setContext(planWithoutCommission, `Explain about ${plan.planName}`);
    }
}
