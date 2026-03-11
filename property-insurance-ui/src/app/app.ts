import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/theme.service';
import { NotificationsComponent } from './shared/notifications.component';
import { NotificationBellComponent } from './shared/components/notification-bell.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NotificationsComponent, CommonModule, NotificationBellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('property-insurance-ui');
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  themeMode = this.themeService.mode;
  isLoggedIn = signal(this.authService.isLoggedIn());
  mobileMenuOpen = signal(false);

  get dashboardUrl(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'Admin': return '/admin/assign-agents';
      case 'Agent': return '/agent/tasks';
      case 'Customer': return '/customer/browse';
      case 'ClaimsOfficer': return '/claims-officer/pending';
      default: return '/';
    }
  }

  get policiesUrl(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'Admin': return '/admin/policy-management';
      case 'Agent': return '/agent/tasks';
      case 'Customer': return '/customer/browse';
      case 'ClaimsOfficer': return '/claims-officer/pending';
      default: return '/';
    }
  }

  get claimsUrl(): string {
    const role = this.authService.getRole();
    switch (role) {
      case 'Admin': return '/admin/approvals';
      case 'Agent': return '/agent/tasks';
      case 'Customer': return '/customer/claims';
      case 'ClaimsOfficer': return '/claims-officer/pending';
      default: return '/';
    }
  }

  constructor() {
    this.authService.authState$.subscribe((state) => {
      this.isLoggedIn.set(state);
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    const confirmLogout = window.confirm('Do you really want to exit from this page?');
    if (confirmLogout) {
      this.authService.logout();
    }
  }
}
