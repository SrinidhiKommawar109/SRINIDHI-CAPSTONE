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
    referralBalance = 0; // This is the total wallet balance
    referralEarnings = 0;
    availableDiscount = 0;
    referralsCount = 0;
    loading = false;

    showTransactions = false;
    transactions = [
        { id: 1, type: 'Referral Reward', amount: 50, date: '2023-11-01', status: 'Completed', description: 'Referred friend: John Doe' },
        { id: 2, type: 'Redemption', amount: -200, date: '2023-11-05', status: 'Pending', description: 'Cash redemption request' },
        { id: 3, type: 'Premium Discount', amount: -150, date: '2023-11-10', status: 'Completed', description: 'Used for Policy #205' }
    ];

    ngOnInit() {
        this.refreshStats();
    }

    refreshStats() {
        this.referralCode = this.auth.getReferralCode() || '';
        this.referralBalance = this.auth.getReferralBalance();
        this.referralsCount = this.auth.getReferralsCount();

        // For demonstration based on user request (₹500 total, ₹300 earnings, ₹200 discount)
        // In a real app, these would be separate fields in the user's wallet/referral record
        this.referralEarnings = this.referralBalance * 0.6; // Mock distribution
        this.availableDiscount = this.referralBalance * 0.4;
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

                // Add to transaction history
                const newTx = {
                    id: this.transactions.length + 1,
                    type: 'Redemption',
                    amount: -this.referralBalance,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pending',
                    description: 'Cash redemption request'
                };
                this.transactions = [newTx, ...this.transactions];

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

    onUseForPremium() {
        this.notifications.show({
            title: 'Discount Applied',
            message: 'Your available discount will be applied during the next policy purchase.',
            type: 'success'
        });
    }

    onTransactionHistory() {
        this.showTransactions = true;
    }

    closeTransactions() {
        this.showTransactions = false;
    }

    onRedeemRewards() {
        this.onRedeem();
    }
}
