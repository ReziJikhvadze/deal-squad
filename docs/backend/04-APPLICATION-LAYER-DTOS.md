# GroupBuy Backend - Application Layer DTOs

## Overview
Data Transfer Objects for API responses and requests.

---

## File: `src/GroupBuy.Application/DTOs/Auth/RegisterRequestDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Auth;

public class RegisterRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Auth/LoginRequestDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Auth;

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/DTOs/Auth/AuthResponseDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Auth;

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public UserDto? User { get; set; }
    public string? Token { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public AppRole Role { get; set; }
    public string? ProfileImage { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Auth/GoogleLoginRequestDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Auth;

public class GoogleLoginRequestDto
{
    public string IdToken { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/DTOs/Auth/PasswordResetRequestDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Auth;

public class PasswordResetRequestDto
{
    public string Email { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/DTOs/Auth/PasswordResetConfirmDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Auth;

public class PasswordResetConfirmDto
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/DTOs/Campaigns/CampaignDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Campaigns;

public class CampaignDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CampaignCategory Category { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public decimal StorePrice { get; set; }
    public int DiscountPercentage { get; set; }
    public decimal FinalPrice { get; set; }
    public decimal DepositAmount { get; set; }
    public int TargetQuantity { get; set; }
    public int CurrentParticipants { get; set; }
    public CampaignStatus Status { get; set; }
    public string? ImageUrl { get; set; }
    public int DaysLeft { get; set; }
    public double ProgressPercentage { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Campaigns/CampaignDetailDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Campaigns;

public class CampaignDetailDto : CampaignDto
{
    public List<ParticipantSummaryDto> Participants { get; set; } = new();
    public UserParticipationDto? UserParticipation { get; set; }
}

public class ParticipantSummaryDto
{
    public string UserName { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public string? Avatar { get; set; }
}

public class UserParticipationDto
{
    public Guid Id { get; set; }
    public bool DepositPaid { get; set; }
    public decimal DepositAmount { get; set; }
    public DateTime? DepositPaidAt { get; set; }
    public bool FinalPaymentPaid { get; set; }
    public decimal FinalPaymentAmount { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Campaigns/CreateCampaignDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Campaigns;

public class CreateCampaignDto
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
}
```

---

## File: `src/GroupBuy.Application/DTOs/Campaigns/UpdateCampaignDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Campaigns;

public class UpdateCampaignDto : CreateCampaignDto
{
    public Guid Id { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Campaigns/CampaignListResponseDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Campaigns;

public class CampaignListResponseDto
{
    public bool Success { get; set; }
    public List<CampaignDto> Data { get; set; } = new();
    public PaginationDto Pagination { get; set; } = new();
}

public class PaginationDto
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
    public int ItemsPerPage { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Payments/JoinCampaignDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Payments;

public class JoinCampaignDto
{
    public PaymentProvider PaymentProvider { get; set; }
    public string PaymentToken { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/DTOs/Payments/PayFinalDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Payments;

public class PayFinalDto
{
    public PaymentProvider PaymentProvider { get; set; }
    public string PaymentToken { get; set; } = string.Empty;
}
```

---

## File: `src/GroupBuy.Application/DTOs/Payments/PaymentDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Payments;

public class PaymentDto
{
    public Guid Id { get; set; }
    public CampaignSummaryDto Campaign { get; set; } = new();
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public PaymentStatus Status { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CampaignSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Participations/ParticipationDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Participations;

public class ParticipationDto
{
    public Guid Id { get; set; }
    public CampaignParticipationDto Campaign { get; set; } = new();
    public bool DepositPaid { get; set; }
    public decimal DepositAmount { get; set; }
    public DateTime? DepositPaidAt { get; set; }
    public bool FinalPaymentPaid { get; set; }
    public decimal FinalPaymentAmount { get; set; }
    public ParticipantStatus Status { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class CampaignParticipationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public CampaignStatus Status { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Admin/AdminDashboardStatsDto.cs`

```csharp
namespace GroupBuy.Application.DTOs.Admin;

public class AdminDashboardStatsDto
{
    public int TotalCampaigns { get; set; }
    public int ActiveCampaigns { get; set; }
    public int SuccessfulCampaigns { get; set; }
    public int FailedCampaigns { get; set; }
    public double SuccessRate { get; set; }
    public int TotalUsers { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingRefunds { get; set; }
    public int CampaignsEndingSoon { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Notifications/NotificationDto.cs`

```csharp
using GroupBuy.Domain.Enums;

namespace GroupBuy.Application.DTOs.Notifications;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid? CampaignId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

## File: `src/GroupBuy.Application/DTOs/Common/ApiResponse.cs`

```csharp
namespace GroupBuy.Application.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public ErrorDetails? Error { get; set; }

    public static ApiResponse<T> SuccessResult(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ApiResponse<T> FailureResult(string code, string message, object? details = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = new ErrorDetails
            {
                Code = code,
                Message = message,
                Details = details
            }
        };
    }
}

public class ErrorDetails
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? Details { get; set; }
}
```

---

## Summary

DTOs created for:
- ✅ Authentication (register, login, password reset)
- ✅ Campaigns (list, detail, create, update)
- ✅ Payments (join campaign, final payment)
- ✅ Participations
- ✅ Admin dashboard
- ✅ Notifications
- ✅ Common response wrappers

**Next**: CQRS Commands and Queries with MediatR.
