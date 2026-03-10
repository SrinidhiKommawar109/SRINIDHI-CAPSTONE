import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationsService, NotificationMessage } from './notifications.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let httpMock: HttpTestingController;
    let authServiceSpy: any;

    beforeEach(() => {
        authServiceSpy = {
            isLoggedIn: vi.fn(),
            authState$: of(false)
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                NotificationsService,
                { provide: AuthService, useValue: authServiceSpy }
            ]
        });

        service = TestBed.inject(NotificationsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch notifications correctly', () => {
        const dummyNotifications: NotificationMessage[] = [
            { id: 1, title: 'Test 1', message: 'Msg 1', type: 'info', isRead: false, createdAt: '' },
            { id: 2, title: 'Test 2', message: 'Msg 2', type: 'success', isRead: true, createdAt: '' }
        ];

        service.fetchNotifications().subscribe(msgs => {
            expect(msgs.length).toBe(2);
            expect(msgs).toEqual(dummyNotifications);
        });

        const req = httpMock.expectOne(`${environment.apiBaseUrl}/Notifications`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyNotifications);
    });

    it('should locally show a new notification', async () => {
        const testMsg = { title: 'Local Title', message: 'Local Msg', type: 'info' as const };

        const promise = new Promise<void>(resolve => {
            service.messages$.subscribe(msgs => {
                if (msgs.length > 0) {
                    expect(msgs[0].title).toBe('Local Title');
                    expect(msgs[0].message).toBe('Local Msg');
                    resolve();
                }
            });
        });

        service.show(testMsg);
        await promise;
    });

    it('should calculate unread count correctly', async () => {
        const dummyNotifications: NotificationMessage[] = [
            { id: 1, title: 'T1', message: 'M1', type: 'info', isRead: false, createdAt: '' },
            { id: 2, title: 'T2', message: 'M2', type: 'info', isRead: true, createdAt: '' }
        ];

        // Manually trigger subject for local test
        (service as any).messagesSubject.next(dummyNotifications);

        const promise = new Promise<void>(resolve => {
            service.unreadCount$.subscribe(count => {
                expect(count).toBe(1);
                resolve();
            });
        });

        await promise;
    });
});
