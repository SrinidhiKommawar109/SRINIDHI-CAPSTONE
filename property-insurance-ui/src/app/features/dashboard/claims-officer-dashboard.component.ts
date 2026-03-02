import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService, Claim } from '../../core/claims.service';
import { NotificationsService } from '../../core/notifications.service';

@Component({
  selector: 'app-claims-officer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'claims-dashboard.component.html'
})
export class ClaimsOfficerDashboardComponent implements OnInit {
  private readonly claims = inject(ClaimsService);
  private readonly notifications = inject(NotificationsService);

  pendingClaims: Claim[] = [];
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
      },
      error: (err) => {
        this.errorMessage = this.extractError(err);
        this.loading = false;
      },
    });
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

