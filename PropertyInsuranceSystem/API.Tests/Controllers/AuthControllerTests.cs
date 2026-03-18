using API.Controllers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace API.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockEmailService = new Mock<IEmailService>();
            _controller = new AuthController(_mockAuthService.Object, _mockEmailService.Object);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var request = new LoginRequestDto { Email = "test@test.com", Password = "password" };
            var response = new AuthResponseDto { Token = "dummy-token" };
            _mockAuthService.Setup(s => s.LoginAsync(request)).ReturnsAsync(response);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(response, okResult.Value);
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var request = new RegisterRequestDto { Email = "test@test.com", FullName = "Name", Password = "password", Role = "Customer" };
            var response = new AuthResponseDto { Token = "dummy-token" };
            _mockAuthService.Setup(s => s.RegisterAsync(request)).ReturnsAsync(response);

            // Act
            var result = await _controller.Register(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(response, okResult.Value);
        }
    }
}
