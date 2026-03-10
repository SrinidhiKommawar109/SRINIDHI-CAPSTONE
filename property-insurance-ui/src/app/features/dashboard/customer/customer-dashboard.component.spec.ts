import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/auth.service';

describe('CustomerDashboardComponent', () => {
    let component: CustomerDashboardComponent;
    let fixture: ComponentFixture<CustomerDashboardComponent>;

    beforeEach(async () => {
        let authServiceMock = {
            getFullName: () => 'Test User',
            getEmail: () => 'test@test.com',
            getRole: () => 'Customer',
            getReferralCode: () => 'REF-123-TEST'
        };

        await TestBed.configureTestingModule({
            imports: [
                CustomerDashboardComponent,
                HttpClientTestingModule,
                FormsModule,
                CommonModule,
                RouterTestingModule,
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CustomerDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the referral code in the sidebar', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const referralCodeText = compiled.querySelector('p.font-mono')?.textContent;
        expect(referralCodeText).toContain('REF-123-TEST');
    });
});
