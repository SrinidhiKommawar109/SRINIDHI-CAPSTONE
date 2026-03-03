using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace Domain.Tests.Entities
{
    public class PolicyRequestTests
    {
        [Fact]
        public void PolicyRequest_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var request = new PolicyRequest();
            var premiumAmount = 1500.00m;
            var status = PolicyRequestStatus.PolicyApproved;

            // Act
            request.PremiumAmount = premiumAmount;
            request.Status = status;

            // Assert
            Assert.Equal(premiumAmount, request.PremiumAmount);
            Assert.Equal(status, request.Status);
        }

        [Fact]
        public void PolicyRequest_RiskScore_ShouldBeNullable()
        {
            // Arrange
            var request = new PolicyRequest();

            // Act & Assert
            Assert.Null(request.RiskScore);
            request.RiskScore = 0.75m;
            Assert.Equal(0.75m, request.RiskScore);
        }
    }
}
