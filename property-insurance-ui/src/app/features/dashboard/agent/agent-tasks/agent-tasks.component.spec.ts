import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentTasksComponent } from './agent-tasks.component';
import { PolicyRequestsService } from '../../../../core/policy-requests.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('AgentTasksComponent', () => {
    let component: AgentTasksComponent;
    let fixture: ComponentFixture<AgentTasksComponent>;
    let mockPolicyService: any;
    let mockNotificationsService: any;

    beforeEach(async () => {
        mockPolicyService = {
            getAgentAssigned: vi.fn(() => of([])),
            sendForm: vi.fn(() => of({})),
            calculateRisk: vi.fn(() => of({}))
        };

        mockNotificationsService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [AgentTasksComponent, CommonModule, HttpClientTestingModule],
            providers: [
                { provide: PolicyRequestsService, useValue: mockPolicyService },
                { provide: NotificationsService, useValue: mockNotificationsService },
                ChangeDetectorRef
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AgentTasksComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(mockPolicyService.getAgentAssigned).toHaveBeenCalled();
    });

    it('should send form', () => {
        component.sendForm(1);
        expect(mockPolicyService.sendForm).toHaveBeenCalledWith(1);
        expect(mockNotificationsService.show).toHaveBeenCalled();
    });

    it('should calculate risk', () => {
        component.calculateRisk(1);
        expect(mockPolicyService.calculateRisk).toHaveBeenCalledWith(1);
        expect(mockNotificationsService.show).toHaveBeenCalled();
    });
});
