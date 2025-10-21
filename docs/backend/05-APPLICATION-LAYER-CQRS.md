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

## File: `src/GroupBuy.Application/Features/Auth/Queries/GetCurrentUserQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Queries;

public class GetCurrentUserQuery : IRequest<ApiResponse<UserDto>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Queries/GetCurrentUserQueryHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Queries;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, ApiResponse<UserDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public GetCurrentUserQueryHandler(ICurrentUserService currentUserService, IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<UserDto>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null)
        {
            return ApiResponse<UserDto>.FailureResult("USER_NOT_FOUND", "User not found");
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            ProfileImage = user.ProfileImage
        };

        return ApiResponse<UserDto>.SuccessResult(userDto);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/UpdateProfileCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class UpdateProfileCommand : IRequest<ApiResponse<UserDto>>
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImage { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/UpdateProfileCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ApiResponse<UserDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfileCommandHandler(ICurrentUserService currentUserService, IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<UserDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<UserDto>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null)
        {
            return ApiResponse<UserDto>.FailureResult("USER_NOT_FOUND", "User not found");
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName;

        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber;

        if (request.ProfileImage != null)
            user.ProfileImage = request.ProfileImage;

        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            ProfileImage = user.ProfileImage
        };

        return ApiResponse<UserDto>.SuccessResult(userDto, "Profile updated successfully");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/ForgotPasswordCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class ForgotPasswordCommand : IRequest<ApiResponse<object>>
{
    public string Email { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/ForgotPasswordCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email, cancellationToken);
        var user = users.FirstOrDefault();

        // Always return success to prevent email enumeration
        if (user == null)
        {
            return ApiResponse<object>.SuccessResult(null, "If the email exists, a password reset link has been sent");
        }

        var resetToken = await _tokenService.GeneratePasswordResetTokenAsync(user.Id, cancellationToken);
        await _emailService.SendPasswordResetEmailAsync(user.Email, user.FullName, resetToken, cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "If the email exists, a password reset link has been sent");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/ResetPasswordCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Auth.Commands;

public class ResetPasswordCommand : IRequest<ApiResponse<object>>
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/Features/Auth/Commands/ResetPasswordCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace GroupBuy.Application.Features.Auth.Commands;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<User> _passwordHasher;

    public ResetPasswordCommandHandler(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IPasswordHasher<User> passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<ApiResponse<object>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var isValid = await _tokenService.ValidatePasswordResetTokenAsync(request.Token, cancellationToken);
        if (!isValid)
        {
            return ApiResponse<object>.FailureResult("INVALID_TOKEN", "Invalid or expired reset token");
        }

        var userId = await _tokenService.GetUserIdFromResetTokenAsync(request.Token, cancellationToken);
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("INVALID_TOKEN", "Invalid reset token");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null)
        {
            return ApiResponse<object>.FailureResult("USER_NOT_FOUND", "User not found");
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "Password reset successfully");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetCampaignByIdQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetCampaignByIdQuery : IRequest<ApiResponse<CampaignDetailDto>>
{
    public Guid CampaignId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetCampaignByIdQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetCampaignByIdQueryHandler : IRequestHandler<GetCampaignByIdQuery, ApiResponse<CampaignDetailDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetCampaignByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<CampaignDetailDto>> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<CampaignDetailDto>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        var campaignDto = _mapper.Map<CampaignDetailDto>(campaign);

        // Check if current user has joined
        if (_currentUserService.UserId.HasValue)
        {
            var participation = await _unitOfWork.CampaignParticipants.FindAsync(
                cp => cp.CampaignId == request.CampaignId && cp.UserId == _currentUserService.UserId.Value,
                cancellationToken);
            
            campaignDto.UserParticipation = _mapper.Map<UserParticipationSummaryDto>(participation.FirstOrDefault());
        }

        return ApiResponse<CampaignDetailDto>.SuccessResult(campaignDto);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/UpdateCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class UpdateCampaignCommand : IRequest<ApiResponse<CampaignDto>>
{
    public Guid CampaignId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/UpdateCampaignCommandHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class UpdateCampaignCommandHandler : IRequestHandler<UpdateCampaignCommand, ApiResponse<CampaignDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateCampaignCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<CampaignDto>> Handle(UpdateCampaignCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<CampaignDto>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<CampaignDto>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        if (campaign.CreatedBy != userId.Value)
        {
            return ApiResponse<CampaignDto>.FailureResult("FORBIDDEN", "You can only update your own campaigns");
        }

        if (campaign.Status != CampaignStatus.Active)
        {
            return ApiResponse<CampaignDto>.FailureResult("INVALID_STATUS", "Cannot update inactive campaigns");
        }

        if (!string.IsNullOrWhiteSpace(request.Title))
            campaign.Title = request.Title;

        if (request.Description != null)
            campaign.Description = request.Description;

        if (request.ImageUrl != null)
            campaign.ImageUrl = request.ImageUrl;

        campaign.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var campaignDto = _mapper.Map<CampaignDto>(campaign);
        return ApiResponse<CampaignDto>.SuccessResult(campaignDto, "Campaign updated successfully");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/CancelCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class CancelCampaignCommand : IRequest<ApiResponse<object>>
{
    public Guid CampaignId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/CancelCampaignCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class CancelCampaignCommandHandler : IRequestHandler<CancelCampaignCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPaymentService _paymentService;
    private readonly IEmailService _emailService;

    public CancelCampaignCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IPaymentService paymentService,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _paymentService = paymentService;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> Handle(CancelCampaignCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<object>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        if (campaign.CreatedBy != userId.Value)
        {
            return ApiResponse<object>.FailureResult("FORBIDDEN", "You can only cancel your own campaigns");
        }

        if (campaign.Status != CampaignStatus.Active)
        {
            return ApiResponse<object>.FailureResult("INVALID_STATUS", "Campaign is not active");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            campaign.Status = CampaignStatus.Cancelled;
            campaign.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);

            // Refund all participants
            var participants = await _unitOfWork.CampaignParticipants.FindAsync(
                cp => cp.CampaignId == request.CampaignId,
                cancellationToken);

            foreach (var participant in participants)
            {
                if (participant.DepositPaid && !string.IsNullOrEmpty(participant.DepositPaymentId))
                {
                    await _paymentService.ProcessRefundAsync(
                        participant.DepositPaymentId,
                        participant.DepositAmount,
                        cancellationToken);
                }

                var user = await _unitOfWork.Users.GetByIdAsync(participant.UserId, cancellationToken);
                if (user != null)
                {
                    await _emailService.SendCampaignCancelledAsync(user.Email, campaign.Title, cancellationToken);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<object>.SuccessResult(null, "Campaign cancelled and refunds processed");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/FinalizeCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class FinalizeCampaignCommand : IRequest<ApiResponse<object>>
{
    public Guid CampaignId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Commands/FinalizeCampaignCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Commands;

public class FinalizeCampaignCommandHandler : IRequestHandler<FinalizeCampaignCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IEmailService _emailService;

    public FinalizeCampaignCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> Handle(FinalizeCampaignCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<object>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        if (campaign.CreatedBy != userId.Value)
        {
            return ApiResponse<object>.FailureResult("FORBIDDEN", "You can only finalize your own campaigns");
        }

        if (campaign.Status != CampaignStatus.Active)
        {
            return ApiResponse<object>.FailureResult("INVALID_STATUS", "Campaign is not active");
        }

        if (campaign.CurrentParticipants < campaign.TargetQuantity)
        {
            return ApiResponse<object>.FailureResult("INSUFFICIENT_PARTICIPANTS", "Campaign has not reached target quantity");
        }

        campaign.Status = CampaignStatus.Successful;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);

        // Notify all participants to pay final amount
        var participants = await _unitOfWork.CampaignParticipants.FindAsync(
            cp => cp.CampaignId == request.CampaignId,
            cancellationToken);

        foreach (var participant in participants)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(participant.UserId, cancellationToken);
            if (user != null)
            {
                await _emailService.SendCampaignSuccessAsync(
                    user.Email,
                    campaign.Title,
                    participant.FinalPaymentAmount,
                    cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "Campaign finalized successfully");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetMyCampaignsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetMyCampaignsQuery : IRequest<ApiResponse<List<CampaignDto>>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetMyCampaignsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetMyCampaignsQueryHandler : IRequestHandler<GetMyCampaignsQuery, ApiResponse<List<CampaignDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetMyCampaignsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<CampaignDto>>> Handle(GetMyCampaignsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<List<CampaignDto>>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var campaigns = await _unitOfWork.Campaigns.FindAsync(
            c => c.CreatedBy == userId.Value,
            cancellationToken);

        var campaignDtos = _mapper.Map<List<CampaignDto>>(campaigns.OrderByDescending(c => c.CreatedAt).ToList());
        return ApiResponse<List<CampaignDto>>.SuccessResult(campaignDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetCampaignParticipantsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetCampaignParticipantsQuery : IRequest<ApiResponse<List<ParticipantSummaryDto>>>
{
    public Guid CampaignId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Campaigns/Queries/GetCampaignParticipantsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Campaigns;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Campaigns.Queries;

public class GetCampaignParticipantsQueryHandler : IRequestHandler<GetCampaignParticipantsQuery, ApiResponse<List<ParticipantSummaryDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCampaignParticipantsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<ParticipantSummaryDto>>> Handle(GetCampaignParticipantsQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<List<ParticipantSummaryDto>>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        var participants = await _unitOfWork.CampaignParticipants.FindAsync(
            cp => cp.CampaignId == request.CampaignId,
            cancellationToken);

        var participantDtos = _mapper.Map<List<ParticipantSummaryDto>>(participants.ToList());
        return ApiResponse<List<ParticipantSummaryDto>>.SuccessResult(participantDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Commands/PayFinalCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Commands;

public class PayFinalCommand : IRequest<ApiResponse<ParticipationDto>>
{
    public Guid ParticipationId { get; set; }
    public PaymentProvider PaymentProvider { get; set; }
    public string PaymentToken { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Commands/PayFinalCommandHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Commands;

public class PayFinalCommandHandler : IRequestHandler<PayFinalCommand, ApiResponse<ParticipationDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPaymentService _paymentService;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;

    public PayFinalCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IPaymentService paymentService,
        IEmailService emailService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _paymentService = paymentService;
        _emailService = emailService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ParticipationDto>> Handle(PayFinalCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<ParticipationDto>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var participation = await _unitOfWork.CampaignParticipants.GetByIdAsync(request.ParticipationId, cancellationToken);
        if (participation == null)
        {
            return ApiResponse<ParticipationDto>.FailureResult("PARTICIPATION_NOT_FOUND", "Participation not found");
        }

        if (participation.UserId != userId.Value)
        {
            return ApiResponse<ParticipationDto>.FailureResult("FORBIDDEN", "Not your participation");
        }

        if (participation.FinalPaymentPaid)
        {
            return ApiResponse<ParticipationDto>.FailureResult("ALREADY_PAID", "Final payment already made");
        }

        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(participation.CampaignId, cancellationToken);
        if (campaign == null || campaign.Status != CampaignStatus.Successful)
        {
            return ApiResponse<ParticipationDto>.FailureResult("INVALID_CAMPAIGN_STATUS", "Campaign must be successful to pay final amount");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var paymentResult = await _paymentService.ProcessFinalPaymentAsync(
                userId.Value,
                participation.CampaignId,
                participation.FinalPaymentAmount,
                request.PaymentToken,
                request.PaymentProvider,
                cancellationToken);

            if (!paymentResult.Success)
            {
                return ApiResponse<ParticipationDto>.FailureResult("PAYMENT_FAILED", paymentResult.ErrorMessage ?? "Payment failed");
            }

            participation.FinalPaymentPaid = true;
            participation.FinalPaymentId = paymentResult.TransactionId;
            participation.FinalPaymentPaidAt = DateTime.UtcNow;

            await _unitOfWork.CampaignParticipants.UpdateAsync(participation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
            if (user != null)
            {
                await _emailService.SendFinalPaymentConfirmationAsync(user.Email, campaign.Title, participation.FinalPaymentAmount, cancellationToken);
            }

            var participationDto = _mapper.Map<ParticipationDto>(participation);
            return ApiResponse<ParticipationDto>.SuccessResult(participationDto, "Final payment completed successfully");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Commands/LeaveCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Commands;

public class LeaveCampaignCommand : IRequest<ApiResponse<object>>
{
    public Guid ParticipationId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Commands/LeaveCampaignCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Commands;

public class LeaveCampaignCommandHandler : IRequestHandler<LeaveCampaignCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPaymentService _paymentService;

    public LeaveCampaignCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IPaymentService paymentService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _paymentService = paymentService;
    }

    public async Task<ApiResponse<object>> Handle(LeaveCampaignCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var participation = await _unitOfWork.CampaignParticipants.GetByIdAsync(request.ParticipationId, cancellationToken);
        if (participation == null)
        {
            return ApiResponse<object>.FailureResult("PARTICIPATION_NOT_FOUND", "Participation not found");
        }

        if (participation.UserId != userId.Value)
        {
            return ApiResponse<object>.FailureResult("FORBIDDEN", "Not your participation");
        }

        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(participation.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<object>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        if (campaign.Status != CampaignStatus.Active)
        {
            return ApiResponse<object>.FailureResult("INVALID_STATUS", "Cannot leave a non-active campaign");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            // Refund deposit
            if (participation.DepositPaid && !string.IsNullOrEmpty(participation.DepositPaymentId))
            {
                await _paymentService.ProcessRefundAsync(
                    participation.DepositPaymentId,
                    participation.DepositAmount,
                    cancellationToken);
            }

            participation.Status = ParticipantStatus.Left;
            await _unitOfWork.CampaignParticipants.UpdateAsync(participation, cancellationToken);

            campaign.CurrentParticipants--;
            await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<object>.SuccessResult(null, "Successfully left campaign and deposit refunded");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Queries/GetMyParticipationsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Queries;

public class GetMyParticipationsQuery : IRequest<ApiResponse<List<UserParticipationDto>>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Queries/GetMyParticipationsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Queries;

public class GetMyParticipationsQueryHandler : IRequestHandler<GetMyParticipationsQuery, ApiResponse<List<UserParticipationDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetMyParticipationsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<UserParticipationDto>>> Handle(GetMyParticipationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<List<UserParticipationDto>>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var participations = await _unitOfWork.CampaignParticipants.FindAsync(
            cp => cp.UserId == userId.Value,
            cancellationToken);

        var participationDtos = _mapper.Map<List<UserParticipationDto>>(participations.OrderByDescending(p => p.JoinedAt).ToList());
        return ApiResponse<List<UserParticipationDto>>.SuccessResult(participationDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Queries/GetParticipationQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Queries;

public class GetParticipationQuery : IRequest<ApiResponse<ParticipationDto>>
{
    public Guid ParticipationId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Participations/Queries/GetParticipationQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Participations;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Participations.Queries;

public class GetParticipationQueryHandler : IRequestHandler<GetParticipationQuery, ApiResponse<ParticipationDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetParticipationQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ParticipationDto>> Handle(GetParticipationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<ParticipationDto>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var participation = await _unitOfWork.CampaignParticipants.GetByIdAsync(request.ParticipationId, cancellationToken);
        if (participation == null)
        {
            return ApiResponse<ParticipationDto>.FailureResult("PARTICIPATION_NOT_FOUND", "Participation not found");
        }

        if (participation.UserId != userId.Value)
        {
            return ApiResponse<ParticipationDto>.FailureResult("FORBIDDEN", "Not your participation");
        }

        var participationDto = _mapper.Map<ParticipationDto>(participation);
        return ApiResponse<ParticipationDto>.SuccessResult(participationDto);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Payments/Queries/GetMyPaymentsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using MediatR;

namespace GroupBuy.Application.Features.Payments.Queries;

public class GetMyPaymentsQuery : IRequest<ApiResponse<List<PaymentDto>>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Payments/Queries/GetMyPaymentsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Payments.Queries;

public class GetMyPaymentsQueryHandler : IRequestHandler<GetMyPaymentsQuery, ApiResponse<List<PaymentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetMyPaymentsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<PaymentDto>>> Handle(GetMyPaymentsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<List<PaymentDto>>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var payments = await _unitOfWork.Payments.FindAsync(
            p => p.UserId == userId.Value,
            cancellationToken);

        var paymentDtos = _mapper.Map<List<PaymentDto>>(payments.OrderByDescending(p => p.CreatedAt).ToList());
        return ApiResponse<List<PaymentDto>>.SuccessResult(paymentDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Payments/Queries/GetPaymentQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using MediatR;

namespace GroupBuy.Application.Features.Payments.Queries;

public class GetPaymentQuery : IRequest<ApiResponse<PaymentDto>>
{
    public Guid PaymentId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Payments/Queries/GetPaymentQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Payments.Queries;

public class GetPaymentQueryHandler : IRequestHandler<GetPaymentQuery, ApiResponse<PaymentDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetPaymentQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaymentDto>> Handle(GetPaymentQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<PaymentDto>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var payment = await _unitOfWork.Payments.GetByIdAsync(request.PaymentId, cancellationToken);
        if (payment == null)
        {
            return ApiResponse<PaymentDto>.FailureResult("PAYMENT_NOT_FOUND", "Payment not found");
        }

        if (payment.UserId != userId.Value)
        {
            return ApiResponse<PaymentDto>.FailureResult("FORBIDDEN", "Not your payment");
        }

        var paymentDto = _mapper.Map<PaymentDto>(payment);
        return ApiResponse<PaymentDto>.SuccessResult(paymentDto);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Payments/Queries/GetCampaignPaymentsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using MediatR;

namespace GroupBuy.Application.Features.Payments.Queries;

public class GetCampaignPaymentsQuery : IRequest<ApiResponse<List<PaymentDto>>>
{
    public Guid CampaignId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Payments/Queries/GetCampaignPaymentsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Payments.Queries;

public class GetCampaignPaymentsQueryHandler : IRequestHandler<GetCampaignPaymentsQuery, ApiResponse<List<PaymentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCampaignPaymentsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<PaymentDto>>> Handle(GetCampaignPaymentsQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<List<PaymentDto>>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        var payments = await _unitOfWork.Payments.FindAsync(
            p => p.CampaignId == request.CampaignId,
            cancellationToken);

        var paymentDtos = _mapper.Map<List<PaymentDto>>(payments.OrderByDescending(p => p.CreatedAt).ToList());
        return ApiResponse<List<PaymentDto>>.SuccessResult(paymentDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Queries/GetNotificationsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Notifications;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Queries;

public class GetNotificationsQuery : IRequest<ApiResponse<List<NotificationDto>>>
{
    public bool? UnreadOnly { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Queries/GetNotificationsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Notifications;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Queries;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, ApiResponse<List<NotificationDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetNotificationsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<List<NotificationDto>>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var notifications = await _unitOfWork.Notifications.FindAsync(
            n => n.UserId == userId.Value,
            cancellationToken);

        if (request.UnreadOnly == true)
        {
            notifications = notifications.Where(n => !n.IsRead);
        }

        var notificationDtos = _mapper.Map<List<NotificationDto>>(notifications.OrderByDescending(n => n.CreatedAt).ToList());
        return ApiResponse<List<NotificationDto>>.SuccessResult(notificationDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Commands/MarkNotificationAsReadCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Commands;

public class MarkNotificationAsReadCommand : IRequest<ApiResponse<object>>
{
    public Guid NotificationId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Commands/MarkNotificationAsReadCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Commands;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public MarkNotificationAsReadCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<object>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var notification = await _unitOfWork.Notifications.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null)
        {
            return ApiResponse<object>.FailureResult("NOTIFICATION_NOT_FOUND", "Notification not found");
        }

        if (notification.UserId != userId.Value)
        {
            return ApiResponse<object>.FailureResult("FORBIDDEN", "Not your notification");
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;

        await _unitOfWork.Notifications.UpdateAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "Notification marked as read");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Commands/MarkAllNotificationsAsReadCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Commands;

public class MarkAllNotificationsAsReadCommand : IRequest<ApiResponse<object>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Commands/MarkAllNotificationsAsReadCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Commands;

public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public MarkAllNotificationsAsReadCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<object>> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var notifications = await _unitOfWork.Notifications.FindAsync(
            n => n.UserId == userId.Value && !n.IsRead,
            cancellationToken);

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _unitOfWork.Notifications.UpdateAsync(notification, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "All notifications marked as read");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Commands/DeleteNotificationCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Commands;

public class DeleteNotificationCommand : IRequest<ApiResponse<object>>
{
    public Guid NotificationId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Commands/DeleteNotificationCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Commands;

public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteNotificationCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<object>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<object>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var notification = await _unitOfWork.Notifications.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null)
        {
            return ApiResponse<object>.FailureResult("NOTIFICATION_NOT_FOUND", "Notification not found");
        }

        if (notification.UserId != userId.Value)
        {
            return ApiResponse<object>.FailureResult("FORBIDDEN", "Not your notification");
        }

        await _unitOfWork.Notifications.DeleteAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "Notification deleted");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Queries/GetUnreadNotificationCountQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Queries;

public class GetUnreadNotificationCountQuery : IRequest<ApiResponse<int>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Notifications/Queries/GetUnreadNotificationCountQueryHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Notifications.Queries;

public class GetUnreadNotificationCountQueryHandler : IRequestHandler<GetUnreadNotificationCountQuery, ApiResponse<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetUnreadNotificationCountQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<int>> Handle(GetUnreadNotificationCountQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return ApiResponse<int>.FailureResult("UNAUTHORIZED", "User not authenticated");
        }

        var count = await _unitOfWork.Notifications.CountAsync(
            n => n.UserId == userId.Value && !n.IsRead,
            cancellationToken);

        return ApiResponse<int>.SuccessResult(count);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Queries/GetDashboardStatsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Admin;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Queries;

public class GetDashboardStatsQuery : IRequest<ApiResponse<AdminDashboardStatsDto>>
{
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Queries/GetDashboardStatsQueryHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Admin;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Queries;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, ApiResponse<AdminDashboardStatsDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetDashboardStatsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<AdminDashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var totalUsers = await _unitOfWork.Users.CountAsync(cancellationToken: cancellationToken);
        var totalCampaigns = await _unitOfWork.Campaigns.CountAsync(cancellationToken: cancellationToken);
        var activeCampaigns = await _unitOfWork.Campaigns.CountAsync(c => c.Status == CampaignStatus.Active, cancellationToken);
        var successfulCampaigns = await _unitOfWork.Campaigns.CountAsync(c => c.Status == CampaignStatus.Successful, cancellationToken);
        
        var allPayments = await _unitOfWork.Payments.GetAllAsync(cancellationToken);
        var totalRevenue = allPayments.Sum(p => p.Amount);

        var stats = new AdminDashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalCampaigns = totalCampaigns,
            ActiveCampaigns = activeCampaigns,
            SuccessfulCampaigns = successfulCampaigns,
            TotalRevenue = totalRevenue
        };

        return ApiResponse<AdminDashboardStatsDto>.SuccessResult(stats);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Queries/GetAllUsersQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Queries;

public class GetAllUsersQuery : IRequest<ApiResponse<List<UserDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Queries/GetAllUsersQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Auth;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Queries;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, ApiResponse<List<UserDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<UserDto>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
        var pagedUsers = users
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var userDtos = _mapper.Map<List<UserDto>>(pagedUsers);
        return ApiResponse<List<UserDto>>.SuccessResult(userDtos);
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Commands/BanUserCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Commands;

public class BanUserCommand : IRequest<ApiResponse<object>>
{
    public Guid UserId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Commands/BanUserCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Commands;

public class BanUserCommandHandler : IRequestHandler<BanUserCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;

    public BanUserCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<object>> Handle(BanUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            return ApiResponse<object>.FailureResult("USER_NOT_FOUND", "User not found");
        }

        user.IsBanned = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "User banned successfully");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Commands/UnbanUserCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Commands;

public class UnbanUserCommand : IRequest<ApiResponse<object>>
{
    public Guid UserId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Commands/UnbanUserCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Commands;

public class UnbanUserCommandHandler : IRequestHandler<UnbanUserCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UnbanUserCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<object>> Handle(UnbanUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            return ApiResponse<object>.FailureResult("USER_NOT_FOUND", "User not found");
        }

        user.IsBanned = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<object>.SuccessResult(null, "User unbanned successfully");
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Commands/AdminCancelCampaignCommand.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Commands;

public class AdminCancelCampaignCommand : IRequest<ApiResponse<object>>
{
    public Guid CampaignId { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Commands/AdminCancelCampaignCommandHandler.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Commands;

public class AdminCancelCampaignCommandHandler : IRequestHandler<AdminCancelCampaignCommand, ApiResponse<object>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;
    private readonly IEmailService _emailService;

    public AdminCancelCampaignCommandHandler(
        IUnitOfWork unitOfWork,
        IPaymentService paymentService,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _paymentService = paymentService;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> Handle(AdminCancelCampaignCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(request.CampaignId, cancellationToken);
        if (campaign == null)
        {
            return ApiResponse<object>.FailureResult("CAMPAIGN_NOT_FOUND", "Campaign not found");
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            campaign.Status = CampaignStatus.Cancelled;
            campaign.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);

            // Refund all participants
            var participants = await _unitOfWork.CampaignParticipants.FindAsync(
                cp => cp.CampaignId == request.CampaignId,
                cancellationToken);

            foreach (var participant in participants)
            {
                if (participant.DepositPaid && !string.IsNullOrEmpty(participant.DepositPaymentId))
                {
                    await _paymentService.ProcessRefundAsync(
                        participant.DepositPaymentId,
                        participant.DepositAmount,
                        cancellationToken);
                }

                var user = await _unitOfWork.Users.GetByIdAsync(participant.UserId, cancellationToken);
                if (user != null)
                {
                    await _emailService.SendCampaignCancelledAsync(user.Email, campaign.Title, cancellationToken);
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<object>.SuccessResult(null, "Campaign cancelled by admin and refunds processed");
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Queries/GetAllPaymentsQuery.cs`

```csharp
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Queries;

public class GetAllPaymentsQuery : IRequest<ApiResponse<List<PaymentDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
```

---

## File: `src/GroupBuy.Application/Features/Admin/Queries/GetAllPaymentsQueryHandler.cs`

```csharp
using AutoMapper;
using GroupBuy.Application.DTOs.Common;
using GroupBuy.Application.DTOs.Payments;
using GroupBuy.Application.Interfaces;
using MediatR;

namespace GroupBuy.Application.Features.Admin.Queries;

public class GetAllPaymentsQueryHandler : IRequestHandler<GetAllPaymentsQuery, ApiResponse<List<PaymentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllPaymentsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<List<PaymentDto>>> Handle(GetAllPaymentsQuery request, CancellationToken cancellationToken)
    {
        var payments = await _unitOfWork.Payments.GetAllAsync(cancellationToken);
        var pagedPayments = payments
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var paymentDtos = _mapper.Map<List<PaymentDto>>(pagedPayments);
        return ApiResponse<List<PaymentDto>>.SuccessResult(paymentDtos);
    }
}
```

---

## Summary

CQRS commands and queries fully implemented for all controllers:

✅ **Authentication**: Register, Login, GetCurrentUser, UpdateProfile, ForgotPassword, ResetPassword
✅ **Campaigns**: GetCampaigns, GetCampaignById, CreateCampaign, UpdateCampaign, CancelCampaign, FinalizeCampaign, GetMyCampaigns, GetCampaignParticipants, JoinCampaign
✅ **Participations**: PayFinal, LeaveCampaign, GetMyParticipations, GetParticipation
✅ **Payments**: GetMyPayments, GetPayment, GetCampaignPayments
✅ **Notifications**: GetNotifications, MarkAsRead, MarkAllAsRead, DeleteNotification, GetUnreadCount
✅ **Admin**: GetDashboardStats, GetAllUsers, BanUser, UnbanUser, AdminCancelCampaign, GetAllPayments

All commands/queries include proper handlers with error handling, authorization checks, and business logic.

**Next**: Validators using FluentValidation.
