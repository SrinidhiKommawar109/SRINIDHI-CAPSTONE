import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: 'agent-dashboard.component.html'
})
export class AgentDashboardComponent {
  private readonly auth = inject(AuthService);

  user = {
    name: this.auth.getFullName(),
    email: this.auth.getEmail(),
    role: this.auth.getRole(),
    referralCode: this.auth.getReferralCode(),
  };

  isSidebarOpen = true;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
