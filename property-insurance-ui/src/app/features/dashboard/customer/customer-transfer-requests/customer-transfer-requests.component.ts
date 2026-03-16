import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyTransferService, TransferRequest, TransferReason, TransferStatus } from '../../../../core/policy-transfer.service';
import { PolicyRequestsService, PolicyRequest } from '../../../../core/policy-requests.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
  selector: 'app-customer-transfer-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-transfer-requests.component.html',
})
export class CustomerTransferRequestsComponent implements OnInit {
  private readonly transferService = inject(PolicyTransferService);
  private readonly policyService = inject(PolicyRequestsService);
  private readonly notifications = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);

  myRequests: TransferRequest[] = [];
  myPolicies: PolicyRequest[] = [];
  isLoading = false;
  isSubmitting = false;

  showForm = false;
  currentStep = 1; // 1: Details, 2: Documents

  // Form Model
  newRequest = {
    policyId: 0,
    newOwnerName: '',
    newOwnerEmail: '',
    newOwnerPhone: '',
    transferReason: ''
  };

  createdRequestId: number | null = null;
  uploadedFiles: { [key: string]: File } = {};
  requiredDocuments: string[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.policyService.getMyRequests().subscribe({
      next: (policies) => {
        this.myPolicies = policies.filter(p => p.status === 'PolicyApproved');
        this.loadTransferRequests();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransferRequests(): void {
    this.transferService.getMyRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openForm(): void {
    this.showForm = true;
    this.currentStep = 1;
    this.newRequest = {
      policyId: 0,
      newOwnerName: '',
      newOwnerEmail: '',
      newOwnerPhone: '',
      transferReason: ''
    };
    this.cdr.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.cdr.detectChanges();
  }

  onReasonChange(): void {
    this.updateRequiredDocuments();
  }

  updateRequiredDocuments(): void {
    const reason = this.newRequest.transferReason;
    if (reason === 'Sale') {
      this.requiredDocuments = ['Sale Deed', 'New Owner ID Proof'];
    } else if (reason === 'Inheritance') {
      this.requiredDocuments = ['Death Certificate', 'Legal Heir Certificate'];
    } else if (reason === 'Gift') {
      this.requiredDocuments = ['Gift Deed', 'New Owner ID Proof'];
    } else {
      this.requiredDocuments = [];
    }
  }

  submitRequest(): void {
    if (!this.newRequest.policyId || !this.newRequest.transferReason) {
      this.notifications.show({ title: 'Error', message: 'Please fill all required fields.', type: 'error' });
      return;
    }

    this.isSubmitting = true;
    this.transferService.createRequest(this.newRequest as any).subscribe({
      next: (res) => {
        this.createdRequestId = res.requestId;
        this.currentStep = 2;
        this.isSubmitting = false;
        this.notifications.show({ title: 'Success', message: 'Request created. Please upload documents.', type: 'success' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notifications.show({ title: 'Error', message: err.error || 'Failed to create request.', type: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any, docType: string): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles[docType] = file;
    }
  }

  uploadDocuments(): void {
    if (!this.createdRequestId) return;

    const uploads = this.requiredDocuments.map(docType => {
      const file = this.uploadedFiles[docType];
      if (!file) {
        this.notifications.show({ title: 'Error', message: `Please select ${docType}`, type: 'error' });
        return null;
      }
      return this.transferService.uploadDocument(this.createdRequestId!, docType, file);
    }).filter(u => u !== null);

    if (uploads.length < this.requiredDocuments.length) return;

    this.isSubmitting = true;
    let completed = 0;
    uploads.forEach(obs => {
      obs?.subscribe({
        next: () => {
          completed++;
          if (completed === uploads.length) {
            this.finishUpload();
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.notifications.show({ title: 'Error', message: 'Failed to upload some documents.', type: 'error' });
          this.cdr.detectChanges();
        }
      });
    });
  }

  finishUpload(): void {
    this.isSubmitting = false;
    this.showForm = false;
    this.notifications.show({ title: 'Success', message: 'Transfer request submitted successfully.', type: 'success' });
    this.loadData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'UnderReview': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
