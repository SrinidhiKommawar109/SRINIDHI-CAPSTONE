import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminApprovalsComponent } from './admin-approvals.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminApprovalsComponent', () => {
    let component: AdminApprovalsComponent;
    let fixture: ComponentFixture<AdminApprovalsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminApprovalsComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminApprovalsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
