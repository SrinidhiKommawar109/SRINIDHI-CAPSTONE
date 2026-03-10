import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    PolicyRequestsService,
    PolicyRequest,
    SubmitPropertyPayload,
} from '../../../../core/policy-requests.service';
import { AuthService } from '../../../../core/auth.service';
import { NotificationsService } from '../../../../core/notifications.service';

@Component({
    selector: 'app-customer-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-requests.component.html',
})
export class CustomerRequestsComponent implements OnInit {
    private readonly policies = inject(PolicyRequestsService);
    private readonly auth = inject(AuthService);
    private readonly notifications = inject(NotificationsService);
    private readonly cdr = inject(ChangeDetectorRef);

    useWallet = false;
    walletBalance = 0;

    myRequests: PolicyRequest[] = [];
    requestsLoading = false;

    // Multi-step Flow State
    currentStep = 1; // 1: Select, 2: Submit Details, 3: Review, 4: Payment
    activeRequestId: number | null = null;
    submitPayload: SubmitPropertyPayload = { propertyAddress: '', propertyValue: 0, propertyAge: 0 };
    submitMessage = '';

    showMoreInfo = false;

    // Specific form objects
    residentialForm = {
        propertyType: '',
        builtUpArea: 0,
        numberOfFloors: 1,
        constructionType: '',
        occupancyType: '',
        securitySystemAvailable: 'No',
        fireSafetyEquipment: 'No',
        floodZone: 'No',
        earthquakeZone: 'Low',
        previousInsuranceClaims: 0,
        yearOfLastRenovation: new Date().getFullYear(),
        nearbyFireStationDistance: 0
    };

    commercialForm = {
        propertyType: '',
        businessType: '',
        builtUpArea: 0,
        numberOfEmployees: 1,
        fireSafetySystem: 'No',
        securitySystemCCTV: 'No',
        storageOfFlammableMaterials: 'No',
        previousInsuranceClaims: 0,
        crimeRateInArea: 'Low',
        businessOperatingHours: '',
        backupPowerSystem: 'No',
        emergencyExitAvailable: 'No'
    };

    industrialForm = {
        propertyType: '',
        industryType: '',
        numberOfWorkers: 1,
        machineryValue: 0,
        hazardousMaterialStorage: 'No',
        fireProtectionSystem: 'No',
        safetyComplianceCertification: 'No',
        accidentHistory: 0,
        distanceToFireStation: 0,
        securitySystemAvailable: 'No',
        workingHours: '',
        environmentalRisk: 'Low'
    };

    contentsForm = {
        propertyLocation: '',
        contentType: '',
        totalContentValue: 0,
        numberOfItems: 1,
        storageType: '',
        fireProtectionSystem: 'No',
        theftProtection: 'No', // CCTV / Alarm
        previousTheftClaims: 0,
        waterDamageProtection: 'No',
        backupPowerSystem: 'No',
        temperatureControlledStorage: 'No',
        inventoryTurnoverFrequency: '',
        buildingSecurityLevel: 'Low',
        claimHistory: 0
    };

    get selectedRequest(): PolicyRequest | null {
        if (!this.activeRequestId) return null;
        return this.myRequests.find(r => r.id == this.activeRequestId) || null;
    }

    get selectedFormType(): string | null {
        const req = this.selectedRequest;
        return req ? ((req as any).formType || (req as any).FormType || null) : null;
    }

    get walletDiscount(): number {
        const baseAmount = this.installmentAmount;
        if (!this.useWallet || !baseAmount) return 0;
        // Use up to 40% of wallet balance, capped by the current payment amount
        const maxFromWallet = this.walletBalance * 0.4;
        return Math.min(maxFromWallet, baseAmount);
    }

    get finalTotal(): number {
        const amount = this.installmentAmount;
        return Math.max(0, amount - this.walletDiscount);
    }

    buyMessage = '';
    showPaymentForm = false;

    // Payment Tiers & Schedule
    selectedFrequency: 'Yearly' | 'Half-Yearly' | 'Quarterly' = 'Yearly';
    paymentSchedule: { date: Date, amount: number }[] = [];

    get installmentAmount(): number {
        const total = this.selectedRequest?.totalPremium || 0;
        if (this.selectedFrequency === 'Yearly') return total;
        if (this.selectedFrequency === 'Half-Yearly') return total / 2;
        if (this.selectedFrequency === 'Quarterly') return total / 4;
        return total;
    }

    get installmentCount(): number {
        if (this.selectedFrequency === 'Yearly') return 1;
        if (this.selectedFrequency === 'Half-Yearly') return 2;
        if (this.selectedFrequency === 'Quarterly') return 4;
        return 1;
    }

    selectFrequency(freq: 'Yearly' | 'Half-Yearly' | 'Quarterly'): void {
        this.selectedFrequency = freq;
        this.generateSchedule();
        this.cdr.detectChanges();
    }

