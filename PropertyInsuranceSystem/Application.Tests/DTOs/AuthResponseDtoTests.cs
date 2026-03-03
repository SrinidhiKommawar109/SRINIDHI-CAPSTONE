using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class AuthResponseDtoTests
    {
        [Fact]
        public void AuthResponseDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new AuthResponseDto();
            var token = "test-token";
            var role = "Admin";

            // Act
            dto.Token = token;
            dto.Role = role;

            // Assert
            Assert.Equal(token, dto.Token);
            Assert.Equal(role, dto.Role);
        }
    }
}
