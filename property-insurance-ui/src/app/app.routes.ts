import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ErrorComponent } from './features/error/error.component';
import { AdminDashboardComponent } from './features/dashboard/admin/admin-dashboard.component';
import { AgentDashboardComponent } from './features/dashboard/agent/agent-dashboard.component';
import { CustomerDashboardComponent } from './features/dashboard/customer/customer-dashboard.component';
import { ClaimsDashboardComponent } from './features/dashboard/claims/claims-dashboard.component';
import { AdminManagePlansComponent } from './features/dashboard/admin/admin-manage-plans/admin-manage-plans.component';
import { AdminAssignAgentsComponent } from './features/dashboard/admin/admin-assign-agents/admin-assign-agents.component';
import { AdminApprovalsComponent } from './features/dashboard/admin/admin-approvals/admin-approvals.component';
import { AdminAnalyticsComponent } from './features/dashboard/admin/admin-analytics/admin-analytics.component';
import { AdminUserManagementComponent } from './features/dashboard/admin/admin-user-management/admin-user-management.component';
import { AdminPolicyManagementComponent } from './features/dashboard/admin/admin-policy-management/admin-policy-management.component';
import { CustomerBrowseComponent } from './features/dashboard/customer/customer-browse/customer-browse.component';
import { CustomerRequestsComponent } from './features/dashboard/customer/customer-requests/customer-requests.component';
import { CustomerClaimsComponent } from './features/dashboard/customer/customer-claims/customer-claims.component';
import { CustomerInvoicesComponent } from './features/dashboard/customer/customer-invoices/customer-invoices.component';
import { CustomerRewardsComponent } from './features/dashboard/customer/customer-rewards/customer-rewards.component';
import { AgentTasksComponent } from './features/dashboard/agent/agent-tasks/agent-tasks.component';
import { AgentEarningsComponent } from './features/dashboard/agent/agent-earnings/agent-earnings.component';
import { ClaimsPendingComponent } from './features/dashboard/claims/claims-pending/claims-pending.component';
import { ClaimsHistoryComponent } from './features/dashboard/claims/claims-history/claims-history.component';
import { CustomerTransferRequestsComponent } from './features/dashboard/customer/customer-transfer-requests/customer-transfer-requests.component';
import { AdminTransferApprovalsComponent } from './features/dashboard/admin/admin-transfer-approvals/admin-transfer-approvals.component';
import { AgentPoliciesComponent } from './features/dashboard/agent/agent-policies/agent-policies.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'assign-agents', pathMatch: 'full' },
      { path: 'manage-plans', component: AdminManagePlansComponent },
      { path: 'assign-agents', component: AdminAssignAgentsComponent },
      { path: 'approvals', component: AdminApprovalsComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'user-management', component: AdminUserManagementComponent },
      { path: 'policy-management', component: AdminPolicyManagementComponent },
      { path: 'transfer-approvals', component: AdminTransferApprovalsComponent },
    ],
  },
  {
    path: 'agent',
    canActivate: [authGuard],
    data: { roles: ['Agent'] },
    component: AgentDashboardComponent,
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'tasks', component: AgentTasksComponent },
      { path: 'policies', component: AgentPoliciesComponent },
      { path: 'earnings', component: AgentEarningsComponent },
    ],
  },
  {
    path: 'customer',
    canActivate: [authGuard],
    data: { roles: ['Customer'] },
    component: CustomerDashboardComponent,
    children: [
      { path: '', redirectTo: 'browse', pathMatch: 'full' },
      { path: 'browse', component: CustomerBrowseComponent },
      { path: 'requests', component: CustomerRequestsComponent },
      { path: 'rewards', component: CustomerRewardsComponent },
      { path: 'claims', component: CustomerClaimsComponent },
      { path: 'invoices', component: CustomerInvoicesComponent },
      { path: 'transfer-requests', component: CustomerTransferRequestsComponent },
    ],
  },
  {
    path: 'claims-officer',
    canActivate: [authGuard],
    data: { roles: ['ClaimsOfficer'] },
    component: ClaimsDashboardComponent,
    children: [
      { path: '', redirectTo: 'pending', pathMatch: 'full' },
      { path: 'pending', component: ClaimsPendingComponent },
      { path: 'history', component: ClaimsHistoryComponent },
    ],
  },
  { path: 'error', component: ErrorComponent },
  { path: '**', component: ErrorComponent }
];
