using Domain.Entities;
using Xunit;

namespace Domain.Tests.Entities
{
    public class InvoiceTests
    {
        [Fact]
        public void Invoice_PropertyAssignment_ShouldWork()
        {
            // Arrange
            var invoice = new Invoice();
            var totalPremium = 500.00m;
            var invoiceNumber = "INV-2024-001";

            // Act
            invoice.TotalPremium = totalPremium;
            invoice.InvoiceNumber = invoiceNumber;

            // Assert
            Assert.Equal(totalPremium, invoice.TotalPremium);
            Assert.Equal(invoiceNumber, invoice.InvoiceNumber);
        }

        [Fact]
        public void Invoice_InstallmentCalculation_ShouldBeVerifiable()
        {
            // Arrange
            var invoice = new Invoice();
            var totalPremium = 1200m;
            var installmentCount = 12;

            // Act
            invoice.TotalPremium = totalPremium;
            invoice.InstallmentCount = installmentCount;
            invoice.InstallmentAmount = totalPremium / installmentCount;

            // Assert
            Assert.Equal(100m, invoice.InstallmentAmount);
        }
    }
}
