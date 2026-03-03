using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace Domain.Tests.Entities
{
    public class PropertyPlansTests
    {
        [Fact]
        public void PropertyPlans_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var plan = new PropertyPlans();
            var planName = "Gold Shield";
            var basePremium = 1000m;

            // Act
            plan.PlanName = planName;
            plan.BasePremium = basePremium;

            // Assert
            Assert.Equal(planName, plan.PlanName);
            Assert.Equal(basePremium, plan.BasePremium);
        }
    }
}
