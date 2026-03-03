using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class VerifyClaimDtoTests
    {
        [Fact]
        public void VerifyClaimDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new VerifyClaimDto();
            var remarks = "OK";

            // Act
            dto.Remarks = remarks;

            // Assert
            Assert.Equal(remarks, dto.Remarks);
        }
    }
}
