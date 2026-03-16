using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class UploadTransferDocumentDto
    {
        [Required]
        public int TransferRequestId { get; set; }

        [Required]
        public string DocumentType { get; set; }

        [Required]
        public IFormFile File { get; set; }
    }
}
