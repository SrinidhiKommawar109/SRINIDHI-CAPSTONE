import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesService, Invoice } from '../../../../core/invoices.service';

@Component({
    selector: 'app-customer-invoices',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './customer-invoices.component.html',
})
export class CustomerInvoicesComponent implements OnInit {
    private readonly invoicesService = inject(InvoicesService);
    private readonly cdr = inject(ChangeDetectorRef);

    invoices: Invoice[] = [];
    invoicesLoading = false;

    ngOnInit(): void {
        this.loadInvoices();
    }

    loadInvoices(): void {
        this.invoicesLoading = true;
        this.invoicesService.getMyInvoices().subscribe({
            next: (invoices) => {
                this.invoices = invoices;
                this.invoicesLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.invoicesLoading = false;
                this.cdr.detectChanges();
            },
        });
    }
}
