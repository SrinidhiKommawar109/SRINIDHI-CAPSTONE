using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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