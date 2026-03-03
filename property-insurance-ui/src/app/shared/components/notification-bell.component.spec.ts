import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationBellComponent } from './notification-bell.component';
import { NotificationsService } from '../../core/notifications.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

describe('NotificationBellComponent', () => {
    let component: NotificationBellComponent;
    let fixture: ComponentFixture<NotificationBellComponent>;
    let mockNotificationsService: any;

    beforeEach(async () => {
        mockNotificationsService = {
            unreadCount$: of(0),
            messages$: of([]),
            fetchNotifications: vi.fn(() => of([])),
            dismiss: vi.fn(),
            clearAll: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [NotificationBellComponent, CommonModule, HttpClientTestingModule],
            providers: [
                { provide: NotificationsService, useValue: mockNotificationsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NotificationBellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle dropdown and fetch notifications', () => {
        expect(component.showDropdown).toBeFalsy();
        component.toggleDropdown();
        expect(component.showDropdown).toBeTruthy();
        expect(mockNotificationsService.fetchNotifications).toHaveBeenCalled();
    });

    it('should clear all notifications', () => {
        component.showDropdown = true;
        component.clearAll();
        expect(mockNotificationsService.clearAll).toHaveBeenCalled();
        expect(component.showDropdown).toBeFalsy();
    });
});
