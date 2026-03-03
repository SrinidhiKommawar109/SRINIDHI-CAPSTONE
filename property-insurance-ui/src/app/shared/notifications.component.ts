import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, NotificationMessage } from '../core/notifications.service';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private readonly notifications = inject(NotificationsService);
  private readonly destroy$ = new Subject<void>();

  transientMessages: NotificationMessage[] = [];

  ngOnInit(): void {
    // Listen for new messages but only show them as toasts if they are recent
    this.notifications.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msgs => {
        // We only want to show NEW messages that haven't been shown yet as toasts
        const newMsgs = msgs.filter(m =>
          !this.transientMessages.find(tm => tm.id === m.id) &&
          (Date.now() - new Date(m.createdAt).getTime()) < 5000
        );

        if (newMsgs.length > 0) {
          this.transientMessages = [...this.transientMessages, ...newMsgs];

          // Auto-remove after 5 seconds
          newMsgs.forEach(m => {
            timer(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
              this.remove(m.id);
            });
          });
        }
      });
  }

  remove(id: number): void {
    this.transientMessages = this.transientMessages.filter(m => m.id !== id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

