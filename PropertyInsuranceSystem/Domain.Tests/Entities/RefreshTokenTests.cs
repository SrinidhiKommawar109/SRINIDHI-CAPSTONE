using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class RefreshTokenTests
    {
        [Fact]
        public void RefreshToken_ShouldInitializeWithRevokedFalse()
        {
            // Arrange & Act
            var token = new RefreshToken();

            // Assert
            Assert.False(token.IsRevoked);
        }

        [Fact]
        public void RefreshToken_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var token = new RefreshToken();
            var tokenValue = "some-long-token-string";
            var expires = DateTime.UtcNow.AddDays(7);

            // Act
            token.Token = tokenValue;
            token.Expires = expires;

            // Assert
            Assert.Equal(tokenValue, token.Token);
            Assert.Equal(expires, token.Expires);
        }
    }
}
