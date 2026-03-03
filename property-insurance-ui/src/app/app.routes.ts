import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AdminDashboardComponent } from './features/dashboard/admin/admin-dashboard.component';
import { AgentDashboardComponent } from './features/dashboard/agent/agent-dashboard.component';
import { CustomerDashboardComponent } from './features/dashboard/customer/customer-dashboard.component';
import { ClaimsDashboardComponent } from './features/dashboard/claims/claims-dashboard.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    component: AdminDashboardComponent,
  },
  {
    path: 'agent',
    canActivate: [authGuard],
    data: { roles: ['Agent'] },
    component: AgentDashboardComponent,
  },
  {
    path: 'customer',
    canActivate: [authGuard],
    data: { roles: ['Customer'] },
    component: CustomerDashboardComponent,
  },
  {
    path: 'claims-officer',
    canActivate: [authGuard],
    data: { roles: ['ClaimsOfficer'] },
    component: ClaimsDashboardComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
