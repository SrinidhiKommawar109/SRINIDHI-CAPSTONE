using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Identity;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Xunit;

namespace Infrastructure.Tests.Services
{
    public class AuthServiceTests
    {
        private ApplicationDbContext GetContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        private JwtTokenGenerator GetTokenGenerator()
        {
            var settings = new JwtSettings
            {
                Secret = "super-secret-key-that-is-at-least-thirty-two-bytes-long-12345",
                Issuer = "test",
                Audience = "test",
                ExpiryMinutes = 60
            };
            return new JwtTokenGenerator(Options.Create(settings));
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUser_WhenValidRequest()
        {
            // Arrange
            var context = GetContext();
            var generator = GetTokenGenerator();
            var service = new AuthService(context, generator);
            var request = new RegisterRequestDto
            {
                Email = "newuser@example.com",
                FullName = "New User",
                Password = "Password123",
                Role = "Customer"
            };

            // Act
            var response = await service.RegisterAsync(request);

            // Assert
            Assert.NotNull(response.Token);
            Assert.Equal("Customer", response.Role);
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            Assert.NotNull(user);
            Assert.Equal(UserRole.Customer, user.Role);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreValid()
        {
            // Arrange
            var context = GetContext();
            var generator = GetTokenGenerator();
            var service = new AuthService(context, generator);
            var email = "test@example.com";
            var password = "Password123";
            var user = new ApplicationUser
            {
                Email = email,
                FullName = "Test User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Customer
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var request = new LoginRequestDto { Email = email, Password = password };

            // Act
            var response = await service.LoginAsync(request);

            // Assert
            Assert.NotNull(response.Token);
            Assert.Equal("Customer", response.Role);
        }

        [Fact]
        public async Task RedeemAsync_ShouldReduceBalance_WhenSufficient()
        {
            // Arrange
            var context = GetContext();
            var generator = GetTokenGenerator();
            var service = new AuthService(context, generator);
            var email = "test@example.com";
            var user = new ApplicationUser
            {
                Email = email,
                FullName = "Test User",
                ReferralBalance = 100,
                Role = UserRole.Customer,
                PasswordHash = "dummy"
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var request = new RedeemRequestDto { Email = email, Amount = 50 };

            // Act
            await service.RedeemAsync(request);

            // Assert
            var updatedUser = await context.Users.FirstAsync(u => u.Email == email);
            Assert.Equal(50, updatedUser.ReferralBalance);
        }
    }
}
