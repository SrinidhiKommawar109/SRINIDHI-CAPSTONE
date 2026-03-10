using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ClaimsController : ControllerBase
{
    private readonly IClaimsService _claimsService;
    private readonly IWebHostEnvironment _environment;

    public ClaimsController(IClaimsService claimsService, IWebHostEnvironment environment)
    {
        _claimsService = claimsService;
        _environment = environment;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> FileClaim([FromForm] CreateClaimDto dto, List<IFormFile>? photos)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            return Unauthorized("User ID not found in token.");

        var userId = int.Parse(userIdClaim.Value);

        try
        {
            if (photos != null && photos.Count > 0)
            {
                var baseRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
                var uploadPath = Path.Combine(baseRoot, "uploads", "claims");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var savedPaths = new List<string>();
                foreach (var file in photos)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var filePath = Path.Combine(uploadPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    savedPaths.Add("/uploads/claims/" + fileName);
                }
                dto.PhotoPaths = string.Join(",", savedPaths);
            }

            await _claimsService.FileClaimAsync(dto, userId);
            return Ok("Claim request sent successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("pending")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<IActionResult> GetPendingClaims()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        int? userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        
        var claims = await _claimsService.GetPendingClaimsAsync(userId);
        return Ok(claims);
    }

    [HttpGet("history")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<IActionResult> GetClaimsHistory()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        int? userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        
        var claims = await _claimsService.GetClaimsHistoryAsync(userId);
        return Ok(claims);
    }

    [HttpPut("{id}/verify")]
    [Authorize(Roles = "ClaimsOfficer")]
    public async Task<IActionResult> VerifyClaim(int id, [FromBody] VerifyClaimDto dto)
    {
        try
        {
            var result = await _claimsService.VerifyClaimAsync(id, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
                return NotFound();
            return BadRequest(ex.Message);
        }
    }
}
