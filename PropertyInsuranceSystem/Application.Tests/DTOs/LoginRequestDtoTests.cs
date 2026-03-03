using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class LoginRequestDtoTests
    {
        [Fact]
        public void LoginRequestDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new LoginRequestDto();
            var email = "test@test.com";

            // Act
            dto.Email = email;

            // Assert
            Assert.Equal(email, dto.Email);
        }
    }
}
