namespace Application.DTOs
{
    public class CreateClaimDto
    {
        public int PolicyRequestId { get; set; }

        public string PropertyAddress { get; set; }
        public decimal PropertyValue { get; set; }
        public int PropertyAge { get; set; }
        public decimal ClaimAmount { get; set; }

        public string? PhotoPaths { get; set; } // Populated by controller
        public DateTime IncidentDate { get; set; }
        public string IncidentType { get; set; }
        public string Description { get; set; }
        public DateTime ClaimSubmittedDate { get; set; }
    }
}
