import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/admin.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-admin-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-user-management.component.html',
})
export class AdminUserManagementComponent implements OnInit {
    private readonly adminService = inject(AdminService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    staff: any[] = [];
    showAddUserForm = false;
    error = '';
    searchTerm = '';

    get filteredStaff(): any[] {
        if (!this.searchTerm.trim()) return this.staff;
        const lowSearch = this.searchTerm.toLowerCase();
        return this.staff.filter(user =>
            user.fullName?.toLowerCase().includes(lowSearch) ||
            user.email?.toLowerCase().includes(lowSearch) ||
            user.role?.toLowerCase().includes(lowSearch)
        );
    }

    newUser = {
        fullName: '',
        email: '',
        password: '',
        role: 'Agent',
    };

    ngOnInit(): void {
        this.loadStaff();
    }

    loadStaff(): void {
        this.adminService.getStaff().subscribe({
            next: (res) => {
                this.staff = res;
                this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges(),
        });
    }

    toggleAddUserForm(): void {
        this.showAddUserForm = !this.showAddUserForm;
        if (!this.showAddUserForm) this.resetUserForm();
    }

    resetUserForm(): void {
        this.newUser = { fullName: '', email: '', password: '', role: 'Agent' };
    }

    submitUser(): void {
        if (!this.newUser.fullName || !this.newUser.email || !this.newUser.password) {
            this.notifications.show({ title: 'Validation Error', message: 'Please fill in all fields.', type: 'error' });
            return;
        }
        this.adminService.createUser(this.newUser).subscribe({
            next: () => {
                this.notifications.show({
                    title: 'User Created',
                    message: `Successfully created ${this.newUser.role}: ${this.newUser.fullName}`,
                    type: 'success',
                });
                this.showAddUserForm = false;
                this.resetUserForm();
                this.loadStaff();
            },
            error: (err) => {
                this.error = err?.error || 'Failed to create user.';
                this.cdr.detectChanges();
            },
        });
    }
}
