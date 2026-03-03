using Domain.Enums;
using Xunit;

namespace Domain.Tests.Enums
{
    public class PolicyRequestStatusTests
    {
        [Fact]
        public void PolicyRequestStatus_ShouldHaveExpectedValues()
        {
            // Assert
            Assert.Equal(0, (int)PolicyRequestStatus.PendingAdmin);
            Assert.Equal(1, (int)PolicyRequestStatus.AgentAssigned);
            Assert.Equal(2, (int)PolicyRequestStatus.FormSent);
            Assert.Equal(3, (int)PolicyRequestStatus.FormSubmitted);
            Assert.Equal(4, (int)PolicyRequestStatus.RiskCalculated);
            Assert.Equal(5, (int)PolicyRequestStatus.CustomerConfirmed);
            Assert.Equal(6, (int)PolicyRequestStatus.PolicyApproved);
        }
    }
}
