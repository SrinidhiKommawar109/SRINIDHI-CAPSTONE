using Application.PolicyChat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/policy-chat")]
[ApiController]
public class PolicyChatController : ControllerBase
{
    private readonly IPolicyChatService _policyChatService;

    public PolicyChatController(IPolicyChatService policyChatService)
    {
        _policyChatService = policyChatService;
    }

    [HttpPost]
    [AllowAnonymous] // Assuming customers can access without login, or require auth if needed
    public async Task<IActionResult> Chat([FromBody] PolicyChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            return BadRequest(new { Message = "Question cannot be empty." });
        }

        var response = await _policyChatService.GetChatResponseAsync(request);
        return Ok(response);
    }
}