    generateSchedule(): void {
        this.paymentSchedule = [];
        const count = this.installmentCount;
        const amount = this.installmentAmount;
        const today = new Date();

        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            if (this.selectedFrequency === 'Quarterly') {
                date.setMonth(today.getMonth() + (i * 3));
            } else if (this.selectedFrequency === 'Half-Yearly') {
                date.setMonth(today.getMonth() + (i * 6));
            } else {
                date.setFullYear(today.getFullYear() + i);
            }
            this.paymentSchedule.push({ date, amount });
        }
    }

    ngOnInit(): void {
        this.loadMyRequests();
        this.walletBalance = this.auth.getReferralBalance();
    }

    loadMyRequests(): void {
        this.requestsLoading = true;
        this.policies.getMyRequests().subscribe({
            next: (requests) => {
                this.myRequests = requests;
                this.requestsLoading = false;
                this.cdr.detectChanges();

                // If we have an active request, update its data
                if (this.activeRequestId) {
                    const updated = this.myRequests.find(r => r.id == this.activeRequestId);
                    if (updated && updated.status === 'RiskCalculated' && this.currentStep === 2) {
                        this.currentStep = 3;
                        // Set default frequency from request
                        this.selectedFrequency = (updated as any).frequency || 'Yearly';
                        this.generateSchedule();
                    }
                }
            },
            error: () => {
                this.requestsLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    goToNextStep(): void {
        if (this.currentStep === 1) {
            if (!this.activeRequestId) {
                this.submitMessage = 'Please enter a valid Request ID.';
                return;
            }
            const req = this.selectedRequest;
            if (!req) {
                this.submitMessage = 'Request ID not found.';
                return;
            }

            if (req.status === 'AgentAssigned' || req.status === 'FormSent') {
                this.currentStep = 2;
            } else if (req.status === 'FormSubmitted') {
                this.currentStep = 2;
            } else if (req.status === 'RiskCalculated') {
                this.currentStep = 3;
            } else {
                this.submitMessage = `Request is in ${req.status} status.`;
            }
        } else if (this.currentStep === 2) {
            // Already handled by submitProperty()
        } else if (this.currentStep === 3) {
            this.currentStep = 4;
            this.showPaymentForm = true;
        }
        this.submitMessage = '';
        this.cdr.detectChanges();
    }

    goToStep(step: number): void {
        if (step < this.currentStep) {
            this.currentStep = step;
            if (step < 4) this.showPaymentForm = false;
        }
        this.cdr.detectChanges();
    }

    submitProperty(): void {
        if (!this.activeRequestId) return;

        if (!this.submitPayload.propertyAddress.trim()) {
            this.submitMessage = 'Property address is required.';
            return;
        }
        if (this.submitPayload.propertyValue <= 0 && this.selectedFormType !== 'Contents') {
            this.submitMessage = 'Property value must be greater than zero.';
            return;
        }
        if (this.submitPayload.propertyAge < 0 && this.selectedFormType !== 'Contents') {
            this.submitMessage = 'Property age cannot be negative.';
            return;
        }

        let detailsObj: any = {};
        if (this.selectedFormType === 'Residential') detailsObj = this.residentialForm;
        else if (this.selectedFormType === 'Commercial') detailsObj = this.commercialForm;
        else if (this.selectedFormType === 'Industrial') detailsObj = this.industrialForm;
        if (this.selectedFormType === 'Contents') {
            detailsObj = this.contentsForm;
            this.submitPayload.propertyValue = this.contentsForm.totalContentValue;
            this.submitPayload.propertyAge = 0; // Contents usually don't have construction age in the same way
        }

        this.submitPayload.propertyDetailsJson = JSON.stringify(detailsObj);

        this.submitMessage = '';
        this.policies.submitProperty(this.activeRequestId, this.submitPayload).subscribe({
            next: (msg) => {
                this.submitMessage = msg;
                this.notifications.show({ title: 'Details submitted', message: 'Property details sent to the assigned agent.', type: 'success' });
                this.loadMyRequests();
                // Stay on Step 2 but show "Submitted" state
            },
            error: (err) => {
                this.submitMessage = err?.error || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
    }

    // Payment form local state
    paymentTab: 'card' | 'upi' | 'netbanking' = 'card';
    paymentInfo = {
        cardNumber: '',
        expiry: '',
        cvv: '',
        upiId: '',
        bankName: ''
    };
    paymentError = '';

    canProceedToPayment(): boolean {
        return this.selectedRequest?.status === 'RiskCalculated';
    }

    setPaymentTab(tab: 'card' | 'upi' | 'netbanking'): void {
        this.paymentTab = tab;
        this.paymentError = '';
    }

    confirmPurchase(): void {
        if (!this.activeRequestId) return;

        this.paymentError = '';

        if (this.paymentTab === 'card') {
            if (this.paymentInfo.cardNumber.replace(/\D/g, '').length < 16) {
                this.paymentError = 'Invalid card number.';
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(this.paymentInfo.expiry)) {
                this.paymentError = 'Invalid expiry (MM/YY).';
                return;
            }
            if (this.paymentInfo.cvv.length < 3) {
                this.paymentError = 'Invalid CVV.';
                return;
            }
        } else if (this.paymentTab === 'upi') {
            if (!this.paymentInfo.upiId || !this.paymentInfo.upiId.includes('@')) {
                this.paymentError = 'Please enter a valid PhonePe/UPI ID.';
                return;
            }
        } else if (this.paymentTab === 'netbanking') {
            if (!this.paymentInfo.bankName) {
                this.paymentError = 'Please select a bank.';
                return;
            }
        }

        this.buyMessage = '';
        this.paymentError = '';
        this.policies.buyPolicy(this.activeRequestId).subscribe({
            next: (msg) => {
                this.buyMessage = msg;
                this.notifications.show({ title: 'Purchase confirmed', message: 'Waiting for admin approval.', type: 'info' });

                // Deduct wallet if used
                if (this.useWallet && this.walletDiscount > 0) {
                    const newBalance = Math.max(0, this.walletBalance - this.walletDiscount);
                    localStorage.setItem('pis_balance', newBalance.toString());
                    this.walletBalance = newBalance;
                    this.useWallet = false;
                }

                this.currentStep = 1;
                this.activeRequestId = null;
                this.showPaymentForm = false;
                this.loadMyRequests();
            },
            error: (err) => {
                this.buyMessage = err?.error || 'Something went wrong.';
                this.cdr.detectChanges();
            },
        });
    }
}
