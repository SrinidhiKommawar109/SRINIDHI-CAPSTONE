using Domain.Enums;
using Xunit;

namespace Domain.Tests.Enums
{
    public class UserRoleTests
    {
        [Fact]
        public void UserRole_ShouldHaveExpectedValues()
        {
            // Assert
            Assert.Equal(1, (int)UserRole.Admin);
            Assert.Equal(2, (int)UserRole.Agent);
            Assert.Equal(3, (int)UserRole.Customer);
            Assert.Equal(4, (int)UserRole.ClaimsOfficer);
        }
    }
}
