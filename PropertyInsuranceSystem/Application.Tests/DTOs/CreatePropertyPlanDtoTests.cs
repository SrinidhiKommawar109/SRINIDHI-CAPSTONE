using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class CreatePropertyPlanDtoTests
    {
        [Fact]
        public void CreatePropertyPlanDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new CreatePropertyPlanDto();
            var name = "Property Plan";

            // Act
            dto.PlanName = name;

            // Assert
            Assert.Equal(name, dto.PlanName);
        }
    }
}
