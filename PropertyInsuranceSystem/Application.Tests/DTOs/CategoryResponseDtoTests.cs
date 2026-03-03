using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class CategoryResponseDtoTests
    {
        [Fact]
        public void CategoryResponseDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new CategoryResponseDto();
            var name = "Home";

            // Act
            dto.Name = name;

            // Assert
            Assert.Equal(name, dto.Name);
        }
    }
}
