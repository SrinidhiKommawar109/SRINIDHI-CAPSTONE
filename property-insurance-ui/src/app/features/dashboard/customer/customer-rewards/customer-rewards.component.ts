import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-customer-rewards',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './customer-rewards.component.html'
})
export class CustomerRewardsComponent implements OnInit {
    private readonly auth = inject(AuthService);
    private readonly notifications = inject(NotificationsService);

    referralCode = '';
    referralBalance = 0;
    referralsCount = 0;
    loading = false;

    ngOnInit() {
        this.refreshStats();
    }

    refreshStats() {
        this.referralCode = this.auth.getReferralCode() || '';
        this.referralBalance = this.auth.getReferralBalance();
        this.referralsCount = this.auth.getReferralsCount();
    }

    onRedeem() {
        if (this.referralBalance <= 0) return;

        this.loading = true;
        this.auth.redeem(this.referralBalance)?.subscribe({
            next: () => {
                this.loading = false;
                this.notifications.show({
                    title: 'Redemption Requested',
                    message: `Successfully requested redemption of ₹${this.referralBalance}.`,
                    type: 'success'
                });

                // Update local state and storage
                localStorage.setItem('pis_balance', '0');
                this.refreshStats();
            },
            error: () => {
                this.loading = false;
                this.notifications.show({
                    title: 'Error',
                    message: 'Failed to process redemption.',
                    type: 'error'
                });
            }
        });
    }
}

