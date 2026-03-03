import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminUserManagementComponent } from './admin-user-management.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminUserManagementComponent', () => {
    let component: AdminUserManagementComponent;
    let fixture: ComponentFixture<AdminUserManagementComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminUserManagementComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminUserManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
