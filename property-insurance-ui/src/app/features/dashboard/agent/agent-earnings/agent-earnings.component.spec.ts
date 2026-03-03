import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentEarningsComponent } from './agent-earnings.component';
import { PolicyRequestsService } from '../../../../core/policy-requests.service';
import { AuthService } from '../../../../core/auth.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('AgentEarningsComponent', () => {
    let component: AgentEarningsComponent;
    let fixture: ComponentFixture<AgentEarningsComponent>;
    let mockPolicyService: any;
    let mockAuthService: any;
    let mockNotificationsService: any;

    beforeEach(async () => {
        mockPolicyService = {
            getAgentApproved: vi.fn(() => of([]))
        };

        mockAuthService = {
            getReferralCode: vi.fn(() => 'REF789'),
            getReferralBalance: vi.fn(() => 200),
            getReferralsCount: vi.fn(() => 4),
            redeem: vi.fn(() => of({}))
        };

        mockNotificationsService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [AgentEarningsComponent, CommonModule, HttpClientTestingModule],
            providers: [
                { provide: PolicyRequestsService, useValue: mockPolicyService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationsService, useValue: mockNotificationsService },
                ChangeDetectorRef
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AgentEarningsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.referralCode).toBe('REF789');
        expect(component.referralBalance).toBe(200);
    });

    it('should redeem referral rewards', () => {
        component.onRedeemReferral();
        expect(mockAuthService.redeem).toHaveBeenCalledWith(200);
        expect(mockNotificationsService.show).toHaveBeenCalled();
    });
});
