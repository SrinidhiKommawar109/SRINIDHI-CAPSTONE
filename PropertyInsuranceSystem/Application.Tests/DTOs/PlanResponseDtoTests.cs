using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class PlanResponseDtoTests
    {
        [Fact]
        public void PlanResponseDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new PlanResponseDto();
            var name = "Plan 1";

            // Act
            dto.PlanName = name;

            // Assert
            Assert.Equal(name, dto.PlanName);
        }
    }
}
