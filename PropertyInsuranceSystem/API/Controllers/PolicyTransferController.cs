using Application.DTOs;
using Application.Interfaces;
using API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/policy-transfer")]
    [ApiController]
    public class PolicyTransferController : ControllerBase
    {
        private readonly IPolicyTransferService _transferService;
        private readonly IWebHostEnvironment _environment;

        public PolicyTransferController(IPolicyTransferService transferService, IWebHostEnvironment environment)
        {
            _transferService = transferService;
            _environment = environment;
        }

        [HttpPost("request")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateTransferRequest([FromBody] CreateTransferRequestDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            try
            {
                var requestId = await _transferService.CreateTransferRequestAsync(dto, userId);
                return Ok(new { RequestId = requestId, Message = "Transfer request created successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload-document")]
        public async Task<IActionResult> UploadDocument([FromForm] int transferRequestId, [FromForm] string documentType, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File is empty.");

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "transfer-docs");
            if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/transfer-docs/{fileName}";
            var documentId = await _transferService.UploadTransferDocumentAsync(transferRequestId, documentType, relativePath);

            return Ok(new { documentId, filePath = relativePath, message = "Document uploaded successfully." });
        }

        [HttpPut("document/{id}/analysis")]
        public async Task<IActionResult> SaveDocumentAnalysis(int id, [FromBody] SaveDocumentAnalysisDto dto)
        {
            try
            {
                await _transferService.SaveDocumentAnalysisAsync(id, dto.ExtractedText, dto.ExtractedDataJson, dto.AiSummary);
                return Ok(new { message = "Analysis results saved successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my-requests")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var requests = await _transferService.GetCustomerTransferRequestsAsync(userId);
            return Ok(requests);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,ClaimsOfficer")] // Assuming Admin or ClaimsOfficer can review
        public async Task<IActionResult> GetPendingRequests()
        {
            var requests = await _transferService.GetPendingTransferRequestsAsync();
            return Ok(requests);
        }

        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin,ClaimsOfficer")]
        public async Task<IActionResult> ApproveRequest(int id, [FromBody] UpdateTransferStatusDto dto)
        {
            try
            {
                await _transferService.ApproveTransferRequestAsync(id, dto.OfficerNotes);
                return Ok("Transfer request approved successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("reject/{id}")]
        [Authorize(Roles = "Admin,ClaimsOfficer")]
        public async Task<IActionResult> RejectRequest(int id, [FromBody] UpdateTransferStatusDto dto)
        {
            try
            {
                await _transferService.RejectTransferRequestAsync(id, dto.OfficerNotes);
                return Ok("Transfer request rejected.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
