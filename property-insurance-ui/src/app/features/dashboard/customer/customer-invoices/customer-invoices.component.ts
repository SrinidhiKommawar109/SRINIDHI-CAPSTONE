import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesService, Invoice } from '../../../../core/invoices.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
                this.invoices = invoices || [];
                this.invoicesLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.invoicesLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    downloadInvoicePdf(invoice: Invoice): void {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129); // Emerald 500
        doc.text('PropShield Insurance', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Tax Invoice #${invoice.invoiceNumber}`, 14, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

        // Customer Details
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setTextColor(100);
        // The Invoice interface only guarantees invoiceNumber, planName, totalPremium, installmentCount, and installmentAmount.
        doc.text(`Plan Name:`, 14, 50);
        doc.text(invoice.planName || '', 14, 56);

        // Table Data
        autoTable(doc, {
            startY: 65,
            head: [['Description', 'Amount']],
            body: [
                ['Total Premium', `Rs ${invoice.totalPremium?.toFixed(2) || '0.00'}`],
                [`Installment Amount (${invoice.installmentCount} months)`, `Rs ${invoice.installmentAmount?.toFixed(2) || '0.00'}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] },
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        const finalY = (doc as any).lastAutoTable.finalY || 100;
        doc.text('Thank you for choosing PropShield!', 14, finalY + 20);

        doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    }
}
