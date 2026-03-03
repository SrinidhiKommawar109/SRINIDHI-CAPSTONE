using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class NotificationTests
    {
        [Fact]
        public void Notification_ShouldInitializeAsUnread()
        {
            // Arrange & Act
            var notification = new Notification();

            // Assert
            Assert.False(notification.IsRead);
        }

        [Fact]
        public void Notification_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var notification = new Notification();
            var message = "Your policy has been approved.";
            var type = "success";

            // Act
            notification.Message = message;
            notification.Type = type;

            // Assert
            Assert.Equal(message, notification.Message);
            Assert.Equal(type, notification.Type);
        }
    }
}
