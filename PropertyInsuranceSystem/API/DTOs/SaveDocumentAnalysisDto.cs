namespace API.DTOs
{
    public class SaveDocumentAnalysisDto
    {
        public string ExtractedText { get; set; }
        public string ExtractedDataJson { get; set; }
        public string AiSummary { get; set; }
    }
}
