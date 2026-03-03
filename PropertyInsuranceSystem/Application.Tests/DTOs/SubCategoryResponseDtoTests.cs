using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class SubCategoryResponseDtoTests
    {
        [Fact]
        public void SubCategoryResponseDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new SubCategoryResponseDto();
            var name = "Resi";

            // Act
            dto.Name = name;

            // Assert
            Assert.Equal(name, dto.Name);
        }
    }
}
