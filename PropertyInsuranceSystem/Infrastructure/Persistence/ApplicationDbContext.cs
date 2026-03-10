using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ========================
    // DbSets
    // ========================
    public DbSet<ApplicationUser> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    public DbSet<PropertyCategory> PropertyCategories { get; set; }
    public DbSet<PropertySubCategory> PropertySubCategories { get; set; }
    public DbSet<PropertyPlans> PropertyPlans { get; set; }

    public DbSet<PolicyRequest> PolicyRequests { get; set; }

    public DbSet<Claim> Claims { get; set; }

    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Fix decimal precision warnings
        foreach (var property in modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetProperties()).Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        modelBuilder.Entity<Invoice>()
        .HasOne(i => i.Customer)
        .WithMany()
        .HasForeignKey(i => i.CustomerId)
        .OnDelete(DeleteBehavior.Restrict);
        // ========================
        // RELATIONSHIPS
        // ========================
        modelBuilder.Entity<RefreshToken>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId);

        modelBuilder.Entity<PropertyCategory>()
            .HasMany(c => c.SubCategories)
            .WithOne(s => s.Category)
            .HasForeignKey(s => s.CategoryId);

        modelBuilder.Entity<PropertySubCategory>()
            .HasMany(s => s.Plans)
            .WithOne(p => p.SubCategory)
            .HasForeignKey(p => p.SubCategoryId);

        modelBuilder.Entity<ApplicationUser>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // ========================
        // SEED DATA
        // ========================

        // ---- USERS ----
        modelBuilder.Entity<ApplicationUser>().HasData(
            new ApplicationUser
            {
                Id = 1,
                FullName = "Admin",
                Email = "admin@gmail.com",
                PasswordHash = "$2a$11$kkF9EKe7KJxAijZ374He4edBGTSujLGRA48MkMwN9g6PK77IM2H..", // Admin@123
                Role = UserRole.Admin,
                ReferralCode = "REF-1-ADMIN",
                IsActive = true
            }
        );

        // ---- PROPERTY CATEGORY ----
        modelBuilder.Entity<PropertyCategory>().HasData(
            new PropertyCategory { Id = 1, Name = "Property Insurance" }
            
        );

        // ---- SUBCATEGORIES ----
        modelBuilder.Entity<PropertySubCategory>().HasData(
            new PropertySubCategory { Id = 1, Code = "SUB_RES_01", Name = "Residential Property", CategoryId = 1 },
            new PropertySubCategory { Id = 2, Code = "SUB_COM_02", Name = "Commercial Property", CategoryId = 1 },
            new PropertySubCategory { Id = 3, Code = "SUB_IND_03", Name = "Industrial & Special Use", CategoryId = 1 },
            new PropertySubCategory { Id = 4, Code = "SUB_CON_04", Name = "Property Contents", CategoryId = 1 }
        );

        // ---- PLANS ----
        modelBuilder.Entity<PropertyPlans>().HasData(
            new PropertyPlans { Id = 1, PlanName = "Standard Home Protection", BaseCoverageAmount = 250000, CoverageRate = 0.005m, BasePremium = 1250, AgentCommission = 125, Frequency = PremiumFrequency.Yearly, SubCategoryId = 1 },
            new PropertyPlans { Id = 2, PlanName = "Smart Business Protect", BaseCoverageAmount = 1000000, CoverageRate = 0.008m, BasePremium = 8000, AgentCommission = 600, Frequency = PremiumFrequency.Quarterly, SubCategoryId = 2 },
            new PropertyPlans { Id = 3, PlanName = "Plant Safety Plan", BaseCoverageAmount = 5000000, CoverageRate = 0.012m, BasePremium = 60000, AgentCommission = 4500, Frequency = PremiumFrequency.HalfYearly, SubCategoryId = 3 },
            new PropertyPlans { Id = 4, PlanName = "Luxury Plan – Signature Property Guard", BaseCoverageAmount = 750000, CoverageRate = 0.006m, BasePremium = 4500, AgentCommission = 400, Frequency = PremiumFrequency.Yearly, SubCategoryId = 1 }
        );
    }
}
