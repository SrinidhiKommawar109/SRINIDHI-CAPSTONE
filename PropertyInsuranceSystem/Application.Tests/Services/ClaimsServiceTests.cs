using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;
using FluentAssertions;
using ClaimEntity = Domain.Entities.Claim;

namespace Application.Tests.Services
{
    public class ClaimsServiceTests
    {
        private readonly Mock<IRepository<ClaimEntity>> _claimRepo = new();
        private readonly Mock<IRepository<Invoice>> _invoiceRepo = new();
        private readonly Mock<IRepository<Notification>> _notificationRepo = new();
        private readonly Mock<IClaimRepository> _claimReadRepo = new();
        private readonly Mock<IPolicyRequestRepository> _policyRepo = new();
        private readonly Mock<IInvoiceService> _invoiceService = new();
        private readonly ClaimsService _service;

        public ClaimsServiceTests()
        {
            _service = new ClaimsService(
                _claimRepo.Object,
                _invoiceRepo.Object,
                _notificationRepo.Object,
                _claimReadRepo.Object,
                _policyRepo.Object,
                _invoiceService.Object);
        }

        [Fact]
        public async Task FileClaim_ShouldPass_WhenAmountIsLessThan50PercentOfCoverage()
        {
            // Arrange
            var policy = new PolicyRequest
            {
                Id = 1,
                Status = PolicyRequestStatus.PolicyApproved,
                PropertyValue = 1000000m,
                Plan = new PropertyPlans { CoverageRate = 0.8m } // 800,000 coverage
            };
            _claimReadRepo.Setup(r => r.GetPolicyRequestByIdAsync(1)).ReturnsAsync(policy);
            _claimReadRepo.Setup(r => r.GetOfficersWithApprovedClaimsCountAsync()).ReturnsAsync(new List<ClaimsOfficerAssignmentDto>());
            _claimReadRepo.Setup(r => r.GetClaimsOfficersAsync()).ReturnsAsync(new List<ApplicationUser>());

            var dto = new CreateClaimDto
            {
                PolicyRequestId = 1,
                ClaimAmount = 20000m // Only 2.5% of coverage
            };

            // Act
            await _service.FileClaimAsync(dto, 1);

            // Assert
            _claimRepo.Verify(r => r.AddAsync(It.IsAny<ClaimEntity>()), Times.Once);
        }

        [Fact]
        public async Task FileClaim_ShouldPass_WhenAmountIsExactly50PercentOfCoverage()
        {
            // Arrange
            var policy = new PolicyRequest
            {
                Id = 1,
                Status = PolicyRequestStatus.PolicyApproved,
                PropertyValue = 1000000m,
                Plan = new PropertyPlans { CoverageRate = 0.8m } // 800,000 coverage
            };
            _claimReadRepo.Setup(r => r.GetPolicyRequestByIdAsync(1)).ReturnsAsync(policy);
            _claimReadRepo.Setup(r => r.GetOfficersWithApprovedClaimsCountAsync()).ReturnsAsync(new List<ClaimsOfficerAssignmentDto>());
            _claimReadRepo.Setup(r => r.GetClaimsOfficersAsync()).ReturnsAsync(new List<ApplicationUser>());

            var dto = new CreateClaimDto
            {
                PolicyRequestId = 1,
                ClaimAmount = 400000m // Exactly 50%
            };

            // Act
            await _service.FileClaimAsync(dto, 1);

            // Assert
            _claimRepo.Verify(r => r.AddAsync(It.IsAny<ClaimEntity>()), Times.Once);
        }

        [Fact]
        public async Task FileClaim_ShouldFail_WhenAmountExceedsCoverage()
        {
            // Arrange
            var policy = new PolicyRequest
            {
                Id = 1,
                Status = PolicyRequestStatus.PolicyApproved,
                PropertyValue = 1000000m,
                Plan = new PropertyPlans { CoverageRate = 0.8m } // 800,000 coverage
            };
            _claimReadRepo.Setup(r => r.GetPolicyRequestByIdAsync(1)).ReturnsAsync(policy);

            var dto = new CreateClaimDto
            {
                PolicyRequestId = 1,
                ClaimAmount = 900000m // Exceeds coverage
            };

            // Act
            var act = () => _service.FileClaimAsync(dto, 1);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*exceeds the maximum coverage*");
        }
    }
}
