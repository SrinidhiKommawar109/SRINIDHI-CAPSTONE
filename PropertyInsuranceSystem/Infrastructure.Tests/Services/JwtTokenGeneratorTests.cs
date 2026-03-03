using Domain.Entities;
using Domain.Enums;
using Infrastructure.Identity;
using Infrastructure.Services;
using Microsoft.Extensions.Options;
using Xunit;

namespace Infrastructure.Tests.Services
{
    public class JwtTokenGeneratorTests
    {
        [Fact]
        public void GenerateToken_ShouldReturnNonEmptyString()
        {
            // Arrange
            var settings = new JwtSettings
            {
                Secret = "super-secret-key-that-is-at-least-thirty-two-bytes-long-12345",
                Issuer = "test",
                Audience = "test",
                ExpiryMinutes = 60
            };
            var generator = new JwtTokenGenerator(Options.Create(settings));
            var user = new ApplicationUser
            {
                Id = 1,
                Email = "test@example.com",
                Role = UserRole.Customer
            };

            // Act
            var token = generator.GenerateToken(user);

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(token));
        }
    }
}
