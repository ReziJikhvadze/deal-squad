# GroupBuy Backend - Background Jobs with Hangfire

## Overview
Automated tasks that run on schedule using Hangfire.

---

## File: `src/GroupBuy.Infrastructure/BackgroundJobs/CampaignStatusJob.cs`

```csharp
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace GroupBuy.Infrastructure.BackgroundJobs;

public class CampaignStatusJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly ILogger<CampaignStatusJob> _logger;

    public CampaignStatusJob(
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        ILogger<CampaignStatusJob> logger)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task ProcessExpiredCampaigns()
    {
        _logger.LogInformation("Starting expired campaigns check...");

        // Find campaigns that have passed end date but still active
        var expiredCampaigns = await _unitOfWork.Campaigns.FindAsync(c =>
            c.EndDate < DateTime.UtcNow &&
            c.Status == CampaignStatus.Active);

        foreach (var campaign in expiredCampaigns)
        {
            var participantCount = await _unitOfWork.CampaignParticipants.CountAsync(
                p => p.CampaignId == campaign.Id && p.Status == ParticipantStatus.Active);

            if (participantCount >= campaign.MinimumParticipants)
            {
                // Campaign succeeded - notify creator to finalize
                campaign.Status = CampaignStatus.Successful;
                await _notificationService.NotifyCampaignSuccessfulAsync(campaign.Id);
                _logger.LogInformation($"Campaign {campaign.Id} marked as successful");
            }
            else
            {
                // Campaign failed - process refunds
                campaign.Status = CampaignStatus.Failed;
                await ProcessRefundsAsync(campaign.Id);
                _logger.LogInformation($"Campaign {campaign.Id} marked as failed, refunds initiated");
            }

            await _unitOfWork.UpdateAsync(campaign);
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation($"Processed {expiredCampaigns.Count()} expired campaigns");
    }

    private async Task ProcessRefundsAsync(Guid campaignId)
    {
        var participants = await _unitOfWork.CampaignParticipants.FindAsync(
            p => p.CampaignId == campaignId && p.Status == ParticipantStatus.Active);

        foreach (var participant in participants)
        {
            // Mark for refund processing
            participant.Status = ParticipantStatus.Refunded;
            await _notificationService.NotifyRefundProcessingAsync(participant.UserId, campaignId);
        }
    }
}
```

---

## File: `src/GroupBuy.Infrastructure/BackgroundJobs/PaymentReminderJob.cs`

```csharp
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace GroupBuy.Infrastructure.BackgroundJobs;

public class PaymentReminderJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly ILogger<PaymentReminderJob> _logger;

    public PaymentReminderJob(
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        ILogger<PaymentReminderJob> logger)
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task SendFinalPaymentReminders()
    {
        _logger.LogInformation("Starting final payment reminders...");

        // Find finalized campaigns with pending final payments
        var campaigns = await _unitOfWork.Campaigns.FindAsync(c =>
            c.Status == CampaignStatus.Finalized);

        foreach (var campaign in campaigns)
        {
            var pendingParticipants = await _unitOfWork.CampaignParticipants.FindAsync(
                p => p.CampaignId == campaign.Id &&
                     p.Status == ParticipantStatus.Active &&
                     string.IsNullOrEmpty(p.FinalPaymentId));

            foreach (var participant in pendingParticipants)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(participant.UserId);
                if (user == null) continue;

                var daysSinceFinalization = (DateTime.UtcNow - campaign.UpdatedAt).Days;

                if (daysSinceFinalization == 1)
                {
                    // Send first reminder after 1 day
                    await _emailService.SendFinalPaymentReminderAsync(
                        user.Email,
                        user.FullName,
                        campaign.Title,
                        participant.FinalPaymentAmount,
                        campaign.Id);
                }
                else if (daysSinceFinalization == 5)
                {
                    // Send urgent reminder after 5 days
                    await _emailService.SendUrgentPaymentReminderAsync(
                        user.Email,
                        user.FullName,
                        campaign.Title,
                        participant.FinalPaymentAmount,
                        campaign.Id);
                }
                else if (daysSinceFinalization >= 7)
                {
                    // Cancel participation after 7 days
                    participant.Status = ParticipantStatus.Cancelled;
                    await _emailService.SendParticipationCancelledAsync(
                        user.Email,
                        user.FullName,
                        campaign.Title);
                    
                    _logger.LogWarning($"Cancelled participation for user {user.Id} in campaign {campaign.Id}");
                }
            }
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Final payment reminders completed");
    }
}
```

---

## File: `src/GroupBuy.Infrastructure/BackgroundJobs/DatabaseCleanupJob.cs`

