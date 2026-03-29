import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, switchMap, startWith, filter, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface NotificationMessage {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  private readonly messagesSubject = new BehaviorSubject<NotificationMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();
  readonly unreadCount$ = this.messages$.pipe(
    map(msgs => msgs.filter(m => !m.isRead).length)
  );

  constructor() {
    // Start polling when user is logged in
    this.auth.authState$.pipe(
      filter(isLoggedIn => isLoggedIn),
      startWith(this.auth.isLoggedIn()),
      filter(isLoggedIn => isLoggedIn),
      switchMap(() => this.fetchNotifications().pipe(startWith(null)))
    ).subscribe();

    interval(30000) // 30 seconds
      .pipe(
        filter(() => this.auth.isLoggedIn()),
        switchMap(() => this.fetchNotifications())
      )
      .subscribe();
  }

  fetchNotifications() {
    return this.http.get<NotificationMessage[]>(`${this.apiBaseUrl}/Notifications`).pipe(
      tap(msgs => this.messagesSubject.next(msgs)),
      catchError(() => of([]))
    );
  }

  markAsRead(id: number): void {
    this.http.put(`${this.apiBaseUrl}/Notifications/${id}/read`, {}).subscribe(() => {
      const current = this.messagesSubject.value;
      const updated = current.map(m => m.id === id ? { ...m, isRead: true } : m);
      this.messagesSubject.next(updated);
    });
  }

  clearAll(): void {
    this.http.delete(`${this.apiBaseUrl}/Notifications/clear`).subscribe(() => {
      this.messagesSubject.next([]);
    });
  }

  // Keep for local-only immediate UI feedback if needed
  show(message: { title: string; message?: string; type: 'success' | 'error' | 'info' }): void {
    const newMsg: NotificationMessage = {
      id: Date.now(), // Temporary ID for local messages
      title: message.title,
      message: message.message || '',
      type: message.type,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const current = this.messagesSubject.value;
    this.messagesSubject.next([newMsg, ...current]);
  }

  dismiss(id: number): void {
    this.markAsRead(id);
  }
}
