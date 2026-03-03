using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace Domain.Tests.Entities
{
    public class ApplicationUserTests
    {
        [Fact]
        public void ApplicationUser_ShouldInitializeWithDefaultValues()
        {
            // Arrange & Act
            var user = new ApplicationUser();

            // Assert
            Assert.True(user.IsActive);
            Assert.Equal(string.Empty, user.ReferralCode);
            Assert.Equal(0, user.ReferralBalance);
            Assert.Equal(0, user.ReferralsCount);
        }

        [Fact]
        public void ApplicationUser_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var user = new ApplicationUser();
            var fullName = "John Doe";
            var email = "john@example.com";
            var role = UserRole.Customer;

            // Act
            user.FullName = fullName;
            user.Email = email;
            user.Role = role;

            // Assert
            Assert.Equal(fullName, user.FullName);
            Assert.Equal(email, user.Email);
            Assert.Equal(role, user.Role);
        }
    }
}
