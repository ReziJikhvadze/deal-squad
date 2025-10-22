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
