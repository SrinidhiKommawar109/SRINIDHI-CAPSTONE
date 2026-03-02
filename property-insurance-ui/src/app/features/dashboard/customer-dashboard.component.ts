import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PolicyRequestsService,
  PolicyRequest,
  PropertyPlan,
  SubmitPropertyPayload,
} from '../../core/policy-requests.service';
import { ClaimsService, CreateClaimPayload } from '../../core/claims.service';
import { InvoicesService, Invoice } from '../../core/invoices.service';
import { NotificationsService } from '../../core/notifications.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'customer-dashboard.component.html'
})
export class CustomerDashboardComponent implements OnInit {
  private readonly policies = inject(PolicyRequestsService);
  private readonly claims = inject(ClaimsService);
  private readonly invoicesService = inject(InvoicesService);
  private readonly notifications = inject(NotificationsService);

  plans: PropertyPlan[] = [];
  createMessage = '';

  myRequests: PolicyRequest[] = [];
  requestsLoading = false;

  submitRequestId = 0;
  submitPayload: SubmitPropertyPayload = {
    propertyAddress: '',
    propertyValue: 0,
    propertyAge: 0,
  };
  submitMessage = '';

  buyRequestId = 0;
  buyMessage = '';
  showPaymentForm = false;

  initiateCheckout(): void {
    if (!this.buyRequestId) return;
    this.showPaymentForm = true;
  }

  claimPayload: CreateClaimPayload = {
    policyRequestId: 0,
    propertyAddress: '',
    propertyValue: 0,
    propertyAge: 0,
  };
  claimMessage = '';

  invoices: Invoice[] = [];
  invoicesLoading = false;

  activeView: 'browse' | 'requests' | 'claims' | 'invoices' = 'browse';

  getViewTitle(): string {
    switch (this.activeView) {
      case 'browse': return 'Insurance Catalog';
      case 'requests': return 'My Subscriptions';
      case 'claims': return 'Claim Center';
      case 'invoices': return 'Billing & Invoices';
      default: return 'Customer Dashboard';
    }
  }

  getViewSubtitle(): string {
    switch (this.activeView) {
      case 'browse': return 'Explore our comprehensive property protection plans tailored for you.';
      case 'requests': return 'Track your submitted policy requests and property details.';
      case 'claims': return 'Report an incident and manage your submitted insurance claims.';
      case 'invoices': return 'View your payment history, installments, and upcoming dues.';
      default: return 'Manage your insurance profile.';
    }
  }

  getInstallmentAmount(plan: PropertyPlan): number {
    const freq = plan.frequency;
    if (freq === 1 || freq === 'Quarterly') return plan.basePremium / 4; // Quarterly
    if (freq === 2 || freq === 'HalfYearly') return plan.basePremium / 2; // Half-Yearly
    return plan.basePremium; // Yearly
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

  ngOnInit(): void {
    this.loadPlans();
    this.loadMyRequests();
    this.loadInvoices();
  }

  loadPlans(): void {
    this.policies.getAllPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
      },
    });
  }

  createRequestForPlan(planId: number): void {
    if (!planId) {
      return;
    }
    this.createMessage = '';
    this.policies.createRequest(planId).subscribe({
      next: (msg) => {
        this.createMessage = msg;
        this.notifications.show({
          title: 'Request created',
          message: 'Your policy request has been submitted.',
          type: 'success',
        });
        this.loadMyRequests();
      },
      error: (err) => {
        this.createMessage = this.extractError(err);
      },
    });
  }

  loadMyRequests(): void {
    this.requestsLoading = true;
    this.policies.getMyRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.requestsLoading = false;
      },
      error: () => {
        this.requestsLoading = false;
      },
    });
  }

  submitProperty(): void {
    if (!this.submitRequestId) {
      return;
    }
    this.submitMessage = '';
    this.policies
      .submitProperty(this.submitRequestId, this.submitPayload)
      .subscribe({
        next: (msg) => {
          this.submitMessage = msg;
          this.notifications.show({
            title: 'Details submitted',
            message: 'Property details sent to the assigned agent.',
            type: 'success',
          });
          this.loadMyRequests();
        },
        error: (err) => {
          this.submitMessage = this.extractError(err);
        },
      });
  }

  confirmPurchase(): void {
    if (!this.buyRequestId) {
      return;
    }
    this.buyMessage = '';
    this.policies.buyPolicy(this.buyRequestId).subscribe({
      next: (msg) => {
        this.buyMessage = msg;
        this.notifications.show({
          title: 'Purchase confirmed',
          message: 'Waiting for admin approval.',
          type: 'info',
        });
        this.loadMyRequests();
      },
      error: (err) => {
        this.buyMessage = this.extractError(err);
      },
    });
  }

  fileClaim(): void {
    if (!this.claimPayload.policyRequestId) {
      return;
    }
    this.claimMessage = '';
    this.claims.createClaim(this.claimPayload).subscribe({
      next: (msg) => {
        this.claimMessage = msg;
        this.notifications.show({
          title: 'Claim submitted',
          message: 'Your claim is now pending review.',
          type: 'success',
        });
        this.loadInvoices();
      },
      error: (err) => {
        this.claimMessage = this.extractError(err);
      },
    });
  }

  loadInvoices(): void {
    this.invoicesLoading = true;
    this.invoicesService.getMyInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.invoicesLoading = false;
      },
      error: () => {
        this.invoicesLoading = false;
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

