import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerRequestsComponent } from './customer-requests.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomerRequestsComponent', () => {
    let component: CustomerRequestsComponent;
    let fixture: ComponentFixture<CustomerRequestsComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CustomerRequestsComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(CustomerRequestsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => { expect(component).toBeTruthy(); });
});
