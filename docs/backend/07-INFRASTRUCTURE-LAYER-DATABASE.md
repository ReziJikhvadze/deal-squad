# GroupBuy Backend - Infrastructure Layer (Database)

## Overview
Entity Framework Core setup with PostgreSQL.

---

## File: `src/GroupBuy.Infrastructure/Data/GroupBuyDbContext.cs`

```csharp
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GroupBuy.Infrastructure.Data;

public class GroupBuyDbContext : DbContext
{
    public GroupBuyDbContext(DbContextOptions<GroupBuyDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Campaign> Campaigns { get; set; } = null!;
    public DbSet<CampaignParticipant> CampaignParticipants { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.ProfileImage).HasMaxLength(500);
            entity.Property(e => e.Role).HasConversion<string>();
            entity.Property(e => e.OAuthProvider).HasConversion<string>();
            entity.Property(e => e.OAuthId).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        // Campaign configuration
        modelBuilder.Entity<Campaign>(entity =>
        {
            entity.ToTable("campaigns");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Category).HasConversion<string>();
            entity.Property(e => e.StoreName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.StorePrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.FinalPrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.DepositAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.StartDate).HasDefaultValueSql("NOW()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Creator)
                .WithMany(u => u.CreatedCampaigns)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.EndDate);
        });

        // CampaignParticipant configuration
        modelBuilder.Entity<CampaignParticipant>(entity =>
        {
            entity.ToTable("campaign_participants");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DepositAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.FinalPaymentAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.RefundAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.DepositPaymentId).HasMaxLength(255);
            entity.Property(e => e.FinalPaymentId).HasMaxLength(255);
            entity.Property(e => e.RefundId).HasMaxLength(255);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Campaign)
                .WithMany(c => c.Participants)
                .HasForeignKey(e => e.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Participations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.CampaignId, e.UserId }).IsUnique();
        });

        // Payment configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.ToTable("payments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.PaymentProvider).HasConversion<string>();
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.TransactionId).HasMaxLength(255).IsRequired();
            entity.Property(e => e.GatewayResponse).HasColumnType("jsonb");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Campaign)
                .WithMany(c => c.Payments)
                .HasForeignKey(e => e.CampaignId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.TransactionId).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CampaignId);
        });

        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Message).HasColumnType("text").IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Campaign)
                .WithMany()
                .HasForeignKey(e => e.CampaignId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.UserId, e.Read });
        });

        // PasswordResetToken configuration
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("password_reset_tokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).HasMaxLength(255).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Token).IsUnique();
        });
    }
}
```

---

## File: `src/GroupBuy.Infrastructure/Data/Repository.cs`

```csharp
using GroupBuy.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GroupBuy.Infrastructure.Data;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly GroupBuyDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(GroupBuyDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public virtual Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public virtual Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default)
    {
        if (predicate == null)
        {
            return await _dbSet.CountAsync(cancellationToken);
        }
        return await _dbSet.CountAsync(predicate, cancellationToken);
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(predicate, cancellationToken);
    }
}
```

---

## File: `src/GroupBuy.Infrastructure/Data/UnitOfWork.cs`

```csharp
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace GroupBuy.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly GroupBuyDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(GroupBuyDbContext context)
    {
        _context = context;
        Users = new Repository<User>(context);
        Campaigns = new Repository<Campaign>(context);
        CampaignParticipants = new Repository<CampaignParticipant>(context);
        Payments = new Repository<Payment>(context);
        Notifications = new Repository<Notification>(context);
        PasswordResetTokens = new Repository<PasswordResetToken>(context);
    }

    public IRepository<User> Users { get; }
    public IRepository<Campaign> Campaigns { get; }
    public IRepository<CampaignParticipant> CampaignParticipants { get; }
    public IRepository<Payment> Payments { get; }
    public IRepository<Notification> Notifications { get; }
    public IRepository<PasswordResetToken> PasswordResetTokens { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
```

---

## File: `src/GroupBuy.Infrastructure/Data/DbInitializer.cs`

```csharp
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GroupBuy.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(GroupBuyDbContext context, IPasswordHasher<User> passwordHasher)
    {
        // Apply migrations
        await context.Database.MigrateAsync();

        // Seed admin user if not exists
        if (!await context.Users.AnyAsync(u => u.Role == AppRole.Admin))
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@groupbuy.com",
                FullName = "System Administrator",
                Role = AppRole.Admin,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin@123!");

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
```

---

## Creating Migrations

### Initial Migration
```bash
cd src/GroupBuy.Infrastructure
dotnet ef migrations add InitialCreate --startup-project ../GroupBuy.API --output-dir Data/Migrations
```

### Apply Migration
```bash
dotnet ef database update --startup-project ../GroupBuy.API
```

---

## Connection String Format (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=groupbuy_db;Username=postgres;Password=your_password"
  }
}
```

For production (Azure/AWS):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-server.postgres.database.azure.com;Port=5432;Database=groupbuy_prod;Username=admin@your-server;Password=your_secure_password;Ssl Mode=Require;"
  }
}
```

---

## Summary

Database infrastructure complete:
- ✅ DbContext with all entities configured
- ✅ Repository pattern implementation
- ✅ Unit of Work pattern with transactions
- ✅ Database seeding (admin user)
- ✅ Proper indexes for performance
- ✅ Enum to string conversions
- ✅ PostgreSQL-specific configurations

**Next**: Payment providers (PayPal and Visa/MasterCard preparation).
