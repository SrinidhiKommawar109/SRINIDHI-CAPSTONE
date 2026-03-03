using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class BaseEntityTests
    {
        [Fact]
        public void BaseEntity_IdAssignment_ShouldWork()
        {
            // Arrange
            var entity = new BaseEntity();
            var expectedId = 123;

            // Act
            entity.Id = expectedId;

            // Assert
            Assert.Equal(expectedId, entity.Id);
        }
    }
}
