# GroupBuy Backend - Application Layer Validators

## Overview
Using FluentValidation for request validation.

---

## File: `src/GroupBuy.Application/Validators/RegisterCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Auth.Commands;

namespace GroupBuy.Application.Validators;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email must be less than 255 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
            .Matches(@"[\W_]").WithMessage("Password must contain at least one special character");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MaximumLength(255).WithMessage("Full name must be less than 255 characters");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format (use E.164 format)")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/LoginCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Auth.Commands;

namespace GroupBuy.Application.Validators;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/CreateCampaignCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Campaigns.Commands;

namespace GroupBuy.Application.Validators;

public class CreateCampaignCommandValidator : AbstractValidator<CreateCampaignCommand>
{
    public CreateCampaignCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(255).WithMessage("Title must be less than 255 characters");

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description must be less than 5000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid category");

        RuleFor(x => x.StoreName)
            .NotEmpty().WithMessage("Store name is required")
            .MaximumLength(255).WithMessage("Store name must be less than 255 characters");

        RuleFor(x => x.StorePrice)
            .GreaterThan(0).WithMessage("Store price must be greater than 0")
            .LessThan(1000000).WithMessage("Store price must be less than 1,000,000");

        RuleFor(x => x.DiscountPercentage)
            .GreaterThan(0).WithMessage("Discount percentage must be greater than 0")
            .LessThanOrEqualTo(90).WithMessage("Discount percentage must be 90% or less");

        RuleFor(x => x.TargetQuantity)
            .GreaterThan(0).WithMessage("Target quantity must be greater than 0")
            .LessThan(100000).WithMessage("Target quantity must be less than 100,000");

        RuleFor(x => x.DurationDays)
            .GreaterThan(0).WithMessage("Duration must be at least 1 day")
            .LessThanOrEqualTo(365).WithMessage("Duration must be 365 days or less");

        RuleFor(x => x.ImageUrl)
            .Must(BeAValidUrl).WithMessage("Invalid image URL")
            .When(x => !string.IsNullOrWhiteSpace(x.ImageUrl));
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/JoinCampaignCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Campaigns.Commands;

namespace GroupBuy.Application.Validators;

public class JoinCampaignCommandValidator : AbstractValidator<JoinCampaignCommand>
{
    public JoinCampaignCommandValidator()
    {
        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.PaymentProvider)
            .IsInEnum().WithMessage("Invalid payment provider");

        RuleFor(x => x.PaymentToken)
            .NotEmpty().WithMessage("Payment token is required")
            .MaximumLength(500).WithMessage("Payment token is too long");
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/GetCampaignsQueryValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Campaigns.Queries;

namespace GroupBuy.Application.Validators;

public class GetCampaignsQueryValidator : AbstractValidator<GetCampaignsQuery>
{
    public GetCampaignsQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Page size must be 100 or less");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(255).WithMessage("Search term must be less than 255 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.SearchTerm));
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/UpdateProfileCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Auth.Commands;

namespace GroupBuy.Application.Validators;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FullName)
            .MaximumLength(255).WithMessage("Full name must be less than 255 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.FullName));

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format (use E.164 format)")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/ForgotPasswordCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Auth.Commands;

namespace GroupBuy.Application.Validators;

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/ResetPasswordCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Auth.Commands;

namespace GroupBuy.Application.Validators;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Reset token is required");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
            .Matches(@"[\W_]").WithMessage("Password must contain at least one special character");
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/UpdateCampaignCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Campaigns.Commands;

namespace GroupBuy.Application.Validators;

public class UpdateCampaignCommandValidator : AbstractValidator<UpdateCampaignCommand>
{
    public UpdateCampaignCommandValidator()
    {
        RuleFor(x => x.CampaignId)
            .NotEmpty().WithMessage("Campaign ID is required");

        RuleFor(x => x.Title)
            .MaximumLength(255).WithMessage("Title must be less than 255 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Title));

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description must be less than 5000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.ImageUrl)
            .Must(BeAValidUrl).WithMessage("Invalid image URL")
            .When(x => !string.IsNullOrWhiteSpace(x.ImageUrl));
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
```

---

## File: `src/GroupBuy.Application/Validators/PayFinalCommandValidator.cs`

```csharp
using FluentValidation;
using GroupBuy.Application.Features.Participations.Commands;

namespace GroupBuy.Application.Validators;

public class PayFinalCommandValidator : AbstractValidator<PayFinalCommand>
{
    public PayFinalCommandValidator()
    {
        RuleFor(x => x.ParticipationId)
            .NotEmpty().WithMessage("Participation ID is required");

        RuleFor(x => x.PaymentProvider)
            .IsInEnum().WithMessage("Invalid payment provider");

        RuleFor(x => x.PaymentToken)
            .NotEmpty().WithMessage("Payment token is required")
            .MaximumLength(500).WithMessage("Payment token is too long");
    }
}
```

---

## File: `src/GroupBuy.Application/DependencyInjection.cs`

```csharp
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace GroupBuy.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        // Register AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // Register FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        return services;
    }
}
```

---

## File: `src/GroupBuy.Application/Mappings/MappingProfile.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Notifications;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Application.DTOs.Payments;
using GroupBuy.Domain.Entities;

namespace GroupBuy.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();

        // Campaign mappings
        CreateMap<Campaign, CampaignDto>()
            .ForMember(dest => dest.DaysLeft, opt => opt.MapFrom(src => (src.EndDate - DateTime.UtcNow).Days))
            .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src =>
                src.TargetQuantity > 0 ? (double)src.CurrentParticipants / src.TargetQuantity * 100 : 0));

        CreateMap<Campaign, CampaignDetailDto>()
            .IncludeBase<Campaign, CampaignDto>();

        // Participation mappings
        CreateMap<CampaignParticipant, ParticipationDto>()
            .ForMember(dest => dest.Campaign, opt => opt.MapFrom(src => new CampaignParticipationDto
            {
                Id = src.Campaign.Id,
                Title = src.Campaign.Title,
                ImageUrl = src.Campaign.ImageUrl,
                Status = src.Campaign.Status
            }));

        // Payment mappings
        CreateMap<Payment, PaymentDto>()
            .ForMember(dest => dest.Campaign, opt => opt.MapFrom(src => new CampaignSummaryDto
            {
                Id = src.Campaign.Id,
                Title = src.Campaign.Title,
                ImageUrl = src.Campaign.ImageUrl
            }));

        // Notification mappings
        CreateMap<Notification, NotificationDto>();
    }
}
```

---

## Summary

Validators and application setup complete:
- ✅ FluentValidation for all commands
- ✅ Email, password, URL validation
- ✅ Business rule validation (prices, quantities, dates)
- ✅ AutoMapper profiles for DTOs
- ✅ Dependency injection configuration

**Next**: Infrastructure layer with EF Core, PayPal, and services.