```csharp
using GroupBuy.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace GroupBuy.Infrastructure.BackgroundJobs;

public class DatabaseCleanupJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DatabaseCleanupJob> _logger;

    public DatabaseCleanupJob(IUnitOfWork unitOfWork, ILogger<DatabaseCleanupJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task CleanupExpiredTokens()
    {
        _logger.LogInformation("Starting expired token cleanup...");

        var expiredTokens = await _unitOfWork.PasswordResetTokens.FindAsync(
            t => t.ExpiresAt < DateTime.UtcNow || t.Used);

        foreach (var token in expiredTokens)
        {
            await _unitOfWork.PasswordResetTokens.DeleteAsync(token);
        }

        var deletedCount = expiredTokens.Count();
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"Deleted {deletedCount} expired password reset tokens");
    }

    public async Task ArchiveOldNotifications()
    {
        _logger.LogInformation("Starting old notifications cleanup...");

        var oldDate = DateTime.UtcNow.AddMonths(-3);
        var oldNotifications = await _unitOfWork.Notifications.FindAsync(
            n => n.CreatedAt < oldDate && n.Read);

        foreach (var notification in oldNotifications)
        {
            await _unitOfWork.Notifications.DeleteAsync(notification);
        }

        var deletedCount = oldNotifications.Count();
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"Deleted {deletedCount} old notifications");
    }
}
```

---

## File: `src/GroupBuy.Infrastructure/BackgroundJobs/BackgroundJobScheduler.cs`

```csharp
using Hangfire;

namespace GroupBuy.Infrastructure.BackgroundJobs;

public static class BackgroundJobScheduler
{
    public static void ConfigureRecurringJobs()
    {
        // Check expired campaigns every 5 minutes
        RecurringJob.AddOrUpdate<CampaignStatusJob>(
            "check-expired-campaigns",
            job => job.ProcessExpiredCampaigns(),
            "*/5 * * * *"); // Every 5 minutes

        // Send payment reminders daily at 9 AM
        RecurringJob.AddOrUpdate<PaymentReminderJob>(
            "send-payment-reminders",
            job => job.SendFinalPaymentReminders(),
            "0 9 * * *"); // Daily at 9:00 AM

        // Cleanup expired tokens daily at 2 AM
        RecurringJob.AddOrUpdate<DatabaseCleanupJob>(
            "cleanup-expired-tokens",
            job => job.CleanupExpiredTokens(),
            "0 2 * * *"); // Daily at 2:00 AM

        // Archive old notifications weekly on Sunday at 3 AM
        RecurringJob.AddOrUpdate<DatabaseCleanupJob>(
            "archive-old-notifications",
            job => job.ArchiveOldNotifications(),
            "0 3 * * 0"); // Weekly on Sunday at 3:00 AM
    }
}
```

---

## Update Program.cs

Add to `src/GroupBuy.API/Program.cs` after `var app = builder.Build();`:

```csharp
// Configure background jobs
using GroupBuy.Infrastructure.BackgroundJobs;

// ... other code ...

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

// Schedule recurring jobs
BackgroundJobScheduler.ConfigureRecurringJobs();

app.Run();
```

---

## Authorization Filter for Hangfire Dashboard

```csharp
// src/GroupBuy.API/Infrastructure/HangfireAuthorizationFilter.cs
using Hangfire.Dashboard;

namespace GroupBuy.API.Infrastructure;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        
        // In development, allow all
        if (httpContext.Request.Host.Host.Contains("localhost"))
            return true;

        // In production, require authentication
        return httpContext.User.Identity?.IsAuthenticated == true &&
               httpContext.User.IsInRole("Admin");
    }
}
```

---

## Cron Schedule Examples

```
"*/5 * * * *"     - Every 5 minutes
"0 * * * *"       - Every hour
"0 9 * * *"       - Daily at 9:00 AM
"0 */6 * * *"     - Every 6 hours
"0 0 * * *"       - Daily at midnight
"0 0 * * 0"       - Weekly on Sunday
"0 0 1 * *"       - Monthly on the 1st
```

---

## Accessing Hangfire Dashboard

After starting your API, visit:
```
http://localhost:5000/hangfire
```

You can see:
- All recurring jobs
- Job execution history
- Failed jobs
- Retry failed jobs manually
- Trigger jobs immediately for testing

---

## Summary

Background jobs implemented:

✅ **Campaign Status Job** (every 5 minutes)
- Mark expired campaigns as Successful/Failed
- Initiate refunds for failed campaigns
- Notify participants

✅ **Payment Reminder Job** (daily at 9 AM)
- Send first reminder after 1 day
- Send urgent reminder after 5 days
- Cancel participation after 7 days

✅ **Database Cleanup Job** (daily/weekly)
- Delete expired password reset tokens
- Archive old read notifications

✅ **Hangfire Dashboard** - Monitor and manage jobs

All jobs run automatically without user interaction!
