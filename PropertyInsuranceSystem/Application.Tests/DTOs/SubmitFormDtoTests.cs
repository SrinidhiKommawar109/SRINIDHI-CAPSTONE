using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class SubmitFormDtoTests
    {
        [Fact]
        public void SubmitFormDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new SubmitFormDto();
            var addr = "Address";

            // Act
            dto.PropertyAddress = addr;

            // Assert
            Assert.Equal(addr, dto.PropertyAddress);
        }
    }
}
