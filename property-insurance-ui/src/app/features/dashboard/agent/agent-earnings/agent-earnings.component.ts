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
    referralBalance = 0;
    referralsCount = 0;
    referralCode = '';
    loading = false;
    errorMessage = '';

    ngOnInit(): void {
        this.loadApprovedCommission();
        this.refreshReferralStats();
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
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage = 'Failed to load commission data.';
                this.cdr.detectChanges();
            },
        });
    }
}
