import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentDashboardComponent } from './agent-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('AgentDashboardComponent', () => {
    let component: AgentDashboardComponent;
    let fixture: ComponentFixture<AgentDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentDashboardComponent, HttpClientTestingModule, CommonModule, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(AgentDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
