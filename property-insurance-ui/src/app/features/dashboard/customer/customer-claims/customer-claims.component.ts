import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService, CreateClaimPayload } from '../../../../core/claims.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-customer-claims',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-claims.component.html',
})
export class CustomerClaimsComponent {
    private readonly claims = inject(ClaimsService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    claimPayload: CreateClaimPayload = {
        policyRequestId: 0,
        propertyAddress: '',
        propertyValue: 0,
        propertyAge: 0,
        claimAmount: 0,
        photos: [],
    };
    claimMessage = '';
    selectedFileNames: string[] = [];

    handleFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.claimPayload.photos = Array.from(input.files);
            this.selectedFileNames = this.claimPayload.photos.map(f => f.name);
        }
    }

    fileClaim(): void {
        if (!this.claimPayload.policyRequestId) return;
        if (this.claimPayload.claimAmount <= 0) {
            this.claimMessage = 'Please enter a valid claim amount.';
            return;
        }
        this.claimMessage = '';
        this.claims.createClaim(this.claimPayload).subscribe({
            next: (msg) => {
                this.claimMessage = msg;
                this.notifications.show({ title: 'Claim submitted', message: 'Your claim is now pending review.', type: 'success' });
            },
            error: (err) => {
                this.claimMessage = err?.error || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
    }

}
