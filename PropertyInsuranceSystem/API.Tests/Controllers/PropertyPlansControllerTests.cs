using API.Controllers;
using Application.DTOs;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace API.Tests.Controllers
{
    public class PropertyPlansControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly PropertyPlansController _controller;

        public PropertyPlansControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _controller = new PropertyPlansController(_context);
        }

        [Fact]
        public async Task GetAllPlans_ReturnsAllPlans()
        {
            // Arrange
            _context.PropertyPlans.Add(new PropertyPlans { Id = 1, PlanName = "Plan 1" });
            _context.PropertyPlans.Add(new PropertyPlans { Id = 2, PlanName = "Plan 2" });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAllPlans();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var plans = Assert.IsType<List<PropertyPlans>>(okResult.Value);
            Assert.Equal(2, plans.Count);
        }

        [Fact]
        public async Task CreatePlan_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            _context.PropertySubCategories.Add(new PropertySubCategory { Id = 1, Name = "Sub1", Code = "S1" });
            await _context.SaveChangesAsync();

            var dto = new CreatePropertyPlanDto 
            { 
                PlanName = "New Plan", 
                SubCategoryId = 1,
                BaseCoverageAmount = 100000,
                CoverageRate = 0.01m,
                BasePremium = 1000,
                AgentCommission = 100,
                Frequency = 0
            };

            // Act
            var result = await _controller.CreatePlan(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            Assert.True(await _context.PropertyPlans.AnyAsync(p => p.PlanName == "New Plan"));
        }
    }
}
