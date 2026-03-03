using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class PolicyRequestResponseDtoTests
    {
        [Fact]
        public void PolicyRequestResponseDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new PolicyRequestResponseDto();
            var status = Domain.Enums.PolicyRequestStatus.PolicyApproved;

            // Act
            dto.Status = status;

            // Assert
            Assert.Equal(status, dto.Status);
        }
    }
}
