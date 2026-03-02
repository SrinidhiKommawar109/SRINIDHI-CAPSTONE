import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme.service';

interface RoleCard {
  key: string;
  label: string;
  description: string;
  accent: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html'
})

export class LandingComponent {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly themeMode = this.themeService.mode;

  readonly stats = signal([
    { value: '10K+', label: 'Customers Served' },
    { value: '25K+', label: 'Policies Managed' },
    { value: '8K+', label: 'Claims Processed' },
    { value: '99%', label: 'Customer Satisfaction' },
  ]);

  readonly aboutPoints = signal([
    'Secure role-based access control',
    'Real-time risk assessment engine',
    'Automated claims verification pipeline',
  ]);

  readonly features = signal([
    { icon: '🏠', title: 'Property Coverage', desc: 'Protect residential and commercial properties against unexpected risks with comprehensive plans.', iconBg: 'bg-emerald-100' },
    { icon: '📊', title: 'Risk Assessment', desc: 'Evaluate property risks using structured assessment methods and AI-powered analytics.', iconBg: 'bg-blue-100' },
    { icon: '⚡', title: 'Claims Management', desc: 'Simple and transparent claim submission and verification with real-time status tracking.', iconBg: 'bg-yellow-100' },
    { icon: '🛡️', title: 'Policy Administration', desc: 'Full lifecycle management of policies from creation through renewal and cancellation.', iconBg: 'bg-rose-100' },
    { icon: '👥', title: 'Multi-Role Access', desc: 'Dedicated workflows for admins, agents, customers, and claims officers with fine-grained permissions.', iconBg: 'bg-purple-100' },
    { icon: '📋', title: 'Invoice & Billing', desc: 'Automated premium calculations, installment schedules, and complete billing history per policy.', iconBg: 'bg-teal-100' },
  ]);

  readonly properties = signal([
    { title: 'Skyline Residency', price: 'From ₹27,000/yr', size: '2000 sqft', type: 'Residential', badge: 'For Cover', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80' },
    { title: 'Crystal Heights Apt', price: 'From ₹35,000/yr', size: '2800 sqft', type: 'Commercial', badge: 'Popular', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format&fit=crop&q=80' },
    { title: 'Evergreen Park Villa', price: 'From ₹20,000/yr', size: '1800 sqft', type: 'Residential', badge: 'New Plan', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=80' },
  ]);

  readonly testimonials = signal([
    { name: 'Rajesh Kumar', role: 'Customer', initials: 'RK', avatarBg: 'bg-gradient-to-br from-blue-500 to-cyan-500', message: 'The platform makes policy management simple and transparent. The workflow is incredibly smooth and secure.' },
    { name: 'Priya Sharma', role: 'Claims Officer', initials: 'PS', avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-500', message: 'Efficient system for handling claims and verifying incidents. Saves significant processing time and reduces errors.' },
    { name: 'Arjun Reddy', role: 'Insurance Agent', initials: 'AR', avatarBg: 'bg-gradient-to-br from-violet-500 to-pink-500', message: 'Helps us manage policies and assist customers efficiently with clear premium calculations and structured workflows.' },
  ]);

  readonly roles = signal<RoleCard[]>([
    { key: 'Admin', label: 'Admin', description: 'Configure categories and plans, approve policy requests, and manage all users.', accent: 'bg-gradient-to-tr from-sky-500 to-cyan-400' },
    { key: 'Agent', label: 'Agent', description: 'Assist customers, send property forms, calculate risk scores and premium installments.', accent: 'bg-gradient-to-tr from-indigo-500 to-violet-400' },
    { key: 'Customer', label: 'Customer', description: 'Browse plans, request policies, submit property details, and view invoices.', accent: 'bg-gradient-to-tr from-emerald-500 to-teal-400' },
    { key: 'ClaimsOfficer', label: 'Claims Officer', description: 'Review pending claims, verify incidents, and approve or reject payouts.', accent: 'bg-gradient-to-tr from-rose-500 to-orange-400' },
  ]);

  readonly feedbackRatings = signal([
    { emoji: '😠', label: 'Terrible' },
    { emoji: '🙁', label: 'Bad' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😍', label: 'Amazing' },
  ]);

  readonly likeOptions = signal([
    'Policy Variety',
    'Claims Speed',
    'Agent Support',
    'Interface'
  ]);

  selectedRating = signal<string | null>(null);
  selectedLikes = signal<Set<string>>(new Set());

  setRating(label: string): void {
    this.selectedRating.set(label);
  }

  toggleLike(option: string): void {
    const current = new Set(this.selectedLikes());
    if (current.has(option)) {
      current.delete(option);
    } else {
      current.add(option);
    }
    this.selectedLikes.set(current);
  }

  isLikeSelected(option: string): boolean {
    return this.selectedLikes().has(option);
  }

  readonly roleCount = computed(() => this.roles().length);

  getInitials(label: string): string {
    return label.split(' ').map(p => p[0]).join('').toUpperCase();
  }

  goToLogin(roleKey: string): void {
    this.router.navigate(['/login'], { queryParams: { role: roleKey } });
  }

  scrollToRoles(): void {
    document.getElementById('role-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  submitFeedback(): void {
    // Implement feedback submission logic if needed
    console.log('Feedback submitted:', {
      rating: this.selectedRating(),
      likes: Array.from(this.selectedLikes()),
    });
    // Reset form or show success message
  }
}
