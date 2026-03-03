import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAssignAgentsComponent } from './admin-assign-agents.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminAssignAgentsComponent', () => {
    let component: AdminAssignAgentsComponent;
    let fixture: ComponentFixture<AdminAssignAgentsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminAssignAgentsComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminAssignAgentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
