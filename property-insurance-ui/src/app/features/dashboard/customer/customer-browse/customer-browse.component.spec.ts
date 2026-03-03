import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerBrowseComponent } from './customer-browse.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomerBrowseComponent', () => {
    let component: CustomerBrowseComponent;
    let fixture: ComponentFixture<CustomerBrowseComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CustomerBrowseComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(CustomerBrowseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => { expect(component).toBeTruthy(); });
});
