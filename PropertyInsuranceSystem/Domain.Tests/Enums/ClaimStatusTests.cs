using Domain.Enums;
using Xunit;

namespace Domain.Tests.Enums
{
    public class ClaimStatusTests
    {
        [Fact]
        public void ClaimStatus_ShouldHaveExpectedValues()
        {
            // Assert
            Assert.Equal(0, (int)ClaimStatus.Pending);
            Assert.Equal(1, (int)ClaimStatus.Verified);
            Assert.Equal(2, (int)ClaimStatus.Approved);
            Assert.Equal(3, (int)ClaimStatus.Rejected);
        }
    }
}
