using API.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;

    public AuthController(IAuthService authService, IEmailService emailService)
    {
        _authService = authService;
        _emailService = emailService;
    }

    [HttpPost("register-new")]
    public async Task<IActionResult> RegisterNew(RegisterDto request)
    {
        try 
        {
            var registerRequest = new RegisterRequestDto
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password,
                Role = string.IsNullOrEmpty(request.Role) ? "Customer" : request.Role,
                ReferralCode = request.ReferralCode
            };

            await _authService.RegisterAsync(registerRequest);
            await _emailService.SendWelcomeEmailAsync(request.Email, request.FullName);
            
            return Ok(new { message = "Registration successful and welcome email sent." });
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { message = "Registration failed.", detail = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }
    [Authorize(Roles = "Admin")]
    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUserByAdmin(RegisterRequestDto request)
    {
        await _authService.CreateUserByAdminAsync(request);
        return Ok("User created successfully");
    }

    [HttpPost("redeem")]
    public async Task<IActionResult> Redeem(RedeemRequestDto request)
    {
        await _authService.RedeemAsync(request);
        return Ok("Redeemed successfully");
    }
}