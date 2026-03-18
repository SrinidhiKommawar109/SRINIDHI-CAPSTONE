import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyRequestsService, PolicyRequest } from '../../../../core/policy-requests.service';

@Component({
  selector: 'app-agent-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-policies.component.html'
})
export class AgentPoliciesComponent implements OnInit {
  private readonly policyService = inject(PolicyRequestsService);
  private readonly cdr = inject(ChangeDetectorRef);

  allPolicies: PolicyRequest[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  get filteredPolicies(): PolicyRequest[] {
    if (!this.searchTerm.trim()) return this.allPolicies;
    const lowSearch = this.searchTerm.toLowerCase();
    return this.allPolicies.filter(p =>
      p.customerName?.toLowerCase().includes(lowSearch) ||
      p.planName?.toLowerCase().includes(lowSearch) ||
      p.status.toLowerCase().includes(lowSearch) ||
      p.id.toString().includes(lowSearch)
    );
  }

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading = true;
    this.error = '';
    this.policyService.getAgentAssigned().subscribe({
      next: (data) => {
        this.allPolicies = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading policies:', err);
        this.error = 'Failed to load policies. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PolicyApproved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'PendingAdmin': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'FormSent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'FormSubmitted': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'RiskCalculated': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
      case 'CustomerConfirmed': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
      case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }
}
