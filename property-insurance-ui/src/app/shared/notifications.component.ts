import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, NotificationMessage } from '../core/notifications.service';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 right-4 z-[9999] space-y-2 w-72 pointer-events-none">
      <div
        *ngFor="let msg of transientMessages"
        class="rounded-xl border px-3 py-2 text-[11px] shadow-lg backdrop-blur pointer-events-auto animate-in fade-in slide-in-from-right duration-300"
        [ngClass]="{
          'border-emerald-300 bg-emerald-100/90 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-100': msg.type === 'success',
          'border-rose-300 bg-rose-100/90 text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/20 dark:text-rose-100': msg.type === 'error',
          'border-sky-300 bg-sky-100/90 text-sky-800 dark:border-sky-400/40 dark:bg-sky-500/20 dark:text-sky-100': msg.type === 'info'
        }"
      >
        <div class="flex items-center justify-between">
          <div class="font-bold">{{ msg.title }}</div>
          <button (click)="remove(msg.id)" class="text-slate-400 hover:text-slate-600 ml-2">✕</button>
        </div>
        <div *ngIf="msg.message" class="text-[10px] opacity-90 mt-0.5">
          {{ msg.message }}
        </div>
      </div>
    </div>
  `,
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

