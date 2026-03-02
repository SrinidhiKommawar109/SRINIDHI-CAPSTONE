import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PolicyRequestsService,
  PolicyRequest,
  PropertyPlan,
  SubmitPropertyPayload,
} from '../../core/policy-requests.service';
import { ClaimsService, CreateClaimPayload } from '../../core/claims.service';
import { InvoicesService, Invoice } from '../../core/invoices.service';
import { NotificationsService } from '../../core/notifications.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hidden md:block">
        <div class="px-6 py-8">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Navigation</p>
          <nav class="space-y-1">
            <button
              (click)="activeView = 'browse'"
              [class.bg-slate-100]="activeView === 'browse'"
              [class.text-slate-900]="activeView === 'browse'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Browse Policies
            </button>
            <button
              (click)="activeView = 'requests'"
              [class.bg-slate-100]="activeView === 'requests'"
              [class.text-slate-900]="activeView === 'requests'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              My Requests
            </button>
            <button
              (click)="activeView = 'claims'"
              [class.bg-slate-100]="activeView === 'claims'"
              [class.text-slate-900]="activeView === 'claims'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              File a Claim
            </button>
            <button
              (click)="activeView = 'invoices'"
              [class.bg-slate-100]="activeView === 'invoices'"
              [class.text-slate-900]="activeView === 'invoices'"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Invoices
            </button>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <section class="max-w-5xl mx-auto px-6 py-8 md:py-12">
          <!-- Header Section -->
          <div class="mb-10">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {{ getViewTitle() }}
            </h1>
            <p class="text-sm text-slate-500 mt-2 dark:text-slate-400">
              {{ getViewSubtitle() }}
            </p>
          </div>

          <!-- Browse Policies View -->
          <div *ngIf="activeView === 'browse'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Available Insurance Plans</h2>
              </div>
              <div class="p-6">
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    *ngFor="let plan of plans"
                    class="group relative bg-slate-50 rounded-xl p-5 border border-transparent transition-all hover:border-emerald-200 hover:bg-emerald-50/30 dark:bg-slate-800/50 dark:hover:bg-emerald-950/20"
                  >
                    <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/></svg>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{{ plan.planName }}</h3>
                    <div class="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <p>Premium: <span class="font-semibold text-slate-900 dark:text-slate-200">\${{ plan.basePremium | number: '1.2-2' }}</span></p>
                      <p>Installment: <span class="font-semibold text-slate-900 dark:text-slate-200">\${{ getInstallmentAmount(plan) | number: '1.2-2' }}</span></p>
                      <p>Frequency: <span class="font-semibold text-slate-900 dark:text-slate-200">{{ getFrequencyLabel(plan.frequency) }}</span></p>
                    </div>
                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      (click)="createRequestForPlan(plan.id)"
                    >
                      Request this plan
                    </button>
                  </div>
                </div>
                <div *ngIf="createMessage" class="mt-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
                  {{ createMessage }}
                </div>
              </div>
            </div>
          </div>

          <!-- My Requests View -->
          <div *ngIf="activeView === 'requests'" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <!-- Requests List -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">My Policy Requests</h2>
                <button
                  type="button"
                  class="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 dark:text-slate-400 dark:hover:text-slate-100"
                  (click)="loadMyRequests()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  Refresh
                </button>
              </div>
              <div class="p-0">
                <div *ngIf="requestsLoading" class="p-6 text-center text-sm text-slate-500">Loading requests...</div>
                <div *ngIf="!requestsLoading && myRequests.length === 0" class="p-12 text-center">
                  <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3 dark:bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <p class="text-sm text-slate-500">No requests found.</p>
                </div>
                <div class="overflow-x-auto" *ngIf="myRequests.length > 0">
                  <table class="w-full text-left text-sm">
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr *ngFor="let req of myRequests" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">#{{ req.id }}</td>
                        <td class="px-6 py-4">
                          <div class="text-slate-700 dark:text-slate-300">{{ req.plan?.planName || ('Plan ' + req.planId) }}</div>
                          <div *ngIf="req.totalPremium" class="text-[10px] text-emerald-600 font-semibold">
                            \${{ req.totalPremium | number: '1.2-2' }} (Calculated)
                          </div>
                        </td>
                        <td class="px-6 py-4 text-xs">
                          <div *ngIf="req.installmentAmount" class="text-slate-600 dark:text-slate-400">
                            {{ req.installmentCount }} × \${{ req.installmentAmount | number: '1.2-2' }}
                          </div>
                          <div *ngIf="!req.installmentAmount" class="text-slate-400 italic">Pending...</div>
                        </td>
                        <td class="px-6 py-4">
                          <span
                            class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                            [ngClass]="{
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': req.status === 'PendingAdmin',
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': req.status === 'AgentAssigned',
                              'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400': req.status === 'RiskCalculated',
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': req.status === 'PolicyApproved'
                            }"
                          >
                            {{ req.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="grid gap-8 md:grid-cols-2">
              <!-- Submit Details -->
              <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <h3 class="text-sm font-semibold text-slate-900 mb-4 dark:text-slate-100">Submit Property Details</h3>
                <div class="space-y-4">
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Policy Request ID</label>
                    <input type="number" min="1" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="e.g. 101" [(ngModel)]="submitRequestId" />
                  </div>
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Property Address</label>
                    <input type="text" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="Full address" [(ngModel)]="submitPayload.propertyAddress" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Property Value</label>
                      <input type="number" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="\$\$" [(ngModel)]="submitPayload.propertyValue" />
                    </div>
                    <div>
                      <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Age (Years)</label>
                      <input type="number" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="Years" [(ngModel)]="submitPayload.propertyAge" />
                    </div>
                  </div>
                  <button (click)="submitProperty()" class="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition-all focus:ring-2 focus:ring-sky-500/20">
                    Submit Property Info
                  </button>
                  <div *ngIf="submitMessage" class="text-xs text-emerald-600 dark:text-emerald-400">{{ submitMessage }}</div>
                </div>
              </div>

              <!-- Confirm Purchase -->
              <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 relative">
                <h3 class="text-sm font-semibold text-slate-900 mb-4 dark:text-slate-100">Finalize Purchase</h3>
                <p class="text-xs text-slate-500 mb-6 dark:text-slate-400">Once your request is approved, confirm to activate your policy.</p>
                
                <div *ngIf="!showPaymentForm" class="space-y-4">
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Approved Request ID</label>
                    <input type="number" min="1" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="e.g. 101" [(ngModel)]="buyRequestId" />
                  </div>
                  <button (click)="initiateCheckout()" class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-all focus:ring-2 focus:ring-emerald-500/20">
                    Proceed to Payment
                  </button>
                  <div *ngIf="buyMessage" class="text-xs text-emerald-600 dark:text-emerald-400">{{ buyMessage }}</div>
                </div>

                <!-- Dummy Payment Overlay -->
                <div *ngIf="showPaymentForm" class="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm p-6 rounded-2xl dark:bg-slate-900/95 animate-in fade-in duration-300">
                  <h4 class="text-xs font-bold uppercase text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    Secure Checkout
                  </h4>
                  <div class="space-y-3">
                    <input type="text" class="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800 dark:border-slate-700" placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)" />
                    <div class="grid grid-cols-2 gap-3">
                      <input type="text" class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800 dark:border-slate-700" placeholder="MM/YY" />
                      <input type="text" class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800 dark:border-slate-700" placeholder="CVV" />
                    </div>
                    <div class="pt-2 flex gap-2">
                      <button (click)="showPaymentForm = false" class="flex-1 rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">Cancel</button>
                      <button (click)="confirmPurchase()" class="flex-1 rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950">Pay Now</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- File a Claim View -->
          <div *ngIf="activeView === 'claims'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <h2 class="text-base font-semibold text-slate-900 mb-6 dark:text-slate-100 text-center">Submit a New Claim</h2>
              <div class="space-y-5">
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Active Policy ID</label>
                  <input type="number" min="1" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="e.g. 505" [(ngModel)]="claimPayload.policyRequestId" />
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Property Address</label>
                  <input type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="Where did incident occur?" [(ngModel)]="claimPayload.propertyAddress" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Impacted Value</label>
                    <input type="number" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="\$\$" [(ngModel)]="claimPayload.propertyValue" />
                  </div>
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Property Age</label>
                    <input type="number" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50" placeholder="Years" [(ngModel)]="claimPayload.propertyAge" />
                  </div>
                </div>
                <div class="pt-4">
                  <button (click)="fileClaim()" class="w-full rounded-xl bg-rose-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500 hover:-translate-y-0.5 transition-all active:translate-y-0">
                    File Claim Report
                  </button>
                </div>
                <div *ngIf="claimMessage" class="text-center text-xs font-medium text-emerald-600 mt-4 dark:text-emerald-400">{{ claimMessage }}</div>
              </div>
            </div>
          </div>

          <!-- Invoices View -->
          <div *ngIf="activeView === 'invoices'" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Payment History & Invoices</h2>
                <button
                  type="button"
                  class="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 dark:text-slate-400 dark:hover:text-slate-100"
                  (click)="loadInvoices()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  Refresh
                </button>
              </div>
              <div class="p-0">
                <div *ngIf="invoicesLoading" class="p-12 text-center text-sm text-slate-500">Loading invoices...</div>
                <div *ngIf="!invoicesLoading && invoices.length === 0" class="p-16 text-center">
                  <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4 dark:bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="16" y1="16" x2="8" y2="16"/></svg>
                  </div>
                  <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">No invoices yet</h3>
                  <p class="text-xs text-slate-500 max-w-50 mx-auto">Approved claims and active policies will appear here.</p>
                </div>
                <div class="grid gap-0 divide-y divide-slate-100 dark:divide-slate-800" *ngIf="invoices.length > 0">
                  <div *ngFor="let inv of invoices" class="px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/20">
                    <div class="flex items-center gap-4">
                      <div class="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/40 dark:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ inv.invoiceNumber }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">{{ inv.planName }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-bold text-slate-900 dark:text-slate-100">\${{ inv.totalPremium | number: '1.2-2' }}</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">\${{ inv.installmentAmount | number: '1.2-2' }} × {{ inv.installmentCount }} installments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class CustomerDashboardComponent implements OnInit {
  private readonly policies = inject(PolicyRequestsService);
  private readonly claims = inject(ClaimsService);
  private readonly invoicesService = inject(InvoicesService);
  private readonly notifications = inject(NotificationsService);

  plans: PropertyPlan[] = [];
  createMessage = '';

  myRequests: PolicyRequest[] = [];
  requestsLoading = false;

  submitRequestId = 0;
  submitPayload: SubmitPropertyPayload = {
    propertyAddress: '',
    propertyValue: 0,
    propertyAge: 0,
  };
  submitMessage = '';

  buyRequestId = 0;
  buyMessage = '';
  showPaymentForm = false;

  initiateCheckout(): void {
    if (!this.buyRequestId) return;
    this.showPaymentForm = true;
  }

  claimPayload: CreateClaimPayload = {
    policyRequestId: 0,
    propertyAddress: '',
    propertyValue: 0,
    propertyAge: 0,
  };
  claimMessage = '';

  invoices: Invoice[] = [];
  invoicesLoading = false;

  activeView: 'browse' | 'requests' | 'claims' | 'invoices' = 'browse';

  getViewTitle(): string {
    switch (this.activeView) {
      case 'browse': return 'Insurance Catalog';
      case 'requests': return 'My Subscriptions';
      case 'claims': return 'Claim Center';
      case 'invoices': return 'Billing & Invoices';
      default: return 'Customer Dashboard';
    }
  }

  getViewSubtitle(): string {
    switch (this.activeView) {
      case 'browse': return 'Explore our comprehensive property protection plans tailored for you.';
      case 'requests': return 'Track your submitted policy requests and property details.';
      case 'claims': return 'Report an incident and manage your submitted insurance claims.';
      case 'invoices': return 'View your payment history, installments, and upcoming dues.';
      default: return 'Manage your insurance profile.';
    }
  }

  getInstallmentAmount(plan: PropertyPlan): number {
    const freq = plan.frequency;
    if (freq === 1 || freq === 'Quarterly') return plan.basePremium / 4; // Quarterly
    if (freq === 2 || freq === 'HalfYearly') return plan.basePremium / 2; // Half-Yearly
    return plan.basePremium; // Yearly
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

  ngOnInit(): void {
    this.loadPlans();
    this.loadMyRequests();
    this.loadInvoices();
  }

  loadPlans(): void {
    this.policies.getAllPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
      },
    });
  }

  createRequestForPlan(planId: number): void {
    if (!planId) {
      return;
    }
    this.createMessage = '';
    this.policies.createRequest(planId).subscribe({
      next: (msg) => {
        this.createMessage = msg;
        this.notifications.show({
          title: 'Request created',
          message: 'Your policy request has been submitted.',
          type: 'success',
        });
        this.loadMyRequests();
      },
      error: (err) => {
        this.createMessage = this.extractError(err);
      },
    });
  }

  loadMyRequests(): void {
    this.requestsLoading = true;
    this.policies.getMyRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.requestsLoading = false;
      },
      error: () => {
        this.requestsLoading = false;
      },
    });
  }

  submitProperty(): void {
    if (!this.submitRequestId) {
      return;
    }
    this.submitMessage = '';
    this.policies
      .submitProperty(this.submitRequestId, this.submitPayload)
      .subscribe({
        next: (msg) => {
          this.submitMessage = msg;
          this.notifications.show({
            title: 'Details submitted',
            message: 'Property details sent to the assigned agent.',
            type: 'success',
          });
          this.loadMyRequests();
        },
        error: (err) => {
          this.submitMessage = this.extractError(err);
        },
      });
  }

  confirmPurchase(): void {
    if (!this.buyRequestId) {
      return;
    }
    this.buyMessage = '';
    this.policies.buyPolicy(this.buyRequestId).subscribe({
      next: (msg) => {
        this.buyMessage = msg;
        this.notifications.show({
          title: 'Purchase confirmed',
          message: 'Waiting for admin approval.',
          type: 'info',
        });
        this.loadMyRequests();
      },
      error: (err) => {
        this.buyMessage = this.extractError(err);
      },
    });
  }

  fileClaim(): void {
    if (!this.claimPayload.policyRequestId) {
      return;
    }
    this.claimMessage = '';
    this.claims.createClaim(this.claimPayload).subscribe({
      next: (msg) => {
        this.claimMessage = msg;
        this.notifications.show({
          title: 'Claim submitted',
          message: 'Your claim is now pending review.',
          type: 'success',
        });
        this.loadInvoices();
      },
      error: (err) => {
        this.claimMessage = this.extractError(err);
      },
    });
  }

  loadInvoices(): void {
    this.invoicesLoading = true;
    this.invoicesService.getMyInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.invoicesLoading = false;
      },
      error: () => {
        this.invoicesLoading = false;
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

