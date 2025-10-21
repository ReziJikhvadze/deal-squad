# GroupBuy Backend - All Controllers

## Overview
Complete REST API controllers for all features.

---

## File: `src/GroupBuy.API/Controllers/AuthController.cs`

```csharp
using GroupBuy.Application.Commands;
using GroupBuy.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var query = new GetCurrentUserQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Update user profile
    /// </summary>
    [Authorize]
    [HttpPut("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Request password reset
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
```

---

## File: `src/GroupBuy.API/Controllers/CampaignsController.cs`

```csharp
using GroupBuy.Application.Commands;
using GroupBuy.Application.DTOs;
using GroupBuy.Application.Queries;
using GroupBuy.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CampaignsController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Get all campaigns with filters and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<CampaignListResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCampaigns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] CampaignStatus? status = null,
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var query = new GetCampaignsQuery
        {
            Page = page,
            PageSize = pageSize,
            Status = status,
            Category = category,
            SearchTerm = search
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get campaign details by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CampaignDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCampaignById(Guid id)
    {
        var query = new GetCampaignByIdQuery { CampaignId = id };
        var result = await _mediator.Send(query);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new campaign
    /// </summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CampaignDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.Success)
        {
            return CreatedAtAction(nameof(GetCampaignById), new { id = result.Data.Id }, result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Update campaign details
    /// </summary>
    [Authorize]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CampaignDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateCampaign(Guid id, [FromBody] UpdateCampaignCommand command)
    {
        command.CampaignId = id;
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Cancel a campaign (creator only)
    /// </summary>
    [Authorize]
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelCampaign(Guid id)
    {
        var command = new CancelCampaignCommand { CampaignId = id };
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Finalize campaign (creator only, after reaching minimum participants)
    /// </summary>
    [Authorize]
    [HttpPost("{id}/finalize")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> FinalizeCampaign(Guid id)
    {
        var command = new FinalizeCampaignCommand { CampaignId = id };
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get campaigns created by current user
    /// </summary>
    [Authorize]
    [HttpGet("my-campaigns")]
    [ProducesResponseType(typeof(ApiResponse<List<CampaignDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCampaigns()
    {
        var query = new GetMyCampaignsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get campaign participants
    /// </summary>
    [HttpGet("{id}/participants")]
    [ProducesResponseType(typeof(ApiResponse<List<ParticipantSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCampaignParticipants(Guid id)
    {
        var query = new GetCampaignParticipantsQuery { CampaignId = id };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

---

## File: `src/GroupBuy.API/Controllers/ParticipationsController.cs`

```csharp
using GroupBuy.Application.Commands;
using GroupBuy.Application.DTOs;
using GroupBuy.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ParticipationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ParticipationsController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Join a campaign (pay deposit)
    /// </summary>
    [HttpPost("join")]
    [ProducesResponseType(typeof(ApiResponse<ParticipationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> JoinCampaign([FromBody] JoinCampaignCommand command)
    {
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Pay final amount for a campaign
    /// </summary>
    [HttpPost("pay-final")]
    [ProducesResponseType(typeof(ApiResponse<ParticipationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> PayFinal([FromBody] PayFinalCommand command)
    {
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Leave a campaign (before finalization)
    /// </summary>
    [HttpPost("{participationId}/leave")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> LeaveCampaign(Guid participationId)
    {
        var command = new LeaveCampaignCommand { ParticipationId = participationId };
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get all participations for current user
    /// </summary>
    [HttpGet("my-participations")]
    [ProducesResponseType(typeof(ApiResponse<List<UserParticipationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyParticipations()
    {
        var query = new GetMyParticipationsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get participation details
    /// </summary>
    [HttpGet("{participationId}")]
    [ProducesResponseType(typeof(ApiResponse<ParticipationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetParticipation(Guid participationId)
    {
        var query = new GetParticipationQuery { ParticipationId = participationId };
        var result = await _mediator.Send(query);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
```

---

## File: `src/GroupBuy.API/Controllers/PaymentsController.cs`

```csharp
using GroupBuy.Application.DTOs;
using GroupBuy.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Get payment history for current user
    /// </summary>
    [HttpGet("my-payments")]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyPayments()
    {
        var query = new GetMyPaymentsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get payment details by ID
    /// </summary>
    [HttpGet("{paymentId}")]
    [ProducesResponseType(typeof(ApiResponse<PaymentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPayment(Guid paymentId)
    {
        var query = new GetPaymentQuery { PaymentId = paymentId };
        var result = await _mediator.Send(query);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get payments for a specific campaign
    /// </summary>
    [HttpGet("campaign/{campaignId}")]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCampaignPayments(Guid campaignId)
    {
        var query = new GetCampaignPaymentsQuery { CampaignId = campaignId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

---

## File: `src/GroupBuy.API/Controllers/NotificationsController.cs`

```csharp
using GroupBuy.Application.Commands;
using GroupBuy.Application.DTOs;
using GroupBuy.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Get all notifications for current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications([FromQuery] bool? unreadOnly = null)
    {
        var query = new GetNotificationsQuery { UnreadOnly = unreadOnly };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    [HttpPut("{notificationId}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        var command = new MarkNotificationAsReadCommand { NotificationId = notificationId };
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var command = new MarkAllNotificationsAsReadCommand();
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{notificationId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteNotification(Guid notificationId)
    {
        var command = new DeleteNotificationCommand { NotificationId = notificationId };
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Get unread notification count
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var query = new GetUnreadNotificationCountQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

---

## File: `src/GroupBuy.API/Controllers/AdminController.cs`

```csharp
using GroupBuy.Application.Commands;
using GroupBuy.Application.DTOs;
using GroupBuy.Application.Queries;
using GroupBuy.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<AdminDashboardStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStats()
    {
        var query = new GetDashboardStatsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<List<UserDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = new GetAllUsersQuery { Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Ban/suspend a user
    /// </summary>
    [HttpPost("users/{userId}/ban")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> BanUser(Guid userId)
    {
        var command = new BanUserCommand { UserId = userId };
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Unban a user
    /// </summary>
    [HttpPost("users/{userId}/unban")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        var command = new UnbanUserCommand { UserId = userId };
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Force cancel a campaign
    /// </summary>
    [HttpPost("campaigns/{campaignId}/force-cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForceCancelCampaign(Guid campaignId)
    {
        var command = new AdminCancelCampaignCommand { CampaignId = campaignId };
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Get all payments (admin overview)
    /// </summary>
    [HttpGet("payments")]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPayments([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = new GetAllPaymentsQuery { Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

---

## Summary

All controllers are now complete with:

✅ **AuthController** - Registration, login, profile management
✅ **CampaignsController** - CRUD operations, filtering, finalization
✅ **ParticipationsController** - Join, pay, leave campaigns
✅ **PaymentsController** - Payment history and tracking
✅ **NotificationsController** - User notifications
✅ **AdminController** - Admin dashboard and management

Each endpoint includes:
- Proper HTTP methods
- Authorization where needed
- Swagger documentation
- Response type definitions
- Error handling

**Next**: Create the corresponding Commands/Queries and Handlers in Application layer.
