using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class RegisterRequestDtoTests
    {
        [Fact]
        public void RegisterRequestDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new RegisterRequestDto();
            var fullName = "John Doe";

            // Act
            dto.FullName = fullName;

            // Assert
            Assert.Equal(fullName, dto.FullName);
        }
    }
}
