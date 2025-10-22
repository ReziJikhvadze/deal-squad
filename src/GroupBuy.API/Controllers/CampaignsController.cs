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
