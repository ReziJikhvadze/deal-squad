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
