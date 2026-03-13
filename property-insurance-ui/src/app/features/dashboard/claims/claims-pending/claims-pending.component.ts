import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService, Claim } from '../../../../core/claims.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { AiAnalysisService } from '../../../../core/ai-analysis.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-claims-pending',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './claims-pending.component.html'
})
export class ClaimsPendingComponent implements OnInit {
    private readonly claims = inject(ClaimsService);
    private readonly notifications = inject(NotificationsService);
    private readonly ai = inject(AiAnalysisService);
    private readonly cdr = inject(ChangeDetectorRef);

    pendingClaims: Claim[] = [];
    claimRemarks: Record<number, string> = {};
    analysisResults: Record<number, any> = {};
    analyzing: Record<number, boolean> = {};
    loading = false;
    errorMessage = '';
    readonly apiUrl = environment.apiBaseUrl.replace('/api', '');

    ngOnInit(): void {
        this.loadPending();
    }

    getPhotos(urls: string | undefined): string[] {
        if (!urls) return [];
        return urls.split(',').filter(u => !!u);
    }

    loadPending(): void {
        this.loading = true;
        this.errorMessage = '';
        this.claims.getPendingClaims().subscribe({
            next: (claims) => {
                this.pendingClaims = claims;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    verifyClaim(id: number, accepted: boolean): void {
        this.claims
            .verifyClaim(id, {
                isAccepted: accepted,
                remarks: this.claimRemarks[id] || '',
            })
            .subscribe({
                next: () => {
                    this.notifications.show({
                        title: accepted ? 'Claim approved' : 'Claim rejected',
                        message: `Claim #${id} processed.`,
                        type: accepted ? 'success' : 'info',
                    });
                    this.loadPending();
                },
                error: (err) => {
                    this.errorMessage = this.extractError(err);
                    this.cdr.detectChanges();
                },
            });
    }

    async performAiAnalysis(claim: Claim): Promise<void> {
        this.analyzing[claim.id] = true;
        this.cdr.detectChanges();

        try {
            let extractedText = '';
            const photos = this.getPhotos(claim.photoUrls);
            const pdfs = photos.filter(p => p.toLowerCase().endsWith('.pdf'));

            if (pdfs.length > 0) {
                // Extract text from all PDFs found
                for (const pdf of pdfs) {
                    const text = await this.ai.extractTextFromPdf(this.apiUrl + pdf);
                    extractedText += `--- Content from ${pdf.split('/').pop()} ---\n${text}\n\n`;
                }
            }

            this.ai.analyzeClaim(extractedText, claim).subscribe({
                next: (result) => {
                    this.analysisResults[claim.id] = result;
                    this.analyzing[claim.id] = false;
                    this.notifications.show({
                        title: 'Analysis Complete',
                        message: `AI analysis for Claim #${claim.id} is ready.`,
                        type: 'success'
                    });
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Analysis failed', err);
                    this.analyzing[claim.id] = false;
                    this.cdr.detectChanges();
                }
            });
        } catch (error) {
            console.error('PDF extraction failed', error);
            this.analyzing[claim.id] = false;
            this.cdr.detectChanges();
        }
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
