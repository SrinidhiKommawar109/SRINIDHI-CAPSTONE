using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class PropertyCategoryTests
    {
        [Fact]
        public void PropertyCategory_NameAssignment_ShouldWork()
        {
            // Arrange
            var category = new PropertyCategory();
            var name = "Home Insurance";

            // Act
            category.Name = name;

            // Assert
            Assert.Equal(name, category.Name);
        }

        [Fact]
        public void PropertyCategory_SubCategories_ShouldBeAssignable()
        {
            // Arrange
            var category = new PropertyCategory();
            var subCategories = new List<PropertySubCategory> { new PropertySubCategory { Name = "Condo" } };

            // Act
            category.SubCategories = subCategories;

            // Assert
            Assert.Equal(subCategories, category.SubCategories);
        }
    }
}
