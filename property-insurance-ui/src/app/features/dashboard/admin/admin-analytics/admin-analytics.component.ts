import { Component, OnInit, inject, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/admin.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-admin-analytics',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './admin-analytics.component.html',
})
export class AdminAnalyticsComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly cdr = inject(ChangeDetectorRef);

    stats: any = null;

    @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

    // Plan Sales Chart Config
    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    };
    public barChartType: ChartType = 'bar';
    public barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

    // Agent Performance Config
    public doughnutChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
    };
    public doughnutChartType: ChartType = 'doughnut';
    public doughnutChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.adminService.getStats().subscribe({
            next: (res) => {
                this.stats = res;
                this.setupCharts();
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }

    setupCharts(): void {
        if (!this.stats) return;

        // Setup Bar Chart (Most Popular Plans)
        if (this.stats.topPlans && this.stats.topPlans.length > 0) {
            this.barChartData = {
                labels: this.stats.topPlans.map((p: any) => p.planName),
                datasets: [{
                    data: this.stats.topPlans.map((p: any) => p.count),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald 500
                    borderRadius: 4
                }]
            };
        }

        // Setup Doughnut Chart (Top Agents)
        if (this.stats.topAgents && this.stats.topAgents.length > 0) {
            this.doughnutChartData = {
                labels: this.stats.topAgents.map((a: any) => a.name),
                datasets: [{
                    data: this.stats.topAgents.map((a: any) => a.policiesSold),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',   // Indigo 500
                        'rgba(244, 63, 94, 0.8)',    // Rose 500
                        'rgba(14, 165, 233, 0.8)',   // Sky 500
                        'rgba(245, 158, 11, 0.8)',   // Amber 500
                        'rgba(168, 85, 247, 0.8)'    // Purple 500
                    ]
                }]
            };
        }

        // Force chart update
        if (this.charts) {
            this.charts.forEach(chart => chart.update());
        }
    }
}
