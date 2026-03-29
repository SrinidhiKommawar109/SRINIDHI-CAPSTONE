import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyRequestsService, CalculateRiskResponse, PolicyRequest } from '../../../../core/policy-requests.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-agent-tasks',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './agent-tasks.component.html'
})
export class AgentTasksComponent implements OnInit {
    private readonly policies = inject(PolicyRequestsService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    assignedRequests: PolicyRequest[] = [];
    loading = false;
    lastRisk: CalculateRiskResponse | null = null;
    selectedRequestDetails: PolicyRequest | null = null;
    parsedDetails: any = null;
    errorMessage = '';
    calculatingRequestId: number | null = null;

    // Form Selection State
    selectedFormRequestId: number | null = null;
    selectedFormType: string = 'Residential';

    ngOnInit(): void {
        this.loadAssignedRequests();
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

    openFormSelection(requestId: number): void {
        this.selectedFormRequestId = requestId;
        this.selectedFormType = 'Residential'; // Default
    }

    closeFormSelection(): void {
        this.selectedFormRequestId = null;
    }

    confirmSendForm(): void {
        if (!this.selectedFormRequestId) return;

        const requestId = this.selectedFormRequestId;
        const formType = this.selectedFormType;

        this.errorMessage = '';
        this.policies.sendForm(requestId, formType).subscribe({
            next: () => {
                this.notifications.show({
                    title: 'Form sent',
                    message: `${formType} form sent to customer for Request #${requestId}.`,
                    type: 'success',
                });
                this.closeFormSelection();
                this.loadAssignedRequests(); // Refresh table state
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
        this.calculatingRequestId = requestId;
        this.cdr.detectChanges();

        // Simulate "calculation work"
        setTimeout(() => {
            this.policies.calculateRisk(requestId).subscribe({
                next: (res) => {
                    this.lastRisk = res;
                    this.calculatingRequestId = null;
                    this.notifications.show({
                        title: 'Risk calculated',
                        message: 'Premium and commission calculated.',
                        type: 'success',
                    });
                    this.loadAssignedRequests(); // Refresh table to show score
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.calculatingRequestId = null;
                    this.errorMessage = this.extractError(err);
                    this.cdr.detectChanges();
                },
            });
        }, 2500);
    }

    viewDetails(req: PolicyRequest): void {
        this.selectedRequestDetails = req;
        this.parsedDetails = null;
        if (req.propertyDetailsJson) {
            try {
                this.parsedDetails = JSON.parse(req.propertyDetailsJson);
            } catch (e) {
                console.error('Failed to parse property details JSON', e);
            }
        }
    }

    closeDetails(): void {
        this.selectedRequestDetails = null;
        this.parsedDetails = null;
    }

    formatKey(key: any): string {
        const str = String(key);
        const result = str.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
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
