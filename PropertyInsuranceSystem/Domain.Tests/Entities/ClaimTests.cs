using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace Domain.Tests.Entities
{
    public class ClaimTests
    {
        [Fact]
        public void Claim_ShouldInitializeWithPendingStatus()
        {
            // Arrange & Act
            var claim = new Claim();

            // Assert
            Assert.Equal(ClaimStatus.Pending, claim.Status);
        }

        [Fact]
        public void Claim_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var claim = new Claim();
            var amount = 1500.50m;
            var address = "123 Main St";

            // Act
            claim.ClaimAmount = amount;
            claim.PropertyAddress = address;

            // Assert
            Assert.Equal(amount, claim.ClaimAmount);
            Assert.Equal(address, claim.PropertyAddress);
        }
    }
}
