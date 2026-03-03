using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class CreateClaimDtoTests
    {
        [Fact]
        public void CreateClaimDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new CreateClaimDto();
            var addr = "123 St";

            // Act
            dto.PropertyAddress = addr;

            // Assert
            Assert.Equal(addr, dto.PropertyAddress);
        }
    }
}
