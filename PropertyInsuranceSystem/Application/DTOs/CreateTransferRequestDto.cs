using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CreateTransferRequestDto
    {
        [Required]
        public int PolicyId { get; set; }

        [Required]
        public string NewOwnerName { get; set; }

        [Required]
        [EmailAddress]
        public string NewOwnerEmail { get; set; }

        [Required]
        [Phone]
        public string NewOwnerPhone { get; set; }

        [Required]
        public TransferReason TransferReason { get; set; }
    }
}
