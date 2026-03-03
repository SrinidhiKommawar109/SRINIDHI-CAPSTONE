using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class PropertySubCategoryTests
    {
        [Fact]
        public void PropertySubCategory_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var subCategory = new PropertySubCategory();
            var code = "SC01";
            var name = "Residential";

            // Act
            subCategory.Code = code;
            subCategory.Name = name;

            // Assert
            Assert.Equal(code, subCategory.Code);
            Assert.Equal(name, subCategory.Name);
        }
    }
}
