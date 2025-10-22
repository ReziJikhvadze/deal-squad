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
