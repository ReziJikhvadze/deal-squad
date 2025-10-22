# GroupBuy Backend - Application Layer Interfaces

## Overview
Application layer defines interfaces that will be implemented in Infrastructure.

---

## File: `src/GroupBuy.Application/Interfaces/IRepository.cs`

```csharp
using System.Linq.Expressions;

namespace GroupBuy.Application.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
}
```

---

## File: `src/GroupBuy.Application/Interfaces/IUnitOfWork.cs`

```csharp
using GroupBuy.Domain.Entities;

namespace GroupBuy.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Campaign> Campaigns { get; }
    IRepository<CampaignParticipant> CampaignParticipants { get; }
    IRepository<Payment> Payments { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<PasswordResetToken> PasswordResetTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
```

---

## File: `src/GroupBuy.Application/Interfaces/IPaymentService.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentResult> ProcessDepositAsync(
        Guid userId,
        Guid campaignId,
        decimal amount,
        string paymentToken,
        PaymentProvider provider,
        CancellationToken cancellationToken = default);

    Task<PaymentResult> ProcessFinalPaymentAsync(
        Guid userId,
        Guid campaignId,
        decimal amount,
        string paymentToken,
        PaymentProvider provider,
        CancellationToken cancellationToken = default);

    Task<RefundResult> ProcessRefundAsync(
        Guid participantId,
        decimal amount,
        string originalTransactionId,
        PaymentProvider provider,
        CancellationToken cancellationToken = default);
}

public class PaymentResult
{
    public bool Success { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string? GatewayResponse { get; set; }
}

public class RefundResult
{
    public bool Success { get; set; }
    public string RefundId { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}
```

---

## File: `src/GroupBuy.Application/Interfaces/IPaymentProvider.cs`

```csharp
namespace GroupBuy.Application.Interfaces;

public interface IPaymentProvider
{
    Task<PaymentResult> ChargeAsync(decimal amount, string paymentToken, string description, CancellationToken cancellationToken = default);
    Task<RefundResult> RefundAsync(string transactionId, decimal amount, CancellationToken cancellationToken = default);
    Task<bool> ValidatePaymentTokenAsync(string paymentToken, CancellationToken cancellationToken = default);
}
```

---

## File: `src/GroupBuy.Application/Interfaces/IEmailService.cs`

```csharp
namespace GroupBuy.Application.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string userName, CancellationToken cancellationToken = default);
    Task SendEmailVerificationAsync(string toEmail, string verificationLink, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
    Task SendDepositConfirmationAsync(string toEmail, string campaignTitle, decimal amount, CancellationToken cancellationToken = default);
    Task SendCampaignSuccessNotificationAsync(string toEmail, string campaignTitle, decimal finalAmount, CancellationToken cancellationToken = default);
    Task SendCampaignSuccessAsync(string toEmail, string campaignTitle, decimal finalAmount, CancellationToken cancellationToken = default);
    Task SendCampaignFailedNotificationAsync(string toEmail, string campaignTitle, decimal refundAmount, CancellationToken cancellationToken = default);
    Task SendCampaignCancelledAsync(string toEmail, string campaignTitle, string reason, CancellationToken cancellationToken = default);
    Task SendFinalPaymentRequestAsync(string toEmail, string campaignTitle, decimal amount, DateTime deadline, CancellationToken cancellationToken = default);
    Task SendRefundProcessedAsync(string toEmail, string campaignTitle, decimal amount, CancellationToken cancellationToken = default);
}
```

---

## File: `src/GroupBuy.Application/Interfaces/ITokenService.cs`

```csharp
using GroupBuy.Domain.Entities;

namespace GroupBuy.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
    Task<string> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ValidatePasswordResetTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<Guid?> GetUserIdFromResetTokenAsync(string token, CancellationToken cancellationToken = default);
}
```

---

## File: `src/GroupBuy.Application/Interfaces/ICurrentUserService.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    AppRole? Role { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
}
```

---

## File: `src/GroupBuy.Application/Interfaces/INotificationService.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.Interfaces;

public interface INotificationService
{
    Task CreateNotificationAsync(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        Guid? campaignId = null,
        CancellationToken cancellationToken = default);

    Task NotifyCampaignParticipantsAsync(
        Guid campaignId,
        NotificationType type,
        string title,
        string message,
        CancellationToken cancellationToken = default);
}
```

---

## File: `src/GroupBuy.Application/Interfaces/ICampaignStatusService.cs`

```csharp
namespace GroupBuy.Application.Interfaces;

public interface ICampaignStatusService
{
    Task CheckAndUpdateExpiredCampaignsAsync(CancellationToken cancellationToken = default);
    Task ProcessCampaignSuccessAsync(Guid campaignId, CancellationToken cancellationToken = default);
    Task ProcessCampaignFailureAsync(Guid campaignId, CancellationToken cancellationToken = default);
}
```

---

## Summary

Application interfaces defined:
- ✅ Generic repository pattern
- ✅ Unit of Work pattern
- ✅ Payment service (multi-provider support)
- ✅ Email service
- ✅ Token service (JWT + password reset)
- ✅ Current user service
- ✅ Notification service
- ✅ Campaign status service

**Next**: DTOs and CQRS commands/queries.
