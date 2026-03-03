import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerClaimsComponent } from './customer-claims.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomerClaimsComponent', () => {
    let component: CustomerClaimsComponent;
    let fixture: ComponentFixture<CustomerClaimsComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CustomerClaimsComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(CustomerClaimsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => { expect(component).toBeTruthy(); });
});
