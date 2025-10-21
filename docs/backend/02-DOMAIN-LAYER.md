# GroupBuy Backend - Domain Layer

## Overview
The Domain layer contains pure business entities, enums, and domain logic with **no external dependencies**.

---

## File: `src/GroupBuy.Domain/Enums/AppRole.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum AppRole
{
    User,
    Admin
}
```

---

## File: `src/GroupBuy.Domain/Enums/CampaignStatus.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum CampaignStatus
{
    Active,
    Successful,
    Failed,
    Cancelled
}
```

---

## File: `src/GroupBuy.Domain/Enums/CampaignCategory.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum CampaignCategory
{
    Electronics,
    Memberships,
    Travel,
    Furniture,
    Sports
}
```

---

## File: `src/GroupBuy.Domain/Enums/PaymentType.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum PaymentType
{
    Deposit,
    Final,
    Refund
}
```

---

## File: `src/GroupBuy.Domain/Enums/PaymentStatus.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum PaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded
}
```

---

## File: `src/GroupBuy.Domain/Enums/ParticipantStatus.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum ParticipantStatus
{
    Active,
    Completed,
    Refunded
}
```

---

## File: `src/GroupBuy.Domain/Enums/NotificationType.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum NotificationType
{
    CampaignSuccess,
    CampaignFailed,
    PaymentDue,
    RefundProcessed,
    CampaignEndingSoon
}
```

---

## File: `src/GroupBuy.Domain/Enums/OAuthProvider.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum OAuthProvider
{
    None,
    Google,
    Facebook,
    AzureAD
}
```

---

## File: `src/GroupBuy.Domain/Enums/PaymentProvider.cs`

```csharp
namespace GroupBuy.Domain.Enums;

public enum PaymentProvider
{
    PayPal,
    VisaMasterCard,
    // Future: Stripe, etc.
}
```

---

## File: `src/GroupBuy.Domain/Entities/User.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public AppRole Role { get; set; } = AppRole.User;
    public string? PhoneNumber { get; set; }
    public string? ProfileImage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool EmailVerified { get; set; }
    public OAuthProvider? OAuthProvider { get; set; }
    public string? OAuthId { get; set; }

    // Navigation properties
    public ICollection<Campaign> CreatedCampaigns { get; set; } = new List<Campaign>();
    public ICollection<CampaignParticipant> Participations { get; set; } = new List<CampaignParticipant>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
```

---

## File: `src/GroupBuy.Domain/Entities/Campaign.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Domain.Entities;

public class Campaign
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignCategory Category { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public decimal StorePrice { get; set; }
    public int DiscountPercentage { get; set; } = 35;
    public decimal FinalPrice { get; set; }
    public decimal DepositAmount { get; set; }
    public int TargetQuantity { get; set; }
    public int CurrentParticipants { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.Active;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; }
    public string? ImageUrl { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Creator { get; set; } = null!;
    public ICollection<CampaignParticipant> Participants { get; set; } = new List<CampaignParticipant>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();

    // Calculated properties
    public int DaysLeft => (EndDate - DateTime.UtcNow).Days;
    public double ProgressPercentage => TargetQuantity > 0 
        ? (double)CurrentParticipants / TargetQuantity * 100 
        : 0;
}
```

---

## File: `src/GroupBuy.Domain/Entities/CampaignParticipant.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Domain.Entities;

public class CampaignParticipant
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid UserId { get; set; }
    public bool DepositPaid { get; set; }
    public decimal DepositAmount { get; set; }
    public string? DepositPaymentId { get; set; }
    public DateTime? DepositPaidAt { get; set; }
    public bool FinalPaymentPaid { get; set; }
    public decimal FinalPaymentAmount { get; set; }
    public string? FinalPaymentId { get; set; }
    public DateTime? FinalPaidAt { get; set; }
    public bool RefundProcessed { get; set; }
    public decimal RefundAmount { get; set; }
    public string? RefundId { get; set; }
    public DateTime? RefundedAt { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public ParticipantStatus Status { get; set; } = ParticipantStatus.Active;

    // Navigation properties
    public Campaign Campaign { get; set; } = null!;
    public User User { get; set; } = null!;
}
```

---

## File: `src/GroupBuy.Domain/Entities/Payment.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CampaignId { get; set; }
    public Guid ParticipantId { get; set; }
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public PaymentStatus Status { get; set; }
    public PaymentProvider PaymentProvider { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public string? GatewayResponse { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Campaign Campaign { get; set; } = null!;
    public CampaignParticipant Participant { get; set; } = null!;
}
```

---

## File: `src/GroupBuy.Domain/Entities/Notification.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CampaignId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Campaign? Campaign { get; set; }
}
```

---

## File: `src/GroupBuy.Domain/Entities/PasswordResetToken.cs`

```csharp
namespace GroupBuy.Domain.Entities;

public class PasswordResetToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}
```

---

## File: `src/GroupBuy.Domain/Exceptions/DomainException.cs`

```csharp
namespace GroupBuy.Domain.Exceptions;

public class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }
}
```

---

## File: `src/GroupBuy.Domain/Exceptions/CampaignFullException.cs`

```csharp
namespace GroupBuy.Domain.Exceptions;

public class CampaignFullException : DomainException
{
    public CampaignFullException() 
        : base("CAMPAIGN_FULL", "This campaign has reached its target quantity")
    {
    }
}
```

---

## File: `src/GroupBuy.Domain/Exceptions/AlreadyJoinedException.cs`

```csharp
namespace GroupBuy.Domain.Exceptions;

public class AlreadyJoinedException : DomainException
{
    public AlreadyJoinedException() 
        : base("ALREADY_JOINED", "You have already joined this campaign")
    {
    }
}
```

---

## Summary

The Domain layer is now complete with:
- ✅ All entities matching the database schema
- ✅ All enums for type safety
- ✅ Domain exceptions for business rule violations
- ✅ Navigation properties for Entity Framework relationships
- ✅ Calculated properties for convenience

**Next**: Application layer with CQRS commands and queries.
