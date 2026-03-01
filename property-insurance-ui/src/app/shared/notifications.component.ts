import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../core/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 w-72">
      <div
        *ngFor="let msg of messages$ | async"
        class="rounded-xl border px-3 py-2 text-[11px] shadow-lg backdrop-blur"
        [ngClass]="{
          'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100': msg.type === 'success',
          'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100': msg.type === 'error',
          'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-100': msg.type === 'info'
        }"
      >
        <div class="font-semibold">{{ msg.title }}</div>
        <div *ngIf="msg.message" class="text-[10px] opacity-90">
          {{ msg.message }}
        </div>
      </div>
    </div>
  `,
})
export class NotificationsComponent {
  private readonly notifications = inject(NotificationsService);
  readonly messages$ = this.notifications.messages$;
}

