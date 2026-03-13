import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {

  private readonly http = inject(HttpClient);

  // Calls our backend proxy instead of Groq directly to avoid CORS and secure the key
  private readonly analyzeUrl = `${environment.apiBaseUrl}/Ai/analyze`;
  private readonly groqModel = 'llama-3.3-70b-versatile';

  // ===============================
  // PDF TEXT EXTRACTION
  // ===============================
  async extractTextFromPdf(pdfUrl: string): Promise<string> {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '';
    }
  }

  // ===============================
  // AI CLAIM ANALYSIS
  // ===============================
  analyzeClaim(claimText: string, claimData: any): Observable<any> {
    const prompt = `
Analyze the insurance claim below and prioritize the "Document Text" which contains data extracted from claim documents (e.g., invoices, FIR, medical reports).

Return ONLY a JSON object with this structure:
{
 "summary": ["point1","point2","point3","point4","point5"],
 "riskLevel": "Low | Medium | High",
 "riskReason": "short explanation in simple english"
}

Specific instructions for the summary points:
- Point 1: Key data found in the DOCUMENT (e.g., specific amount cited, date, or names).
- Point 2: Confirmation if the document supports the Incident Type (${claimData.incidentType}).
- Point 3: Verification of the Claim Amount vs Documented Amount (₹${claimData.claimAmount}).
- Point 4: Any specific details about the claimant or property mentioned in the document.
- Point 5: Overall assessment of the documentation quality and consistency.

Claim Details:
Claim ID: ${claimData.id}
Plan: ${claimData.policyRequest?.plan?.planName || 'N/A'}
Incident Type: ${claimData.incidentType}
Description: ${claimData.description}
Claim Amount: ₹${claimData.claimAmount}

Document Text (EXTRACTED FROM PDF):
${claimText || 'No document text found - Please flag as Medium Risk due to missing documentation.'}
`;

    const body = {
      model: this.groqModel,
      messages: [
        {
          role: 'system',
          content: 'You are an insurance claim analyst. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    };

    return this.http.post(this.analyzeUrl, body).pipe(
      map((res: any) => {
        const content = res?.choices?.[0]?.message?.content;
        if (!content) {
          return this.getFallbackResponse('Empty AI response');
        }

        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          return JSON.parse(cleaned);
        } catch (err) {
          console.error('JSON Parse Error:', cleaned);
          return this.getFallbackResponse('Invalid JSON returned by AI');
        }
      }),
      catchError(err => {
        console.error('Backend AI Proxy Error:', err);
        const errorMessage = err?.error?.error?.message || err?.status || 'Unknown error';
        return of(this.getFallbackResponse(`AI service error: ${errorMessage}`));
      })
    );
  }

  // ===============================
  // FALLBACK RESPONSE
  // ===============================
  private getFallbackResponse(reason: string) {
    return {
      summary: [
        'AI analysis unavailable',
        'Please review the claim manually',
        'Ensure backend is running',
        'Check Groq API connectivity',
        'Retry analysis later'
      ],
      riskLevel: 'Medium',
      riskReason: reason
    };
  }
}