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
    /// Get all users with optional filters
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<List<UserDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers([FromQuery] bool? isBanned = null)
    {
        var query = new GetAllUsersQuery { IsBanned = isBanned };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Ban a user
    /// </summary>
    [HttpPost("users/{userId}/ban")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BanUser(Guid userId)
    {
        var command = new BanUserCommand { UserId = userId };
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Unban a user
    /// </summary>
    [HttpPost("users/{userId}/unban")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        var command = new UnbanUserCommand { UserId = userId };
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Force cancel a campaign (admin override)
    /// </summary>
    [HttpPost("campaigns/{campaignId}/cancel")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AdminCancelCampaign(Guid campaignId, [FromBody] AdminCancelCampaignCommand command)
    {
        command.CampaignId = campaignId;
        var result = await _mediator.Send(command);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get all payments across the platform
    /// </summary>
    [HttpGet("payments")]
    [ProducesResponseType(typeof(ApiResponse<List<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPayments()
    {
        var query = new GetAllPaymentsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
