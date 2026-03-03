using Domain.Enums;
using Xunit;

namespace Domain.Tests.Enums
{
    public class PremiumFrequencyTests
    {
        [Fact]
        public void PremiumFrequency_ShouldHaveExpectedValues()
        {
            // Assert
            Assert.Equal(1, (int)PremiumFrequency.Quarterly);
            Assert.Equal(2, (int)PremiumFrequency.HalfYearly);
            Assert.Equal(3, (int)PremiumFrequency.Yearly);
        }
    }
}
