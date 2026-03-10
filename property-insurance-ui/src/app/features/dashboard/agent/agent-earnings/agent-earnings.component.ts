import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyRequestsService } from '../../../../core/policy-requests.service';
import { AuthService } from '../../../../core/auth.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-agent-earnings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './agent-earnings.component.html'
})
export class AgentEarningsComponent implements OnInit {
    private readonly policies = inject(PolicyRequestsService);
    private readonly auth = inject(AuthService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    totalCommission = 0;
    availableBalance = 0;
    pendingWithdrawal = 0;
    referralBalance = 0;
    referralsCount = 0;
    referralCode = '';
    loading = false;
    errorMessage = '';

    showTransactions = false;
    transactions = [
        { id: 1, type: 'Commission', amount: 1500, date: '2023-10-25', status: 'Completed', description: 'Policy #101 Approved' },
        { id: 2, type: 'Withdrawal', amount: -500, date: '2023-10-26', status: 'Pending', description: 'Bank Transfer' },
        { id: 3, type: 'Referral', amount: 300, date: '2023-10-27', status: 'Completed', description: 'Referral Code: REF123' }
    ];

    ngOnInit(): void {
        this.loadApprovedCommission();
        this.refreshReferralStats();
        // Initialize from storage or services if available
        this.availableBalance = this.totalCommission;
        this.pendingWithdrawal = 0;
    }

    refreshReferralStats(): void {
        this.referralCode = this.auth.getReferralCode() || '';
        this.referralBalance = this.auth.getReferralBalance();
        this.referralsCount = this.auth.getReferralsCount();
        this.cdr.detectChanges();
    }

    onRedeemReferral(): void {
        if (this.referralBalance <= 0) return;

        this.loading = true;
        this.auth.redeem(this.referralBalance)?.subscribe({
            next: () => {
                this.loading = false;
                this.notifications.show({
                    title: 'Redeemed Successfully',
                    message: `Requested redemption of ₹${this.referralBalance}.`,
                    type: 'success'
                });
                localStorage.setItem('pis_balance', '0');
                this.refreshReferralStats();
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

    loadApprovedCommission(): void {
        this.policies.getAgentApproved().subscribe({
            next: (requests) => {
                this.totalCommission = requests.reduce(
                    (sum, req) => sum + (req.agentCommissionAmount || 0),
                    0,
                );
                this.availableBalance = this.totalCommission;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage = 'Failed to load commission data.';
                this.cdr.detectChanges();
            },
        });
    }

    onWithdraw(): void {
        if (this.availableBalance <= 0) return;

        const amount = this.availableBalance;
        this.pendingWithdrawal += amount;
        this.availableBalance = 0;

        // Add to transaction history
        const newTx = {
            id: this.transactions.length + 1,
            type: 'Withdrawal',
            amount: -amount,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            description: 'Bank Transfer'
        };
        this.transactions = [newTx, ...this.transactions];

        this.notifications.show({
            title: 'Withdrawal Requested',
            message: `Withdrawal of ₹${amount} initiated.`,
            type: 'info'
        });

        this.cdr.detectChanges();
    }

    onTransactionHistory(): void {
        this.showTransactions = true;
    }

    closeTransactions(): void {
        this.showTransactions = false;
    }
}
