import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimsService, Claim } from '../../../../core/claims.service';

@Component({
    selector: 'app-claims-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './claims-history.component.html'
})
export class ClaimsHistoryComponent implements OnInit {
    private readonly claims = inject(ClaimsService);
    private readonly cdr = inject(ChangeDetectorRef);

    claimsHistory: Claim[] = [];
    loading = false;
    errorMessage = '';

    ngOnInit(): void {
        this.loadHistory();
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
                this.errorMessage = 'Failed to load claims history.';
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }
}
