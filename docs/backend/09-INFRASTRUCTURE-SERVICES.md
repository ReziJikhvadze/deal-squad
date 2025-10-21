# GroupBuy Backend - Infrastructure Services (Email, JWT, etc.)

## Email Service (MailKit)

```csharp
// src/GroupBuy.Infrastructure/Services/EmailService.cs
using GroupBuy.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;

namespace GroupBuy.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration) => _configuration = configuration;

    public async Task SendWelcomeEmailAsync(string toEmail, string userName, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Welcome to GroupBuy!", 
            $"<h1>Welcome {userName}!</h1><p>Thank you for joining GroupBuy.</p>", ct);
    }

    public async Task SendDepositConfirmationAsync(string toEmail, string campaignTitle, decimal amount, CancellationToken ct = default)
    {
        await SendEmailAsync(toEmail, "Deposit Confirmed", 
            $"<h1>Payment Received</h1><p>Your deposit of ${amount} for '{campaignTitle}' has been confirmed.</p>", ct);
    }

    // Implement other email methods similarly...

    private async Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken ct)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("GroupBuy", _configuration["Email:FromAddress"]));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_configuration["Email:SmtpHost"], 
            int.Parse(_configuration["Email:SmtpPort"]!), true, ct);
        await smtp.AuthenticateAsync(_configuration["Email:Username"], 
            _configuration["Email:Password"], ct);
        await smtp.SendAsync(message, ct);
        await smtp.DisconnectAsync(true, ct);
    }
}
```

## JWT Token Service

```csharp
// src/GroupBuy.Infrastructure/Services/TokenService.cs
using GroupBuy.Application.Interfaces;
using GroupBuy.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GroupBuy.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;

    public TokenService(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string> GeneratePasswordResetTokenAsync(Guid userId, CancellationToken ct = default)
    {
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            Used = false
        };
        await _unitOfWork.PasswordResetTokens.AddAsync(resetToken, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return token;
    }

    // Implement validation methods...
}
```
