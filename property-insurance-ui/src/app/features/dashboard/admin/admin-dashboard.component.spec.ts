import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let fixture: ComponentFixture<AdminDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AdminDashboardComponent,
                HttpClientTestingModule,
                FormsModule,
                CommonModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set active view', () => {
        component.activeView = 'analytics';
        expect(component.activeView).toBe('analytics');
        expect(component.getViewTitle()).toBe('Performance & Insights');
    });

    it('should toggle add plan form', () => {
        expect(component.showAddPlanForm).toBeFalsy();
        component.toggleAddPlanForm();
        expect(component.showAddPlanForm).toBe(true);
    });
});
