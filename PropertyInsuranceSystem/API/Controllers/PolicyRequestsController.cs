using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PolicyRequestsController : ControllerBase
{
    private readonly IPolicyRequestService _policyRequestService;

    public PolicyRequestsController(IPolicyRequestService policyRequestService)
    {
        _policyRequestService = policyRequestService;
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    [HttpPost("create")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateRequest(CreatePolicyRequestDto dto)
    {
        if (dto == null)
            return BadRequest("Invalid request data.");

        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        try
        {
            await _policyRequestService.CreateRequestAsync(dto, userId.Value);
            return Ok("Policy request created successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("admin/pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var requests = await _policyRequestService.GetPendingRequestsAsync();
        return Ok(requests);
    }

    [HttpPut("{id}/assign-agent/{agentId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignAgent(int id, int agentId, [FromBody] string? adminNotes)
    {
        try
        {
            await _policyRequestService.AssignAgentAsync(id, agentId, adminNotes);
            return Ok("Agent assigned successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("not found") ? NotFound(ex.Message) : BadRequest(ex.Message);
        }
    }

    [HttpGet("agent/assigned")]
    [Authorize(Roles = "Agent")]
    public async Task<IActionResult> GetAssignedRequests()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        var requests = await _policyRequestService.GetAssignedRequestsAsync(userId.Value);
        return Ok(requests);
    }

    [HttpPut("{id}/send-form")]
    [Authorize(Roles = "Agent")]
    public async Task<IActionResult> SendFormToCustomer(int id, [FromQuery] string formType)
    {
        try
        {
            await _policyRequestService.SendFormToCustomerAsync(id, formType);
            return Ok("Form sent to customer.");
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("not found") ? NotFound(ex.Message) : BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/submit-form")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> SubmitPropertyDetails(int id, SubmitPropertyDto dto)
    {
        try
        {
            await _policyRequestService.SubmitPropertyDetailsAsync(id, dto);
            return Ok("Property details submitted successfully.");
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("not found") ? NotFound(ex.Message) : BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/calculate-risk")]
    [Authorize(Roles = "Agent")]
    public async Task<IActionResult> CalculateRisk(int id)
    {
        try
        {
            var result = await _policyRequestService.CalculateRiskAsync(id);
            return Ok(new
            {
                result.Id,
                result.PlanId,
                result.PlanName,
                result.RiskScore,
                result.TotalPremium,
                result.Frequency,
                result.InstallmentCount,
                result.InstallmentAmount,
                result.AgentCommissionAmount,
                result.Status
            });
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("not found") ? NotFound(ex.Message) : BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/buy")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> BuyPolicy(int id)
    {
        try
        {
            await _policyRequestService.BuyPolicyAsync(id);
            return Ok("Customer confirmed. Waiting for admin approval.");
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("not found") ? NotFound(ex.Message) : BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/admin-approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminApprove(int id)
    {
        try
        {
            await _policyRequestService.AdminApproveAsync(id);
            return Ok("Policy officially approved.");
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("not found") ? NotFound(ex.Message) : BadRequest(ex.Message);
        }
    }

    [HttpGet("customer/my-requests")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        var requests = await _policyRequestService.GetMyRequestsAsync(userId.Value);
        return Ok(requests);
    }

    [HttpGet("agent/approved")]
    [Authorize(Roles = "Agent")]
    public async Task<IActionResult> GetApprovedForAgent()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized("User ID not found in token.");

        var requests = await _policyRequestService.GetApprovedForAgentAsync(userId.Value);
        return Ok(requests);
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminAllRequests()
    {
        var requests = await _policyRequestService.GetAllRequestsAsync();
        return Ok(requests);
    }
}
