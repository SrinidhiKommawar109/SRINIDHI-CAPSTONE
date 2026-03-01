import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  styles: [`
    .landing-grid { display: grid; grid-template-columns: 1fr; }
    @media (min-width: 768px) {
      .landing-grid { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); }
    }
  `],
  template: `
    <section class="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div class="landing-grid gap-10 items-start">
        <div class="space-y-6">
          <p class="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200 mb-2">
            Enterprise Property Insurance Administration System
          </p>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Optimize policy, premium, and claims management

            <span class="block text-emerald-600 dark:text-emerald-300">through enterprise role-based governance.</span>
          </h1>
          <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl">
            A complete digital platform designed to streamline property insurance operations. Manage policies, assess risks, calculate premiums, and process claims efficiently through a secure and transparent workflow.          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <a
              routerLink="/login"
              class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            >
              Login to system
            </a>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              (click)="scrollToRoles()"
            >
              View role capabilities
              <span class="h-5 w-5 rounded-full border border-slate-400 flex items-center justify-center text-xs dark:border-slate-500">
                ?
              </span>
            </button>
          </div>
          <div class="mt-6 grid gap-4 text-xs text-slate-600 sm:grid-cols-3 dark:text-slate-300">
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-slate-900 dark:text-slate-100">⚡ Workflow Automation</span>
              <span>Streamlined policy approval and claim processing.</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-slate-900 dark:text-slate-100">📄 Document Management</span>
              <span>Secure storage of policy and claim documents.</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-slate-900 dark:text-slate-100">💰 Invoice & Payment Tracking</span>
              <span>Track billing, payments, and policy status.</span>
            </div>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <img
              src="/images/placeholder-1.svg"
              alt="Property insurance overview"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-800"
            />
            <p class="mt-3 text-[11px] text-slate-600 dark:text-slate-300">
              Centralized policy operations with a secure audit trail.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <img
              src="/images/placeholder-2.svg"
              alt="Claims processing preview"
              class="rounded-xl border border-slate-200 dark:border-slate-800"
            />
            <img
              src="/images/placeholder-3.svg"
              alt="Agent workflow preview"
              class="rounded-xl border border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="max-w-6xl mx-auto px-4 py-12">
      <div class="grid gap-6 md:grid-cols-[1.2fr_1fr] items-start">
        <div>
          <h2 class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            About the platform
          </h2>
          <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Our Property Insurance Management System provides a centralized environment to manage the entire insurance lifecycle. 
            The platform supports administrators, agents, customers, and claims officers with dedicated workflows to ensure efficiency, security, and transparency.
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <p class="font-semibold text-slate-900 dark:text-slate-100">Quote of the day</p>
          <p class="mt-2">
            “Insurance is the promise that tomorrow can still be better.”
          </p>
          <p class="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
            — Property Insurance Team
          </p>
        </div>
      </div>
    </section>

    <section id="features" class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
        Features
      </h2>
      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <p class="font-semibold text-slate-900 dark:text-slate-100">Property Insurance Coverage</p>
          <p class="mt-1">Protect residential and commercial properties against unexpected risks.s</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <p class="font-semibold text-slate-900 dark:text-slate-100">Risk Assessment</p>
          <p class="mt-1">Evaluate property risks using structured assessment methods.</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <p class="font-semibold text-slate-900 dark:text-slate-100">Claims Management</p>
          <p class="mt-1">Simple and transparent claim submission and verification process.</p>
        </div>
      </div>
    </section>

<section id="location" class="max-w-6xl mx-auto px-4 py-12">
  <h2 class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
    Location & Outreach
  </h2>

  <div class="mt-6 grid gap-6 md:grid-cols-2">

    <!-- Contact Details -->
    <div class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Visit our office or reach out through our support channels. We provide
        assistance for policy management, claims processing, and customer support.
      </p>

      <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          📍 Office Address
        </p>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Property Insurance Management Office<br>
          Financial District, Hyderabad<br>
          Telangana, India
        </p>
      </div>

      <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          📞 Phone
        </p>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          +91 98765 43210
        </p>
      </div>

      <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          ✉ Email
        </p>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          support@propertyinsurance.com
        </p>
      </div>
    </div>

    <!-- Google Map -->
    <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <iframe
        src="https://maps.google.com/maps?q=Hyderabad&t=&z=13&ie=UTF8&iwloc=&output=embed"
        width="100%"
        height="320"
        style="border:0;"
        loading="lazy"
      ></iframe>
    </div>

  </div>
</section>


<section id="testimonials" class="max-w-6xl mx-auto px-4 py-12">
  <h2 class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
    Customer Testimonials
  </h2>

  <div class="mt-6 grid gap-4 md:grid-cols-3">

    <!-- Testimonial 1 -->
    <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      
      <!-- Stars -->
      <div class="flex text-yellow-400 mb-2">
        ★★★★★
      </div>

      <p class="text-sm text-slate-600 dark:text-slate-300">
        "The platform makes policy management simple and transparent.
        The workflow is smooth and secure."
      </p>

      <p class="mt-3 text-xs font-semibold text-slate-900 dark:text-slate-100">
        — Rajesh Kumar
      </p>
      <p class="text-xs text-slate-500">Customer</p>
    </div>

    <!-- Testimonial 2 -->
    <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">

      <div class="flex text-yellow-400 mb-2">
        ★★★★★
      </div>

      <p class="text-sm text-slate-600 dark:text-slate-300">
        "Efficient system for handling claims and verifying incidents.
        Saves significant processing time."
      </p>

      <p class="mt-3 text-xs font-semibold text-slate-900 dark:text-slate-100">
        — Priya Sharma
      </p>
      <p class="text-xs text-slate-500">Claims Officer</p>
    </div>

    <!-- Testimonial 3 -->
    <div class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">

      <div class="flex text-yellow-400 mb-2">
        ★★★★★
      </div>

      <p class="text-sm text-slate-600 dark:text-slate-300">
        "Helps us manage policies and assist customers efficiently
        with clear premium calculations."
      </p>

      <p class="mt-3 text-xs font-semibold text-slate-900 dark:text-slate-100">
        — Arjun Reddy
      </p>
      <p class="text-xs text-slate-500">Insurance Agent</p>
    </div>

  </div>
</section>
<section id="feedback" class="max-w-6xl mx-auto px-4 py-12">
  <h2 class="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
    Customer Feedback & Trust
  </h2>

  <div class="mt-8 grid gap-10 md:grid-cols-2">

    <!-- LEFT SIDE — Trust / Stats / Partners -->
    <div class="space-y-6">

      <div>
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Trusted Insurance Platform
        </h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Our platform helps organizations and individuals manage property insurance
          efficiently through secure workflows, risk analytics, and transparent claims
          processing.
        </p>
      </div>

      <!-- Analytics Stats -->
      <div class="grid grid-cols-2 gap-4">

        <div class="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
          <p class="text-2xl font-bold text-emerald-600">10K+</p>
          <p class="text-xs text-slate-600 dark:text-slate-300">Customers Served</p>
        </div>

        <div class="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
          <p class="text-2xl font-bold text-emerald-600">25K+</p>
          <p class="text-xs text-slate-600 dark:text-slate-300">Policies Managed</p>
        </div>

        <div class="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
          <p class="text-2xl font-bold text-emerald-600">8K+</p>
          <p class="text-xs text-slate-600 dark:text-slate-300">Claims Processed</p>
        </div>

        <div class="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
          <p class="text-2xl font-bold text-emerald-600">99%</p>
          <p class="text-xs text-slate-600 dark:text-slate-300">Customer Satisfaction</p>
        </div>

      </div>

      <!-- Partner Companies -->
      <div>
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Our Trusted Partners
        </h3>

        <div class="mt-3 grid grid-cols-3 gap-3 text-center">

          <div class="rounded-lg border border-slate-200 py-3 text-xs dark:border-slate-800">
            LIC
          </div>

          <div class="rounded-lg border border-slate-200 py-3 text-xs dark:border-slate-800">
            HDFC Life
          </div>

          <div class="rounded-lg border border-slate-200 py-3 text-xs dark:border-slate-800">
            Tata Consultancy Services
          </div>

          <div class="rounded-lg border border-slate-200 py-3 text-xs dark:border-slate-800">
            HDFC Ergo
          </div>

          <div class="rounded-lg border border-slate-200 py-3 text-xs dark:border-slate-800">
            CoverPlus
          </div>

          <div class="rounded-lg border border-slate-200 py-3 text-xs dark:border-slate-800">
            Star Health 
          </div>

        </div>
      </div>

    </div>

    <!-- RIGHT SIDE — Feedback Form -->
    <div class="max-w-lg rounded-2xl border border-slate-200 p-6 dark:border-slate-800">

      <form class="space-y-4">

        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <!-- Rating -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Rating
          </label>
          <div class="flex gap-2 text-2xl text-yellow-400">
            ★★★★★
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Message
          </label>
          <textarea
            rows="4"
            placeholder="Write your feedback..."
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          ></textarea>
        </div>

        <button
          type="button"
          class="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
        >
          Submit Feedback
        </button>

      </form>
    </div>

  </div>
</section>

    <section id="roles" class="max-w-6xl mx-auto px-4 py-12">
      <div
        id="role-section"
        class="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Choose your role
          </h2>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            4 roles available
          </span>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            *ngFor="let role of roles()"
            class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-emerald-400/70 hover:bg-emerald-50 transition-colors dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900"
            (click)="goToLogin(role.key)"
          >
            <div
              class="mt-1 h-8 w-8 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-950"
              [ngClass]="role.accent"
            >
              {{ getInitials(role.label) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-900 dark:text-slate-50">
                  {{ role.label }}
                </span>
              </div>
              <p class="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {{ role.description }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
    
  `,
})
export class LandingComponent {
  private readonly router = inject(Router);

  readonly roles = signal<RoleCard[]>([
    {
      key: 'Admin',
      label: 'Admin',
      description: 'Configure categories and plans, approve policy requests, and manage users.',
      accent: 'bg-gradient-to-tr from-sky-500 to-cyan-400',
    },
    {
      key: 'Agent',
      label: 'Agent',
      description: 'Assist customers, send property forms, calculate risk and premium installments.',
      accent: 'bg-gradient-to-tr from-indigo-500 to-violet-400',
    },
    {
      key: 'Customer',
      label: 'Customer',
      description: 'Browse plans, request policies, submit property details, and view invoices.',
      accent: 'bg-gradient-to-tr from-emerald-500 to-lime-400',
    },
    {
      key: 'ClaimsOfficer',
      label: 'Claims Officer',
      description: 'Review pending claims, verify incidents, and approve or reject payouts.',
      accent: 'bg-gradient-to-tr from-rose-500 to-orange-400',
    },
  ]);

  readonly roleCount = computed(() => this.roles().length);

  getInitials(label: string): string {
    return label
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  goToLogin(roleKey: string): void {
    this.router.navigate(['/login'], {
      queryParams: { role: roleKey },
    });
  }

  scrollToRoles(): void {
    const el = document.getElementById('role-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

