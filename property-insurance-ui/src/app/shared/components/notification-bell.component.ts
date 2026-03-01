import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, NotificationMessage } from '../../core/notifications.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <button
        (click)="toggleDropdown()"
        class="relative p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span
          *ngIf="(unreadCount$ | async) ?? 0 > 0"
          class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950"
        >
          {{ (unreadCount$ | async) }}
        </span>
      </button>

      <!-- Dropdown -->
      <div
        *ngIf="showDropdown"
        class="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
          <button (click)="clearAll()" class="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Clear all</button>
        </div>
        
        <div class="max-h-64 overflow-y-auto custom-scrollbar">
          <div *ngIf="messages.length === 0" class="py-12 text-center text-[11px] text-slate-400">
            No new notifications
          </div>
          
          <div
            *ngFor="let msg of messages"
            class="group relative rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mb-1 last:mb-0"
            [ngClass]="{'opacity-60': msg.isRead}"
          >
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                [ngClass]="{
                  'bg-emerald-500': msg.type === 'success',
                  'bg-rose-500': msg.type === 'error',
                  'bg-sky-500': msg.type === 'info',
                  'bg-slate-300': msg.isRead
                }"
              ></div>
              <div class="flex-1 pr-4">
                <p class="text-[11px] font-bold text-slate-900 dark:text-slate-100">{{ msg.title }}</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ msg.message }}</p>
              </div>
              <button
                *ngIf="!msg.isRead"
                (click)="dismiss(msg.id)"
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-all font-bold text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
      background: #e2e8f0; 
      border-radius: 10px; 
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
  `]
})
export class NotificationBellComponent {
  private readonly notifications = inject(NotificationsService);

  messages: NotificationMessage[] = [];
  unreadCount$ = this.notifications.unreadCount$;
  showDropdown = false;

  constructor() {
    this.notifications.messages$.subscribe(msgs => {
      this.messages = [...msgs]; // Service already orders them
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.notifications.fetchNotifications().subscribe();
    }
  }

  dismiss(id: number) {
    this.notifications.dismiss(id);
  }

  clearAll() {
    this.notifications.clearAll();
    this.showDropdown = false;
  }
}
