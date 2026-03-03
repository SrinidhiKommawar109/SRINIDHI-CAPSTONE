import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    PolicyRequestsService,
    PolicyRequest,
    SubmitPropertyPayload,
} from '../../../../core/policy-requests.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-customer-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-requests.component.html',
})
export class CustomerRequestsComponent implements OnInit {
    private readonly policies = inject(PolicyRequestsService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    myRequests: PolicyRequest[] = [];
    requestsLoading = false;

    submitRequestId = 0;
    submitPayload: SubmitPropertyPayload = { propertyAddress: '', propertyValue: 0, propertyAge: 0 };
    submitMessage = '';

    buyRequestId = 0;
    buyMessage = '';
    showPaymentForm = false;

    ngOnInit(): void {
        this.loadMyRequests();
    }

    loadMyRequests(): void {
        this.requestsLoading = true;
        this.policies.getMyRequests().subscribe({
            next: (requests) => {
                this.myRequests = requests;
                this.requestsLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.requestsLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    submitProperty(): void {
        if (!this.submitRequestId) return;
        this.submitMessage = '';
        this.policies.submitProperty(this.submitRequestId, this.submitPayload).subscribe({
            next: (msg) => {
                this.submitMessage = msg;
                this.notifications.show({ title: 'Details submitted', message: 'Property details sent to the assigned agent.', type: 'success' });
                this.loadMyRequests();
            },
            error: (err) => {
                this.submitMessage = err?.error || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
    }

    initiateCheckout(): void {
        if (!this.buyRequestId) return;
        this.showPaymentForm = true;
    }

    confirmPurchase(): void {
        if (!this.buyRequestId) return;
        this.buyMessage = '';
        this.policies.buyPolicy(this.buyRequestId).subscribe({
            next: (msg) => {
                this.buyMessage = msg;
                this.notifications.show({ title: 'Purchase confirmed', message: 'Waiting for admin approval.', type: 'info' });
                this.showPaymentForm = false;
                this.loadMyRequests();
            },
            error: (err) => {
                this.buyMessage = err?.error || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
    }
}
