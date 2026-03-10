import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: 'customer-dashboard.component.html',
})
export class CustomerDashboardComponent {
  private readonly auth = inject(AuthService);

  user = {
    name: this.auth.getFullName(),
    email: this.auth.getEmail(),
    role: this.auth.getRole(),
    referralCode: this.auth.getReferralCode(),
  };
}
