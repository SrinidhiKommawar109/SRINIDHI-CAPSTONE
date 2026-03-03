import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/admin.service';

@Component({
    selector: 'app-admin-analytics',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-analytics.component.html',
})
export class AdminAnalyticsComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly cdr = inject(ChangeDetectorRef);

    stats: any = null;

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.adminService.getStats().subscribe({
            next: (res) => {
                this.stats = res;
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }
}
