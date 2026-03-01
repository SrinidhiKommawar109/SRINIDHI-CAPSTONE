import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService, Claim } from '../../core/claims.service';
import { NotificationsService } from '../../core/notifications.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell.component';

@Component({
  selector: 'app-claims-officer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationBellComponent],
  template: `
    <section class="max-w-5xl mx-auto px-4 py-8 md:py-10">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Claims Officer Dashboard
          </h1>
          <p class="text-xs md:text-sm text-slate-500 mt-1 dark:text-slate-400">
            Review pending claims, verify eligibility, and approve or reject payouts.
          </p>
        </div>
        <div class="flex items-center gap-4">
          <app-notification-bell></app-notification-bell>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3 text-xs text-slate-700 dark:text-slate-200">
        <span class="font-semibold">Pending claims</span>
        <button
          type="button"
          class="rounded-full border border-slate-300 px-3 py-1 text-[11px] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
          (click)="loadPending()"
        >
          Refresh
        </button>
      </div>

      <div *ngIf="loading" class="text-[11px] text-slate-500 mb-3 dark:text-slate-400">
        Loading pending claims…
      </div>
      <div *ngIf="errorMessage" class="text-[11px] text-rose-600 mb-3 dark:text-rose-300">
        {{ errorMessage }}
      </div>
      <div *ngIf="!loading && pendingClaims.length === 0" class="text-[11px] text-slate-500 mb-3 dark:text-slate-400">
        No pending claims.
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div
          *ngFor="let claim of pendingClaims"
          class="rounded-xl border border-slate-200 bg-white/90 p-3 text-[11px] text-slate-700 space-y-2 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900 dark:text-slate-50">Claim #{{ claim.id }}</span>
            <span class="text-[10px] text-slate-500 dark:text-slate-300">{{ claim.status }}</span>
          </div>
          <div class="text-slate-500 dark:text-slate-400">
            Policy request ID: {{ claim.policyRequestId }}
          </div>
          <div class="text-slate-500 dark:text-slate-400">
            Claim amount: {{ claim.claimAmount | number: '1.2-2' }}
          </div>

          <div class="mt-2">
            <label class="text-[10px] text-slate-500 dark:text-slate-400">Remarks (optional)</label>
            <input
              type="text"
              class="w-full rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              [(ngModel)]="claimRemarks[claim.id]"
              placeholder="Add a remark"
            />
          </div>

          <div class="flex items-center gap-2 mt-2">
            <button
              type="button"
              class="rounded bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
              (click)="verifyClaim(claim.id, true)"
            >
              Approve
            </button>
            <button
              type="button"
              class="rounded bg-rose-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-rose-400"
              (click)="verifyClaim(claim.id, false)"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
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

