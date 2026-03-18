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
Analyze this insurance claim for potential fraud and risk.
Claim Details:
- Incident Type: ${claimData.incidentType}
- Description: ${claimData.description}
- Property Address: ${claimData.propertyAddress}
- Property Value: ${claimData.propertyValue}
- Claim Amount: ${claimData.claimAmount}

Extracted Document Content:
${claimText.substring(0, 4000)}

Tasks:
1. Provide a short "Smart Summary" (max 3 bullet points) of the claim and the supporting evidence.
2. Assess the Risk Level (Low, Medium, High).
3. Provide a brief reason for the risk assessment.

Respond ONLY with a JSON object:
{
  "summary": ["Point 1", "Point 2", "Point 3"],
  "riskLevel": "Low/Medium/High",
  "riskReason": "..."
}
`;

    const body = {
      model: this.groqModel,
      messages: [
        { role: 'system', content: 'You are an insurance claim adjuster. Always return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    };

    return this.http.post(this.analyzeUrl, body).pipe(
      map((res: any) => {
        const content = res?.choices?.[0]?.message?.content;
        if (!content) return this.getFallbackResponse('No content from AI');
        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          return JSON.parse(cleaned);
        } catch (err) {
          return this.getFallbackResponse('Error parsing AI response');
        }
      }),
      catchError(err => of(this.getFallbackResponse('Backend connection error')))
    );
  }

  analyzeTransferDocument(extractedText: string, metadata: any): Observable<any> {
    const prompt = `
Analyze this document for a Policy Ownership Transfer.
Request Type: ${metadata.reason}
Target Owner Name: ${metadata.targetName}

Document Content:
${extractedText.substring(0, 4000)}

Tasks:
1. Extract these fields into a JSON object: {"newOwner": "...", "policyNumber": "...", "date": "..."}
2. Provide a 3-point bulleted "Smart Summary" verifying if the document supports the transfer.
3. Flag any name mismatches between the document and the Target Owner Name (${metadata.targetName}).

Respond ONLY with a JSON object:
{
  "structuredData": {"newOwner": "...", "policyNumber": "...", "date": "..."},
  "summary": "Point 1\\nPoint 2\\nPoint 3",
  "isValid": true,
  "validationMessage": "Document looks consistent."
}
`;

    const body = {
      model: this.groqModel,
      messages: [
        { role: 'system', content: 'You are an insurance document auditor. Always return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    };

    return this.http.post(this.analyzeUrl, body).pipe(
      map((res: any) => {
        const content = res?.choices?.[0]?.message?.content;
        if (!content) return { summary: 'AI unavailable', structuredData: {}, isValid: false };
        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          return JSON.parse(cleaned);
        } catch (err) {
          return { summary: 'Error parsing AI response', structuredData: {}, isValid: false };
        }
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