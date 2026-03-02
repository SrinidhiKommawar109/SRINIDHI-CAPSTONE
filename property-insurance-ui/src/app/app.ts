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

  constructor() {
    this.authService.authState$.subscribe((state) => {
      this.isLoggedIn.set(state);
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
  }
}
