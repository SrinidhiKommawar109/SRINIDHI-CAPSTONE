import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('CustomerDashboardComponent', () => {
    let component: CustomerDashboardComponent;
    let fixture: ComponentFixture<CustomerDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CustomerDashboardComponent,
                HttpClientTestingModule,
                FormsModule,
                CommonModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CustomerDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the referral code in the sidebar', () => {
        component.user.referralCode = 'REF-123-TEST';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        const referralCodeText = compiled.querySelector('p.font-mono')?.textContent;
        expect(referralCodeText).toContain('REF-123-TEST');
    });
});
