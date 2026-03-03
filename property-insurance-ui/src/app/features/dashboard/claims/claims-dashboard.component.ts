import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService, Claim } from '../../../core/claims.service';
import { NotificationsService } from '../../../core/notifications.service';

@Component({
  selector: 'app-claims-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'claims-dashboard.component.html'
})
export class ClaimsDashboardComponent implements OnInit {
  private readonly claims = inject(ClaimsService);
  private readonly notifications = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);

  pendingClaims: Claim[] = [];
  claimsHistory: Claim[] = [];
  activeTab: 'pending' | 'history' = 'pending';
  claimRemarks: Record<number, string> = {};
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.errorMessage = '';
    this.claims.getPendingClaims().subscribe({
      next: (claims) => {
        this.pendingClaims = claims;
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

  loadHistory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.claims.getClaimsHistory().subscribe({
      next: (claims) => {
        this.claimsHistory = claims;
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

  switchTab(tab: 'pending' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.loadPending();
    } else {
      this.loadHistory();
    }
  }

  verifyClaim(id: number, accepted: boolean): void {
    this.claims
      .verifyClaim(id, {
        isAccepted: accepted,
        remarks: this.claimRemarks[id] || '',
      })
      .subscribe({
        next: () => {
          this.notifications.show({
            title: accepted ? 'Claim approved' : 'Claim rejected',
            message: `Claim #${id} processed.`,
            type: accepted ? 'success' : 'info',
          });
          this.loadPending();
        },
        error: (err) => {
          this.errorMessage = this.extractError(err);
          this.cdr.detectChanges();
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
    if (err?.status) {
      return `Error ${err.status}: ${err.statusText || 'Terminal failure'}`;
    }
    return 'Something went wrong while processing the request.';
  }
}

