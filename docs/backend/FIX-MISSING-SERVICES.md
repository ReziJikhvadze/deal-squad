# Quick Fix: Missing ICurrentUserService Registration

## Error
```
InvalidOperationException: Unable to resolve service for type 'GroupBuy.Application.Interfaces.ICurrentUserService' while attempting to activate 'GetMyParticipationsQueryHandler'.
```

## Root Cause
The `ICurrentUserService` implementation wasn't registered in the DI container.

---

## Solution: Create DependencyInjection.cs in Infrastructure

### Step 1: Create CurrentUserService Implementation

File: `src/GroupBuy.Infrastructure/Services/CurrentUserService.cs`

```csharp
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GroupBuy.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? _httpContextAccessor.HttpContext?.User
                .FindFirst("sub")?.Value;

            return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) 
                ? userId 
                : null;
        }
    }

    public string? Email =>
        _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.Email)?.Value
        ?? _httpContextAccessor.HttpContext?.User
            .FindFirst("email")?.Value;

    public AppRole? Role
    {
        get
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.Role)?.Value;

            return roleClaim != null && Enum.TryParse<AppRole>(roleClaim, out var role)
                ? role
                : null;
        }
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public bool IsAdmin => Role == AppRole.Admin;
}
```

### Step 2: Create DependencyInjection.cs

File: `src/GroupBuy.Infrastructure/DependencyInjection.cs`

```csharp
using GroupBuy.Application.Interfaces;
using GroupBuy.Infrastructure.Data;
using GroupBuy.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using GroupBuy.Domain.Entities;

namespace GroupBuy.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // HttpContextAccessor (required for CurrentUserService)
        services.AddHttpContextAccessor();

        // Services
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<ICampaignStatusService, CampaignStatusService>();

        // Unit of Work & Repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Password Hasher
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        return services;
    }
}
```

### Step 3: Update Program.cs

File: `src/GroupBuy.API/Program.cs`

Add the using statement at the top:
```csharp
using GroupBuy.Infrastructure;
```

Replace this:
```csharp
// Infrastructure layer - Add all service registrations here
// (repositories, payment providers, email service, etc.)
```

With this:
```csharp
// Infrastructure layer
builder.Services.AddInfrastructure();
```

---

## Complete Program.cs Reference

```csharp
using GroupBuy.Application;
using GroupBuy.Infrastructure;
using GroupBuy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Hangfire;
using Hangfire.PostgreSql;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<GroupBuyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application layer
builder.Services.AddApplication();

// Infrastructure layer
builder.Services.AddInfrastructure();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

// Hangfire for background jobs
builder.Services.AddHangfire(config => config.UsePostgreSqlStorage(
    builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:5173", "https://your-react-app.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseHangfireDashboard();

app.Run();
```

---

## What This Fixes

✅ **ICurrentUserService** - Extracts current user from JWT claims  
✅ **ITokenService** - JWT generation and password reset tokens  
✅ **IEmailService** - Sends emails via SMTP  
✅ **INotificationService** - Creates in-app notifications  
✅ **IPaymentService** - Handles payment processing  
✅ **ICampaignStatusService** - Updates campaign statuses  
✅ **IUnitOfWork** - Database transaction management  
✅ **IPasswordHasher** - Secure password hashing  

---

## Verify It Works

After implementing these changes:

1. Build the project:
   ```bash
   dotnet build
   ```

2. Run the API:
   ```bash
   dotnet run --project src/GroupBuy.API
   ```

3. Open Swagger: `http://localhost:5000/swagger`

4. Test the `/api/auth/register` endpoint

---

## Common Issues

### Issue: "Cannot resolve IUnitOfWork"
**Fix:** Make sure you've implemented the `UnitOfWork` class in Infrastructure (see `docs/backend/07-INFRASTRUCTURE-LAYER-DATABASE.md`)

### Issue: "Cannot resolve IEmailService"
**Fix:** Make sure you've created `EmailService.cs` in `Infrastructure/Services` (see `docs/backend/09-INFRASTRUCTURE-SERVICES.md`)

### Issue: Still getting DI errors
**Fix:** Check that ALL services in the handlers are registered:
- ICurrentUserService ✅
- IUnitOfWork ✅
- ITokenService ✅
- IEmailService ✅
- INotificationService ✅
- IPaymentService ✅
- IPasswordHasher<User> ✅

---

## Next Steps

Once this is fixed, you may encounter similar errors for:
- ❌ `INotificationService`
- ❌ `IPaymentService`
- ❌ `ICampaignStatusService`

All of these are already included in the `AddInfrastructure()` method above, so they'll be resolved automatically! 🎉
