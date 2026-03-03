import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService, Claim } from '../../../../core/claims.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-claims-pending',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './claims-pending.component.html'
})
export class ClaimsPendingComponent implements OnInit {
    private readonly claims = inject(ClaimsService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

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
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.loading = false;
                this.cdr.detectChanges();
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
        return 'Something went wrong while processing the request.';
    }
}
