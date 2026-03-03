import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerInvoicesComponent } from './customer-invoices.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomerInvoicesComponent', () => {
    let component: CustomerInvoicesComponent;
    let fixture: ComponentFixture<CustomerInvoicesComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CustomerInvoicesComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(CustomerInvoicesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => { expect(component).toBeTruthy(); });
});
