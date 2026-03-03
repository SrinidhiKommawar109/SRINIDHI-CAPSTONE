using Application.DTOs;
using Xunit;

namespace Application.Tests.DTOs
{
    public class RedeemRequestDtoTests
    {
        [Fact]
        public void RedeemRequestDto_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var dto = new RedeemRequestDto();
            var amount = 100m;

            // Act
            dto.Amount = amount;

            // Assert
            Assert.Equal(amount, dto.Amount);
        }
    }
}
