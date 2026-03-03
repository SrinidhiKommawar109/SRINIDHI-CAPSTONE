using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class CreatePlanDtoTests
    {
        [Fact]
        public void CreatePlanDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new CreatePlanDto();
            var name = "Gold";

            // Act
            dto.PlanName = name;

            // Assert
            Assert.Equal(name, dto.PlanName);
        }
    }
}
