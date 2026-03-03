import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-claims-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: 'claims-dashboard.component.html'
})
export class ClaimsDashboardComponent {
  private readonly auth = inject(AuthService);

  user = {
    name: this.auth.getFullName(),
    email: this.auth.getEmail(),
    role: this.auth.getRole(),
  };
}
