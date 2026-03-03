using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class CreateSubCategoryDtoTests
    {
        [Fact]
        public void CreateSubCategoryDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new CreateSubCategoryDto();
            var name = "Sub Cat";

            // Act
            dto.Name = name;

            // Assert
            Assert.Equal(name, dto.Name);
        }
    }
}
