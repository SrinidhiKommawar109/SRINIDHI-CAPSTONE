import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PolicyRequestsService,
  PolicyRequest,
} from '../../core/policy-requests.service';
import { AdminService, AgentSummary } from '../../core/admin.service';
import { NotificationsService } from '../../core/notifications.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationBellComponent],
  template: `
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hidden md:block">
        <div class="px-6 py-8">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Navigation</p>
          <nav class="space-y-1">
            <button
              (click)="activeView = 'managePlans'"
              [class.bg-slate-100]="activeView === 'managePlans'"
              [class.text-slate-900]="activeView === 'managePlans'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Add & Browse policies
            </button>
            <button
              (click)="activeView = 'assignAgents'"
              [class.bg-slate-100]="activeView === 'assignAgents'"
              [class.text-slate-900]="activeView === 'assignAgents'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Assign Agents
            </button>
            <button
              (click)="activeView = 'approvals'"
              [class.bg-slate-100]="activeView === 'approvals'"
              [class.text-slate-900]="activeView === 'approvals'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Policy Approval
            </button>
            <button
              (click)="activeView = 'analytics'"
              [class.bg-slate-100]="activeView === 'analytics'"
              [class.text-slate-900]="activeView === 'analytics'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              Analytics
            </button>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <section class="max-w-6xl mx-auto px-6 py-8 md:py-12">
          <!-- Header Section -->
          <div class="mb-10">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {{ getViewTitle() }}
            </h1>
            <p class="text-sm text-slate-500 mt-2 dark:text-slate-400">
              {{ getViewSubtitle() }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <app-notification-bell></app-notification-bell>
          </div>

          <!-- Manage Plans View -->
          <div *ngIf="activeView === 'managePlans'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <!-- Add Plan Toggle -->
            <div>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
                (click)="toggleAddPlanForm()"
              >
                <span class="text-base">{{ showAddPlanForm ? '−' : '+' }}</span>
                {{ showAddPlanForm ? 'Cancel Adding Plan' : 'Add New Insurance Plan' }}
              </button>
            </div>

            <!-- Add Plan Form -->
            <div *ngIf="showAddPlanForm" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 class="text-sm font-semibold text-slate-900 mb-4 dark:text-slate-50">Create New Plan</h2>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Plan Name</label>
                  <input
                    type="text"
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.planName"
                    placeholder="e.g. Premium Health Plan"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.categoryId"
                    (change)="onCategoryChange()"
                  >
                    <option [ngValue]="0">Select Category</option>
                    <option *ngFor="let cat of categories" [ngValue]="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Sub-Category</label>
                  <select
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.subCategoryId"
                    [disabled]="!newPlan.categoryId"
                  >
                    <option [ngValue]="0">Select Sub-Category</option>
                    <option *ngFor="let sub of filteredSubCategories" [ngValue]="sub.id">
                      {{ sub.name }}
                    </option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Base Premium ($)</label>
                  <input
                    type="number"
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.basePremium"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Base Coverage ($)</label>
                  <input
                    type="number"
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.baseCoverageAmount"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Coverage Rate (Decimal)</label>
                  <input
                    type="number"
                    step="0.01"
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.coverageRate"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Agent Commission ($)</label>
                  <input
                    type="number"
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.agentCommission"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Frequency</label>
                  <select
                    class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="newPlan.frequency"
                  >
                    <option [ngValue]="1">Quarterly</option>
                    <option [ngValue]="2">Half-Yearly</option>
                    <option [ngValue]="3">Yearly</option>
                  </select>
                </div>
              </div>
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  (click)="toggleAddPlanForm()"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
                  (click)="submitPlan()"
                >
                  Save Plan
                </button>
              </div>
            </div>

            <!-- Browse Plans (Simple list) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Existing Insurance Plans</h2>
              </div>
              <div class="p-0">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-slate-50 dark:bg-slate-800/50">
                        <th class="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">Plan Name</th>
                        <th class="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">Premium</th>
                        <th class="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">Coverage</th>
                        <th class="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">Frequency</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      <ng-container *ngFor="let cat of categories">
                        <ng-container *ngFor="let sub of cat.subCategories">
                          <tr *ngFor="let plan of sub.plans" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{{ plan.planName }}</td>
                            <td class="px-6 py-4">\${{ plan.basePremium | number: '1.2-2' }}</td>
                            <td class="px-6 py-4">\${{ plan.baseCoverageAmount | number: '1.0-0' }}</td>
                            <td class="px-6 py-4">{{ getFrequencyLabel(plan.frequency) }}</td>
                          </tr>
                        </ng-container>
                      </ng-container>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Assign Agents View -->
          <div *ngIf="activeView === 'assignAgents'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Pending Agent Assignments</h2>
              <button
                type="button"
                class="rounded-full border border-slate-300 px-3 py-1 text-[11px] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
                (click)="loadPending()"
              >
                Refresh
              </button>
            </div>

            <div *ngIf="pendingLoading" class="text-xs text-slate-500 mb-3">Loading pending requests…</div>
            <div *ngIf="pendingError" class="text-xs text-rose-600 mb-3">{{ pendingError }}</div>
            <div *ngIf="!pendingLoading && getPendingAssignmentRequests().length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <p class="text-xs text-slate-500">No requests waiting for agent assignment.</p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div
                *ngFor="let req of getPendingAssignmentRequests()"
                class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 space-y-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 dark:text-slate-50">Request #{{ req.id }}</span>
                  <span class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {{ req.status }}
                  </span>
                </div>
                <div class="space-y-1">
                  <p><span class="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Plan:</span> {{ req.plan?.planName || ('Plan ' + req.planId) }}</p>
                  <p><span class="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Customer:</span> #{{ req.customerId }}</p>
                </div>

                <div class="pt-2">
                  <label class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Notes for Agent</label>
                  <textarea
                    [(ngModel)]="adminNotes[req.id]"
                    class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[10px] text-slate-700 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    rows="2"
                    placeholder="Provide specific instructions..."
                  ></textarea>
                </div>

                <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <select
                    class="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    [(ngModel)]="agentSelections[req.id]"
                  >
                    <option [ngValue]="0">Select agent</option>
                    <option *ngFor="let agent of agents" [ngValue]="agent.id">
                      {{ agent.fullName }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all"
                    (click)="assignAgent(req.id)"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Policy Approval View -->
          <div *ngIf="activeView === 'approvals'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Requests Waiting for Final Approval</h2>
              <button
                type="button"
                class="rounded-full border border-slate-300 px-3 py-1 text-[11px] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
                (click)="loadPending()"
              >
                Refresh
              </button>
            </div>

            <div *ngIf="pendingLoading" class="text-xs text-slate-500 mb-3">Loading requests…</div>
            <div *ngIf="!pendingLoading && getRequestsForApproval().length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <p class="text-xs text-slate-500">No requests waiting for final approval.</p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div
                *ngFor="let req of getRequestsForApproval()"
                class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 space-y-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 dark:text-slate-50">Request #{{ req.id }}</span>
                  <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {{ req.status }}
                  </span>
                </div>
                <div class="space-y-1">
                  <p><span class="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Plan:</span> {{ req.plan?.planName || ('Plan ' + req.planId) }}</p>
                  <p><span class="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Customer:</span> #{{ req.customerId }}</p>
                  <p><span class="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Agent:</span> #{{ req.agentId }}</p>
                </div>

                <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    class="w-full rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
                    (click)="approveAfterCustomer(req.id)"
                  >
                    Final Approve & Issue Policy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics View -->
          <div *ngIf="activeView === 'analytics'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Customers</p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ stats?.totalCustomers || 0 }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Agents</p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ stats?.totalAgents || 0 }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Policies Sold</p>
                <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats?.totalPolicies || 0 }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Claims</p>
                <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">{{ stats?.totalClaims || 0 }}</p>
              </div>
            </div>

            <div class="grid gap-8 md:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 class="text-sm font-semibold text-slate-900 mb-6 dark:text-slate-100">Most Popular Plans</h3>
                <div class="space-y-4">
                  <div *ngFor="let plan of stats?.topPlans" class="space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate-700 dark:text-slate-300">{{ plan.planName }}</span>
                      <span class="font-bold text-slate-900 dark:text-slate-50">{{ plan.count }} sold</span>
                    </div>
                    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                      <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="(plan.count / stats.totalPolicies) * 100"></div>
                    </div>
                  </div>
                  <div *ngIf="!stats?.topPlans?.length" class="text-center py-8 text-xs text-slate-500 italic">
                    No sales data available yet.
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center text-center">
                <div class="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 dark:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">System Health</h3>
                <p class="text-xs text-slate-500 max-w-[200px]">All insurance modules (API, Claims, Payments) are operating normally.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly policyRequests = inject(PolicyRequestsService);
  private readonly adminService = inject(AdminService);
  private readonly notifications = inject(NotificationsService);

  pendingRequests: PolicyRequest[] = [];
  pendingLoading = false;
  pendingError = '';
  agents: AgentSummary[] = [];
  agentSelections: Record<number, number> = {};
  adminNotes: Record<number, string> = {};

  activeView: 'managePlans' | 'assignAgents' | 'approvals' | 'analytics' = 'assignAgents';

  showAddPlanForm = false;
  categories: any[] = [];
  filteredSubCategories: any[] = [];
  stats: any = null;

  newPlan = {
    planName: '',
    baseCoverageAmount: 0,
    coverageRate: 0,
    basePremium: 0,
    agentCommission: 0,
    frequency: 3,
    subCategoryId: 0,
    categoryId: 0,
  };

  ngOnInit(): void {
    this.loadPending();
    this.loadAgents();
    this.loadCategories();
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
      },
    });
  }

  getViewTitle(): string {
    switch (this.activeView) {
      case 'managePlans': return 'Plan Management';
      case 'assignAgents': return 'Agent Assignments';
      case 'approvals': return 'Policy Approvals';
      default: return 'Admin Dashboard';
    }
  }

  getViewSubtitle(): string {
    switch (this.activeView) {
      case 'managePlans': return 'Create and manage insurance plans across different categories.';
      case 'assignAgents': return 'Delegate policy requests to specialized insurance agents.';
      case 'approvals': return 'Review and finalize policies once customers provide confirmation.';
      default: return 'Administrative control center.';
    }
  }

  getPendingAssignmentRequests(): PolicyRequest[] {
    return this.pendingRequests.filter(r =>
      r.status === 'PendingAdmin' || (r.status as any) === 0
    );
  }

  getRequestsForApproval(): PolicyRequest[] {
    return this.pendingRequests.filter(r =>
      r.status === 'CustomerConfirmed' || (r.status as any) === 5
    );
  }

  getFrequencyLabel(freq: string | number): string {
    if (typeof freq === 'number') {
      switch (freq) {
        case 1: return 'Quarterly';
        case 2: return 'Half-Yearly';
        case 3: return 'Yearly';
        default: return 'Unknown';
      }
    }
    return freq || 'Unknown';
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
    });
  }

  onCategoryChange(): void {
    const cat = this.categories.find((c) => c.id === this.newPlan.categoryId);
    this.filteredSubCategories = cat ? cat.subCategories : [];
    this.newPlan.subCategoryId = 0;
  }

  toggleAddPlanForm(): void {
    this.showAddPlanForm = !this.showAddPlanForm;
    if (!this.showAddPlanForm) {
      this.resetPlanForm();
    }
  }

  resetPlanForm(): void {
    this.newPlan = {
      planName: '',
      baseCoverageAmount: 0,
      coverageRate: 0,
      basePremium: 0,
      agentCommission: 0,
      frequency: 3,
      subCategoryId: 0,
      categoryId: 0,
    };
    this.filteredSubCategories = [];
  }

  submitPlan(): void {
    if (!this.newPlan.planName || !this.newPlan.subCategoryId) {
      this.notifications.show({
        title: 'Validation Error',
        message: 'Please provide a plan name and select a sub-category.',
        type: 'error',
      });
      return;
    }

    this.adminService.addPlan(this.newPlan).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Plan Added',
          message: `Successfully added plan: ${this.newPlan.planName}`,
          type: 'success',
        });
        this.showAddPlanForm = false;
        this.resetPlanForm();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
      },
    });
  }

  loadAgents(): void {
    this.adminService.getAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
      },
    });
  }

  loadPending(): void {
    this.pendingLoading = true;
    this.pendingError = '';
    this.policyRequests.getAdminPending().subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.pendingLoading = false;
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
        this.pendingLoading = false;
      },
    });
  }

  assignAgent(requestId: number): void {
    const agentId = this.agentSelections[requestId] || 0;
    const notes = this.adminNotes[requestId] || '';
    if (!agentId) {
      this.pendingError = 'Please select an agent before assigning.';
      return;
    }

    this.policyRequests.assignAgent(requestId, agentId, notes).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Agent assigned',
          message: `Request #${requestId} assigned successfully.`,
          type: 'success',
        });
        this.loadPending();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
      },
    });
  }

  approveAfterCustomer(requestId: number): void {
    this.policyRequests.adminApprove(requestId).subscribe({
      next: () => {
        this.notifications.show({
          title: 'Policy approved',
          message: `Request #${requestId} approved successfully.`,
          type: 'success',
        });
        this.loadPending();
      },
      error: (err) => {
        this.pendingError = this.extractError(err);
      },
    });
  }

  private extractError(err: any): string {
    if (err?.error && typeof err.error === 'string') {
      return err.error;
    }
    if (err?.error?.title) {
      return err.error.title;
    }
    return 'Something went wrong while processing the request.';
  }
}

