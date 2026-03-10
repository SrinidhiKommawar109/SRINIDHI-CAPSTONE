using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class AuthService : IAuthService
{
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IRepository<ApplicationUser> _userRepository;

    public AuthService(IRepository<ApplicationUser> userRepository, IJwtTokenGenerator tokenGenerator)
    {
        _userRepository = userRepository;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        if (await _userRepository.AnyAsync(u => u.Email == request.Email))
            throw new Exception("User already exists");

        // Only Customer can self register
        if (request.Role != "Customer")
            throw new Exception("Only customers can self register");

        var user = new ApplicationUser
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Customer
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Generate ReferralCode: REF-ID-Name
        user.ReferralCode = $"REF-{user.Id}-{user.FullName.Replace(" ", "").ToUpper()}";

        // Reward the Referrer if applicable
        if (!string.IsNullOrEmpty(request.ReferralCode))
        {
            var referrer = await _userRepository.FirstOrDefaultAsync(u => u.ReferralCode == request.ReferralCode);
            
            if (referrer != null)
            {
                referrer.ReferralBalance += 50;
                referrer.ReferralsCount += 1;
            }
        }

        await _userRepository.SaveChangesAsync();

        var token = _tokenGenerator.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Role = user.Role.ToString(),
            ReferralCode = user.ReferralCode,
            ReferralBalance = user.ReferralBalance,
            ReferralsCount = user.ReferralsCount,
            Expiration = DateTime.UtcNow.AddMinutes(60)
        };
    }
    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            throw new Exception("Invalid credentials");

        var validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!validPassword)
            throw new Exception("Invalid credentials");

        // Auto-fix missing referral code for existing users
        if (string.IsNullOrEmpty(user.ReferralCode))
        {
            user.ReferralCode = $"REF-{user.Id}-{user.FullName.Replace(" ", "").ToUpper()}";
            await _userRepository.SaveChangesAsync();
        }

        var token = _tokenGenerator.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Role = user.Role.ToString(),
            ReferralCode = user.ReferralCode,
            ReferralBalance = user.ReferralBalance,
            ReferralsCount = user.ReferralsCount,
            Expiration = DateTime.UtcNow.AddMinutes(60)
        };
    }
    public async Task CreateUserByAdminAsync(RegisterRequestDto request)
    {
        if (await _userRepository.AnyAsync(u => u.Email == request.Email))
            throw new Exception("User already exists");

        if (request.Role == "Customer")
            throw new Exception("Admin cannot create customer");

        var role = Enum.Parse<UserRole>(request.Role);

        var user = new ApplicationUser
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Generate ReferralCode: REF-ID-Name
        user.ReferralCode = $"REF-{user.Id}-{user.FullName.Replace(" ", "").ToUpper()}";
        await _userRepository.SaveChangesAsync();
    }

    public async Task RedeemAsync(RedeemRequestDto request)
    {
        var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            throw new Exception("User not found");

        if (user.ReferralBalance < request.Amount)
            throw new Exception("Insufficient referral balance");

        user.ReferralBalance -= request.Amount;
        await _userRepository.SaveChangesAsync();
    }
}
