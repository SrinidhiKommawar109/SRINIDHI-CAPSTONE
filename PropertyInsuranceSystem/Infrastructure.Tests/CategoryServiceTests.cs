using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Infrastructure.Tests.Services
{
    public class CategoryServiceTests
    {
        private ApplicationDbContext GetContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ShouldReturnCategoriesWithSubCategories()
        {
            // Arrange
            var context = GetContext();
            var category = new PropertyCategory { Id = 1, Name = "Cat1" };
            var subCategory = new PropertySubCategory { Id = 1, CategoryId = 1, Name = "Sub1", Code = "S1" };
            context.PropertyCategories.Add(category);
            context.PropertySubCategories.Add(subCategory);
            await context.SaveChangesAsync();

            var service = new CategoryService(context);

            // Act
            var result = await service.GetAllCategoriesAsync();

            // Assert
            Assert.Single(result);
            Assert.Equal("Cat1", result[0].Name);
            Assert.Single(result[0].SubCategories);
            Assert.Equal("Sub1", result[0].SubCategories[0].Name);
        }

        [Fact]
        public async Task AddSubCategoryAsync_ShouldAddSubCategoryToDatabase()
        {
            // Arrange
            var context = GetContext();
            var service = new CategoryService(context);
            var dto = new CreateSubCategoryDto
            {
                CategoryId = 1,
                Code = "NEW-CODE",
                Name = "New Sub"
            };

            // Act
            await service.AddSubCategoryAsync(dto);

            // Assert
            var subCategory = await context.PropertySubCategories.FirstOrDefaultAsync(s => s.Code == "NEW-CODE");
            Assert.NotNull(subCategory);
            Assert.Equal("New Sub", subCategory.Name);
        }

        [Fact]
        public async Task AddPlanAsync_ShouldAddPlanToDatabase()
        {
            // Arrange
            var context = GetContext();
            var service = new CategoryService(context);
            var dto = new CreatePlanDto
            {
                SubCategoryId = 1,
                PlanName = "New Plan",
                BasePremium = 500,
                Frequency = 1 // Quarterly
            };

            // Act
            await service.AddPlanAsync(dto);

            // Assert
            var plan = await context.PropertyPlans.FirstOrDefaultAsync(p => p.PlanName == "New Plan");
            Assert.NotNull(plan);
            Assert.Equal(500, plan.BasePremium);
        }
    }
}
