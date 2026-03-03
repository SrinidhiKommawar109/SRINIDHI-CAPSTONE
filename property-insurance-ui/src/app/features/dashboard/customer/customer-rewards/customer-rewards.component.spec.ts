import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerRewardsComponent } from './customer-rewards.component';
import { AuthService } from '../../../../core/auth.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

describe('CustomerRewardsComponent', () => {
    let component: CustomerRewardsComponent;
    let fixture: ComponentFixture<CustomerRewardsComponent>;
    let mockAuthService: any;
    let mockNotificationsService: any;

    beforeEach(async () => {
        mockAuthService = {
            getReferralCode: vi.fn(() => 'REF123'),
            getReferralBalance: vi.fn(() => 100),
            getReferralsCount: vi.fn(() => 2),
            redeem: vi.fn(() => of({}))
        };

        mockNotificationsService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [CustomerRewardsComponent, CommonModule, HttpClientTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationsService, useValue: mockNotificationsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CustomerRewardsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.referralCode).toBe('REF123');
        expect(component.referralBalance).toBe(100);
    });

    it('should redeem rewards', () => {
        component.onRedeem();
        expect(mockAuthService.redeem).toHaveBeenCalledWith(100);
        expect(mockNotificationsService.show).toHaveBeenCalled();
    });
});
