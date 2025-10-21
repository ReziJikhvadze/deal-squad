# GroupBuy Backend - .NET 8 Project Structure

## Solution Structure

```
GroupBuy.sln
│
├── src/
│   ├── GroupBuy.Domain/              # Core domain entities and enums
│   ├── GroupBuy.Application/         # Business logic, CQRS, interfaces
│   ├── GroupBuy.Infrastructure/      # EF Core, external services
│   └── GroupBuy.API/                 # Web API, controllers, middleware
│
├── tests/
│   ├── GroupBuy.Domain.Tests/
│   ├── GroupBuy.Application.Tests/
│   └── GroupBuy.API.Tests/
│
└── docs/
    └── backend/                      # This documentation
```

## Creating the Solution

### 1. Create Solution
```bash
dotnet new sln -n GroupBuy
```

### 2. Create Projects

```bash
# Domain Layer (Class Library)
dotnet new classlib -n GroupBuy.Domain -o src/GroupBuy.Domain
dotnet sln add src/GroupBuy.Domain/GroupBuy.Domain.csproj

# Application Layer (Class Library)
dotnet new classlib -n GroupBuy.Application -o src/GroupBuy.Application
dotnet sln add src/GroupBuy.Application/GroupBuy.Application.csproj

# Infrastructure Layer (Class Library)
dotnet new classlib -n GroupBuy.Infrastructure -o src/GroupBuy.Infrastructure
dotnet sln add src/GroupBuy.Infrastructure/GroupBuy.Infrastructure.csproj

# API Layer (Web API)
dotnet new webapi -n GroupBuy.API -o src/GroupBuy.API
dotnet sln add src/GroupBuy.API/GroupBuy.API.csproj
```

### 3. Add Project References

```bash
# Application depends on Domain
cd src/GroupBuy.Application
dotnet add reference ../GroupBuy.Domain/GroupBuy.Domain.csproj

# Infrastructure depends on Application and Domain
cd ../GroupBuy.Infrastructure
dotnet add reference ../GroupBuy.Domain/GroupBuy.Domain.csproj
dotnet add reference ../GroupBuy.Application/GroupBuy.Application.csproj

# API depends on all layers
cd ../GroupBuy.API
dotnet add reference ../GroupBuy.Domain/GroupBuy.Domain.csproj
dotnet add reference ../GroupBuy.Application/GroupBuy.Application.csproj
dotnet add reference ../GroupBuy.Infrastructure/GroupBuy.Infrastructure.csproj
```

## Required NuGet Packages

### GroupBuy.Domain
```bash
# No external dependencies - pure domain logic
```

### GroupBuy.Application
```bash
cd src/GroupBuy.Application
dotnet add package MediatR
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package AutoMapper
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package Microsoft.Extensions.Configuration.Abstractions
```

### GroupBuy.Infrastructure
```bash
cd ../GroupBuy.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.Identity.Web
dotnet add package PayPalCheckoutSdk
dotnet add package Hangfire
dotnet add package Hangfire.PostgreSql
dotnet add package Hangfire.AspNetCore
dotnet add package MailKit
dotnet add package MimeKit
```

### GroupBuy.API
```bash
cd ../GroupBuy.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.Identity.Web
dotnet add package Swashbuckle.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Hangfire.AspNetCore
```

## Project Descriptions

### GroupBuy.Domain
- **Purpose**: Core business entities and domain logic
- **Contains**:
  - Entities (User, Campaign, Payment, etc.)
  - Enums (CampaignStatus, PaymentType, UserRole, etc.)
  - Domain exceptions
  - Value objects
- **Dependencies**: None (pure .NET)

### GroupBuy.Application
- **Purpose**: Business logic and use cases
- **Contains**:
  - CQRS commands and queries (using MediatR)
  - DTOs and ViewModels
  - Interfaces for repositories and services
  - Validators (using FluentValidation)
  - AutoMapper profiles
- **Dependencies**: Domain layer only

### GroupBuy.Infrastructure
- **Purpose**: External concerns and data access
- **Contains**:
  - Entity Framework Core DbContext
  - Repository implementations
  - PayPal integration
  - Email service implementation
  - Azure AD B2C configuration
  - Hangfire background jobs
  - Payment provider implementations
- **Dependencies**: Application and Domain layers

### GroupBuy.API
- **Purpose**: REST API endpoints
- **Contains**:
  - Controllers
  - Middleware (error handling, auth)
  - API configuration
  - Swagger/OpenAPI setup
  - Program.cs and Startup configuration
- **Dependencies**: All layers

## Next Steps

1. Install all NuGet packages as shown above
2. Review the architecture overview in the next document
3. Start implementing Domain entities
4. Set up Entity Framework Core and migrations
5. Implement Application layer (CQRS)
6. Configure Infrastructure services
7. Build API controllers

## Architecture Principles

✅ **Separation of Concerns**: Each layer has a specific responsibility  
✅ **Dependency Inversion**: Core layers don't depend on infrastructure  
✅ **SOLID Principles**: Applied throughout the codebase  
✅ **CQRS Pattern**: Commands and queries separated  
✅ **Repository Pattern**: Data access abstraction  
✅ **Generic Payment Providers**: Easy to add PayPal, Visa/MasterCard, etc.  
✅ **Background Jobs**: Campaign status checks and notifications  
✅ **Azure AD B2C**: Enterprise-grade authentication  
