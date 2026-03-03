import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminManagePlansComponent } from './admin-manage-plans.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminManagePlansComponent', () => {
    let component: AdminManagePlansComponent;
    let fixture: ComponentFixture<AdminManagePlansComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminManagePlansComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminManagePlansComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
