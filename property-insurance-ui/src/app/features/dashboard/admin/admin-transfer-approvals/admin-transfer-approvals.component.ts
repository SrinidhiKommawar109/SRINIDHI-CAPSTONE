import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyTransferService, TransferRequest, TransferStatus } from '../../../../core/policy-transfer.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-transfer-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-transfer-approvals.component.html',
})
export class AdminTransferApprovalsComponent implements OnInit {
  private readonly transferService = inject(PolicyTransferService);
  private readonly notifications = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);

  pendingRequests: TransferRequest[] = [];
  isLoading = false;
  isProcessing = false;

  selectedRequest: TransferRequest | null = null;
  officerNotes = '';
  apiBaseUrl = environment.apiBaseUrl.replace('/api', '');

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.isLoading = true;
    this.transferService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewRequest(req: TransferRequest): void {
    this.selectedRequest = req;
    this.officerNotes = req.officerNotes || '';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.selectedRequest = null;
    this.cdr.detectChanges();
  }

  approve(): void {
    if (!this.selectedRequest) return;
    this.isProcessing = true;
    this.transferService.approveRequest(this.selectedRequest.id, this.officerNotes).subscribe({
      next: () => {
        this.notifications.show({ title: 'Approved', message: 'Transfer request approved successfully.', type: 'success' });
        this.isProcessing = false;
        this.selectedRequest = null;
        this.loadPending();
      },
      error: (err) => {
        this.isProcessing = false;
        this.notifications.show({ title: 'Error', message: err.error || 'Failed to approve request.', type: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  reject(): void {
    if (!this.selectedRequest) return;
    if (!this.officerNotes) {
      this.notifications.show({ title: 'Error', message: 'Please provide rejection notes.', type: 'error' });
      return;
    }

    this.isProcessing = true;
    this.transferService.rejectRequest(this.selectedRequest.id, this.officerNotes).subscribe({
      next: () => {
        this.notifications.show({ title: 'Rejected', message: 'Transfer request rejected.', type: 'info' });
        this.isProcessing = false;
        this.selectedRequest = null;
        this.loadPending();
      },
      error: (err) => {
        this.isProcessing = false;
        this.notifications.show({ title: 'Error', message: err.error || 'Failed to reject request.', type: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  getFullDocumentUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.apiBaseUrl}${path}`;
  }

  parseAiData(json: string | undefined): any {
    if (!json) return {};
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
}
