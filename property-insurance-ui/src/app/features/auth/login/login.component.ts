import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from '../../../core/auth.service';

type UiRole = UserRole;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  roles: { key: UiRole; label: string; short: string }[] = [
    {
      key: 'Admin',
      label: 'Admin',
      short: 'User and policy administration',
    },
    {
      key: 'Agent',
      label: 'Agent',
      short: 'Customer onboarding and risk calculation',
    },
    {
      key: 'Customer',
      label: 'Customer',
      short: 'Buy policies and view invoices',
    },
    {
      key: 'ClaimsOfficer',
      label: 'Claims Officer',
      short: 'Verify and approve/reject claims',
    },
  ];

  selectedRole: UiRole | '' = '';
  loading = false;
  formSubmitted = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const role = params.get('role') as UiRole | null;
      if (role && this.roles.some((r) => r.key === role)) {
        this.selectedRole = role;
      }
    });
  }

  selectRole(role: UiRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (!this.selectedRole || this.form.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.form.value;

    this.auth
      .login({
        email,
        password,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const backendRole = (res.role ?? '').toString();

          if (backendRole && backendRole !== this.selectedRole) {
            this.errorMessage =
              'Selected role does not match the role assigned to this account.';
            return;
          }

          this.redirectByRole(backendRole as UiRole);
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/not-found']);
        },
      });
  }

  private redirectByRole(role: UiRole): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin']);
        break;
      case 'Agent':
        this.router.navigate(['/agent']);
        break;
      case 'Customer':
        this.router.navigate(['/customer']);
        break;
      case 'ClaimsOfficer':
        this.router.navigate(['/claims-officer']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}

