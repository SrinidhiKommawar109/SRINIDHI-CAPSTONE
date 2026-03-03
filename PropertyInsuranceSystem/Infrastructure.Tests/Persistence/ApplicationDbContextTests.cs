using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Domain.Entities;

namespace Infrastructure.Tests.Persistence
{
    public class ApplicationDbContextTests
    {
        [Fact]
        public async Task ApplicationDbContext_ShouldBeAbleToAddAndRetrieveUsers()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            using var context = new ApplicationDbContext(options);

            var user = new ApplicationUser { FullName = "Test", Email = "test@test.com", PasswordHash = "hash" };

            // Act
            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Assert
            var retrievedUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "test@test.com");
            Assert.NotNull(retrievedUser);
            Assert.Equal("Test", retrievedUser.FullName);
        }
    }
}
