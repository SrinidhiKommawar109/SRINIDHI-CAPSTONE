using API.Controllers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace API.Tests.Controllers
{
    public class CategoryControllerTests
    {
        private readonly Mock<ICategoryService> _mockCategoryService;
        private readonly CategoryController _controller;

        public CategoryControllerTests()
        {
            _mockCategoryService = new Mock<ICategoryService>();
            _controller = new CategoryController(_mockCategoryService.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOk_WithCategories()
        {
            // Arrange
            var categories = new List<CategoryResponseDto> { new CategoryResponseDto { Name = "Cat1" } };
            _mockCategoryService.Setup(s => s.GetAllCategoriesAsync()).ReturnsAsync(categories);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(categories, okResult.Value);
        }

        [Fact]
        public async Task AddSubCategory_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var dto = new CreateSubCategoryDto { Name = "Sub1" };
            _mockCategoryService.Setup(s => s.AddSubCategoryAsync(dto)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.AddSubCategory(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task AddPlan_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var dto = new CreatePlanDto { PlanName = "Plan1" };
            _mockCategoryService.Setup(s => s.AddPlanAsync(dto)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.AddPlan(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
