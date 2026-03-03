using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class SubmitPropertyDtoTests
    {
        [Fact]
        public void SubmitPropertyDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new SubmitPropertyDto();
            var val = 500000m;

            // Act
            dto.PropertyValue = val;

            // Assert
            Assert.Equal(val, dto.PropertyValue);
        }
    }
}
