# GroupBuy Backend - Infrastructure Services (Email, JWT, etc.)

## Email Service (MailKit)

```csharp
// src/GroupBuy.Infrastructure/Services/EmailService.cs
using GroupBuy.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;

namespace GroupBuy.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration) => _configuration = configuration;

    public async Task SendWelcomeEmailAsync(string toEmail, string userName, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Welcome to GroupBuy!", 
            $"<h1>Welcome {userName}!</h1><p>Thank you for joining GroupBuy.</p>", ct);
    }

    public async Task SendDepositConfirmationAsync(string toEmail, string campaignTitle, decimal amount, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Deposit Confirmed", 
            $"<h1>Payment Received</h1><p>Your deposit of ${amount} for '{campaignTitle}' has been confirmed.</p>", ct);
    }

    public async Task SendCampaignSuccessAsync(string toEmail, string campaignTitle, decimal finalAmount, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Campaign Successful!", 
            $"<h1>Great News!</h1><p>The campaign '{campaignTitle}' has reached its target!</p><p>Final payment amount: ${finalAmount}</p><p>Please complete your final payment to receive your item.</p>", ct);
    }

    public async Task SendCampaignCancelledAsync(string toEmail, string campaignTitle, string reason, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Campaign Cancelled", 
            $"<h1>Campaign Cancelled</h1><p>The campaign '{campaignTitle}' has been cancelled.</p><p>Reason: {reason}</p><p>Your deposit will be refunded within 5-7 business days.</p>", ct);
    }

    // Implement other email methods similarly...

    private async Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken ct)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("GroupBuy", _configuration["Email:FromAddress"]));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_configuration["Email:SmtpHost"], 
            int.Parse(_configuration["Email:SmtpPort"]!), true, ct);
        await smtp.AuthenticateAsync(_configuration["Email:Username"], 
            _configuration["Email:Password"], ct);
        await smtp.SendAsync(message, ct);
        await smtp.DisconnectAsync(true, ct);
    }
}
```

## JWT Token Service

```csharp
// src/GroupBuy.Infrastructure/Services/TokenService.cs
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GroupBuy.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;

    public TokenService(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken ct = default)
    {
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Used = false
        };
        await _unitOfWork.PasswordResetTokens.AddAsync(resetToken, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return token;
    }

    public async Task<bool> ValidatePasswordResetTokenAsync(string token, CancellationToken ct = default)
    {
        var tokens = await _unitOfWork.PasswordResetTokens.FindAsync(
            t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow, ct);
        return tokens.Any();
    }

    public async Task<Guid?> GetUserIdFromResetTokenAsync(string token, CancellationToken ct = default)
    {
        var tokens = await _unitOfWork.PasswordResetTokens.FindAsync(
            t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow, ct);
        var resetToken = tokens.FirstOrDefault();
        return resetToken?.UserId;
    }
}
```

## Current User Service (HTTP Context)

```csharp
// src/GroupBuy.Infrastructure/Services/CurrentUserService.cs
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

## Notification Service

```csharp
// src/GroupBuy.Infrastructure/Services/NotificationService.cs
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;

namespace GroupBuy.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task CreateNotificationAsync(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        Guid? campaignId = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            CampaignId = campaignId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task NotifyCampaignParticipantsAsync(
        Guid campaignId,
        NotificationType type,
        string title,
        string message,
        CancellationToken cancellationToken = default)
    {
        var participants = await _unitOfWork.CampaignParticipants.FindAsync(
            p => p.CampaignId == campaignId, cancellationToken);

        foreach (var participant in participants)
        {
            await CreateNotificationAsync(
                participant.UserId,
                type,
                title,
                message,
                campaignId,
                cancellationToken);
        }
    }
}
```

## Campaign Status Service

```csharp
// src/GroupBuy.Infrastructure/Services/CampaignStatusService.cs
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using GroupBuy.Domain.Enums;

namespace GroupBuy.Infrastructure.Services;

