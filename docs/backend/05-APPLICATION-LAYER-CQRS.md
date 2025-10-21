# GroupBuy Backend - Application Layer CQRS Commands & Queries

## Overview
Using MediatR for CQRS pattern implementation.

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/RegisterCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class RegisterCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/RegisterCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace GroupBuy.Application.Features.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Check if user exists
        var existingUser = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email, cancellationToken);
        if (existingUser.Any())
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "User with this email already exists"
            };
        }

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Role = AppRole.User,
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send welcome email
        await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName, cancellationToken);

        // Generate JWT token
        var token = _tokenService.GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Registration successful",
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                ProfileImage = user.ProfileImage
            },
            Token = token
        };
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/LoginCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class LoginCommand : IRequest<AuthResponseDto>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/LoginCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace GroupBuy.Application.Features.Auth.Commands;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher,
        ITokenService tokenService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email, cancellationToken);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        var token = _tokenService.GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Success = true,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                ProfileImage = user.ProfileImage
            },
            Token = token
        };
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetCampaignsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetCampaignsQuery : IRequest<CampaignListResponseDto>
{
    public CampaignStatus? Status { get; set; }
    public CampaignCategory? Category { get; set; }
    public string? Search { get; set; }
    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 9;
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetCampaignsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetCampaignsQueryHandler : IRequestHandler<GetCampaignsQuery, CampaignListResponseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCampaignsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CampaignListResponseDto> Handle(GetCampaignsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Campaign> campaigns = await _unitOfWork.Campaigns.GetAllAsync(cancellationToken);

        // Apply filters
        if (request.Status.HasValue)
        {
            campaigns = campaigns.Where(c => c.Status == request.Status.Value);
        }

        if (request.Category.HasValue)
        {
            campaigns = campaigns.Where(c => c.Category == request.Category.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            campaigns = campaigns.Where(c =>
                c.Title.ToLower().Contains(searchLower) ||
                (c.Description != null && c.Description.ToLower().Contains(searchLower)));
        }

        // Apply sorting
        campaigns = request.Sort?.ToLower() switch
        {
            "ending-soon" => campaigns.OrderBy(c => c.EndDate),
            "price-low" => campaigns.OrderBy(c => c.FinalPrice),
            "price-high" => campaigns.OrderByDescending(c => c.FinalPrice),
            "popular" => campaigns.OrderByDescending(c => c.CurrentParticipants),
            "newest" => campaigns.OrderByDescending(c => c.CreatedAt),
            _ => campaigns.OrderBy(c => c.EndDate)
        };

        // Pagination
        var totalItems = campaigns.Count();
        var totalPages = (int)Math.Ceiling(totalItems / (double)request.Limit);
        var pagedCampaigns = campaigns
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .ToList();

        return new CampaignListResponseDto
        {
            Success = true,
            Data = _mapper.Map<List<CampaignDto>>(pagedCampaigns),
            Pagination = new PaginationDto
            {
                CurrentPage = request.Page,
                TotalPages = totalPages,
                TotalItems = totalItems,
                ItemsPerPage = request.Limit
            }
        };
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/JoinCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class JoinCampaignCommand : IRequest<ApiResponse<ParticipationDto>>
{
    public Guid CampaignId { get; set; }
    public Guid UserId { get; set; }
    public PaymentProvider PaymentProvider { get; set; }
    public string PaymentToken { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/JoinCampaignCommandHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;
using GroupBuy.Domain.Exceptions;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class JoinCampaignCommandHandler : IRequestHandler<JoinCampaignCommand, ApiResponse<ParticipationDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;

    public JoinCampaignCommandHandler(
        IUnitOfWork unitOfWork,
        IPaymentService paymentService,
        IEmailService emailService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _paymentService = paymentService;
        _emailService = emailService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ParticipationDto>> Handle(JoinCampaignCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            // Get campaign
            var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
            if (campaign == null)
            {
                return ApiResponse<ParticipationDto>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
            }

            // Validate campaign status
            if (campaign.Status != CampaignStatus.Active)
            {
                return ApiResponse<ParticipationDto>.FailureResult("CAMPAIGN_NOT_ACTIVE", "Campaign is not active");
            }

            // Check if campaign is full
            if (campaign.CurrentParticipants >= campaign.TargetQuantity)
            {
                throw new CampaignFullException();
            }

            // Check if user already joined
            var existingParticipation = await _unitOfWork.CampaignParticipants.FindAsync(
                cp => cp.CampaignId == request.CampaignId && cp.UserId == request.UserId,
                cancellationToken);

            if (existingParticipation.Any())
            {
                throw new AlreadyJoinedException();
            }

            // Process payment
            var paymentResult = await _paymentService.ProcessDepositAsync(
                request.UserId,
                request.CampaignId,
                campaign.DepositAmount,
                request.PaymentToken,
                request.PaymentProvider,
                cancellationToken);

            if (!paymentResult.Success)
            {
                return ApiResponse<ParticipationDto>.FailureResult("PAYMENT_FAILED", paymentResult.ErrorMessage ?? "Payment failed");
            }

            // Create participation
            var participation = new CampaignParticipant
            {
                Id = Guid.NewGuid(),
                CampaignId = request.CampaignId,
                UserId = request.UserId,
                DepositPaid = true,
                DepositAmount = campaign.DepositAmount,
                DepositPaymentId = paymentResult.TransactionId,
                DepositPaidAt = DateTime.UtcNow,
                FinalPaymentAmount = campaign.FinalPrice - campaign.DepositAmount,
                JoinedAt = DateTime.UtcNow,
                Status = ParticipantStatus.Active
            };

            await _unitOfWork.CampaignParticipants.AddAsync(participation, cancellationToken);

            // Update campaign participant count
            campaign.CurrentParticipants++;
            await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Send confirmation email
            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
            if (user != null)
            {
                await _emailService.SendDepositConfirmationAsync(user.Email, campaign.Title, campaign.DepositAmount, cancellationToken);
            }

            var participationDto = _mapper.Map<ParticipationDto>(participation);
            return ApiResponse<ParticipationDto>.SuccessResult(participationDto, "Successfully joined campaign");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);

            if (ex is DomainException domainEx)
            {
                return ApiResponse<ParticipationDto>.FailureResult(domainEx.Code, domainEx.Message);
            }

            throw;
        }
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/CreateCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class CreateCampaignCommand : IRequest<ApiResponse<CampaignDto>>
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignCategory Category { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public decimal StorePrice { get; set; }
    public int DiscountPercentage { get; set; } = 35;
    public int TargetQuantity { get; set; }
    public int DurationDays { get; set; }
    public string? ImageUrl { get; set; }
    public Guid CreatedBy { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/CreateCampaignCommandHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class CreateCampaignCommandHandler : IRequestHandler<CreateCampaignCommand, ApiResponse<CampaignDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateCampaignCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<CampaignDto>> Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
    {
        var finalPrice = request.StorePrice * (1 - request.DiscountPercentage / 100m);
        var depositAmount = finalPrice * 0.1m;

        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            StoreName = request.StoreName,
            StorePrice = request.StorePrice,
            DiscountPercentage = request.DiscountPercentage,
            FinalPrice = finalPrice,
            DepositAmount = depositAmount,
            TargetQuantity = request.TargetQuantity,
            CurrentParticipants = 0,
            Status = CampaignStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(request.DurationDays),
            ImageUrl = request.ImageUrl,
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Campaigns.AddAsync(campaign, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var campaignDto = _mapper.Map<CampaignDto>(campaign);
        return ApiResponse<CampaignDto>.SuccessResult(campaignDto, "Campaign created successfully");
    }
}
```

---

## Summary

CQRS commands and queries implemented:
- ✅ Authentication (Register, Login)
- ✅ Campaigns (Get list, Create, Join)
- ✅ Payment processing integrated with campaign joins
- ✅ Transaction management for data consistency
- ✅ Email notifications on key events

**Next**: Validators using FluentValidation.
