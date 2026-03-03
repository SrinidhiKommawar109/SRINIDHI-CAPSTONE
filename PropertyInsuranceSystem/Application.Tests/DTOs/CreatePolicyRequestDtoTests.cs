using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class CreatePolicyRequestDtoTests
    {
        [Fact]
        public void CreatePolicyRequestDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new CreatePolicyRequestDto();
            var planId = 1;

            // Act
            dto.PlanId = planId;

            // Assert
            Assert.Equal(planId, dto.PlanId);
        }
    }
}