public class CampaignStatusService : ICampaignStatusService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IPaymentService _paymentService;

    public CampaignStatusService(
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IEmailService emailService,
        IPaymentService paymentService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _emailService = emailService;
        _paymentService = paymentService;
    }

    public async Task CheckAndUpdateExpiredCampaignsAsync(CancellationToken cancellationToken = default)
    {
        var expiredCampaigns = await _unitOfWork.Campaigns.FindAsync(
            c => c.Status == CampaignStatus.Active && c.EndDate < DateTime.UtcNow,
            cancellationToken);

        foreach (var campaign in expiredCampaigns)
        {
            if (campaign.CurrentParticipants >= campaign.MinParticipants)
            {
                await ProcessCampaignSuccessAsync(campaign.Id, cancellationToken);
            }
            else
            {
                await ProcessCampaignFailureAsync(campaign.Id, cancellationToken);
            }
        }
    }

    public async Task ProcessCampaignSuccessAsync(Guid campaignId, CancellationToken cancellationToken = default)
    {
        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(campaignId, cancellationToken);
        if (campaign == null) return;

        campaign.Status = CampaignStatus.Successful;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Notify all participants
        var participants = await _unitOfWork.CampaignParticipants.FindAsync(
            p => p.CampaignId == campaignId, cancellationToken);

        foreach (var participant in participants)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(participant.UserId, cancellationToken);
            if (user != null)
            {
                await _notificationService.CreateNotificationAsync(
                    user.Id,
                    NotificationType.CampaignSuccessful,
                    "Campaign Successful!",
                    $"The campaign '{campaign.Title}' has reached its goal! Please complete your final payment.",
                    campaignId,
                    cancellationToken);

                var finalAmount = campaign.FinalPricePerPerson - campaign.DepositAmount;
                await _emailService.SendCampaignSuccessAsync(
                    user.Email,
                    campaign.Title,
                    finalAmount,
                    cancellationToken);
            }
        }
    }

    public async Task ProcessCampaignFailureAsync(Guid campaignId, CancellationToken cancellationToken = default)
    {
        var campaign = await _unitOfWork.Campaigns.GetByIdAsync(campaignId, cancellationToken);
        if (campaign == null) return;

        campaign.Status = CampaignStatus.Failed;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Campaigns.UpdateAsync(campaign, cancellationToken);

        // Process refunds for all participants
        var participants = await _unitOfWork.CampaignParticipants.FindAsync(
            p => p.CampaignId == campaignId && p.DepositPaid, cancellationToken);

        foreach (var participant in participants)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(participant.UserId, cancellationToken);
            if (user != null)
            {
                // Find the deposit payment
                var depositPayment = (await _unitOfWork.Payments.FindAsync(
                    p => p.CampaignParticipantId == participant.Id && p.PaymentType == PaymentType.Deposit,
                    cancellationToken)).FirstOrDefault();

                if (depositPayment != null)
                {
                    // Process refund
                    var refundResult = await _paymentService.ProcessRefundAsync(
                        participant.Id,
                        campaign.DepositAmount,
                        depositPayment.TransactionId,
                        depositPayment.PaymentProvider,
                        cancellationToken);

                    if (refundResult.Success)
                    {
                        participant.RefundProcessed = true;
                        await _unitOfWork.CampaignParticipants.UpdateAsync(participant, cancellationToken);
                    }
                }

                await _notificationService.CreateNotificationAsync(
                    user.Id,
                    NotificationType.CampaignCancelled,
                    "Campaign Failed",
                    $"The campaign '{campaign.Title}' did not reach the minimum participants. Your deposit will be refunded.",
                    campaignId,
                    cancellationToken);

                await _emailService.SendCampaignCancelledAsync(
                    user.Email,
                    campaign.Title,
                    "Minimum participants not reached",
                    cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
```

## Dependency Injection Registration

Add this to your Infrastructure layer:

```csharp
// src/GroupBuy.Infrastructure/DependencyInjection.cs
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

        // Payment Providers (if using multiple)
        // services.AddScoped<IPaymentProvider, PayPalPaymentProvider>();
        // services.AddScoped<IPaymentProvider, VisaMasterCardProvider>();

        return services;
    }
}
```
