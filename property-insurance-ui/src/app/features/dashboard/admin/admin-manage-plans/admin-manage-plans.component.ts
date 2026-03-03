import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/admin.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-admin-manage-plans',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-manage-plans.component.html',
})
export class AdminManagePlansComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    categories: any[] = [];
    filteredSubCategories: any[] = [];
    showAddPlanForm = false;
    error = '';

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
        this.loadCategories();
    }

    loadCategories(): void {
        this.adminService.getCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }

    onCategoryChange(): void {
        const cat = this.categories.find((c) => c.id === this.newPlan.categoryId);
        this.filteredSubCategories = cat ? cat.subCategories : [];
        this.newPlan.subCategoryId = 0;
    }

    toggleAddPlanForm(): void {
        this.showAddPlanForm = !this.showAddPlanForm;
        if (!this.showAddPlanForm) this.resetPlanForm();
    }

    resetPlanForm(): void {
        this.newPlan = {
            planName: '', baseCoverageAmount: 0, coverageRate: 0, basePremium: 0,
            agentCommission: 0, frequency: 3, subCategoryId: 0, categoryId: 0,
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
                this.notifications.show({ title: 'Plan Added', message: `Successfully added: ${this.newPlan.planName}`, type: 'success' });
                this.showAddPlanForm = false;
                this.resetPlanForm();
                this.loadCategories();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = err?.error?.title || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
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
}
