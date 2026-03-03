import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService, NotificationMessage } from '../core/notifications.service';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('NotificationsComponent', () => {
    let component: NotificationsComponent;
    let fixture: ComponentFixture<NotificationsComponent>;
    let notificationsServiceSpy: any;
    let messagesSubject: BehaviorSubject<NotificationMessage[]>;

    beforeEach(async () => {
        messagesSubject = new BehaviorSubject<NotificationMessage[]>([]);
        notificationsServiceSpy = jasmine.createSpyObj('NotificationsService', ['show', 'markAsRead'], {
            messages$: messagesSubject.asObservable()
        });

        await TestBed.configureTestingModule({
            imports: [NotificationsComponent, CommonModule],
            providers: [
                { provide: NotificationsService, useValue: notificationsServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NotificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show new messages and auto-remove them', fakeAsync(() => {
        const newMessage: NotificationMessage = {
            id: 1,
            title: 'Test',
            message: 'Body',
            type: 'info',
            isRead: false,
            createdAt: new Date().toISOString()
        };

        messagesSubject.next([newMessage]);
        fixture.detectChanges();

        expect(component.transientMessages.length).toBe(1);
        expect(component.transientMessages[0].id).toBe(1);

        tick(5001); // Wait for auto-remove
        expect(component.transientMessages.length).toBe(0);
    }));

    it('should remove message manually', () => {
        const msg: NotificationMessage = { id: 1, title: 'T', message: 'M', type: 'info', isRead: false, createdAt: '' };
        component.transientMessages = [msg];

        component.remove(1);
        expect(component.transientMessages.length).toBe(0);
    });
});
