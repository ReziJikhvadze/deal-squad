# Complete Setup Guide - GroupBuy Backend

## Quick Answers to Your Questions

### ❓ Do I need Azure Cloud?
**NO, not required!** You have 3 deployment options:
1. **Local development** (start here)
2. **Any cloud provider** (Azure, AWS, DigitalOcean, etc.)
3. **Your own server**

### ❓ Do I need PostgreSQL?
**YES** - PostgreSQL is your database. You need it both for:
- Local development (on your computer)
- Production (on your server/cloud)

### ❓ Do I need Azure AD B2C?
**NO, optional!** 
- **Start with JWT authentication** (email/password) - already included
- Add Azure AD B2C later only if you need enterprise SSO (Single Sign-On)

---

## 🚀 Step-by-Step Setup

### PART 1: Install Prerequisites (Your Computer)

#### Step 1.1: Install .NET 8 SDK
1. Go to: https://dotnet.microsoft.com/download/dotnet/8.0
2. Download ".NET 8 SDK" for your OS
3. Install it
4. Verify: Open terminal/command prompt and run:
   ```bash
   dotnet --version
   # Should show: 8.0.x
   ```

#### Step 1.2: Install PostgreSQL
1. Go to: https://www.postgresql.org/download/
2. Download PostgreSQL 15 or 16 for your OS
3. During installation:
   - **Remember the password you set for 'postgres' user!**
   - Default port: 5432 (keep it)
   - Install "pgAdmin" (GUI tool for managing database)
4. After installation, open **pgAdmin** and verify it works

#### Step 1.3: Install Visual Studio or VS Code
- **Option A (Recommended)**: Visual Studio 2022 Community (Free)
  - Download: https://visualstudio.microsoft.com/downloads/
  - Select "ASP.NET and web development" workload
  
- **Option B**: Visual Studio Code
  - Download: https://code.visualstudio.com/
  - Install C# extension

---

### PART 2: Create Your .NET Backend

#### Step 2.1: Create Solution Structure
```bash
# Create a folder for your backend
mkdir GroupBuy-Backend
cd GroupBuy-Backend

# Create solution
dotnet new sln -n GroupBuy

# Create projects (one by one)
dotnet new classlib -n GroupBuy.Domain -o src/GroupBuy.Domain
dotnet new classlib -n GroupBuy.Application -o src/GroupBuy.Application
dotnet new classlib -n GroupBuy.Infrastructure -o src/GroupBuy.Infrastructure
dotnet new webapi -n GroupBuy.API -o src/GroupBuy.API

# Add projects to solution
dotnet sln add src/GroupBuy.Domain/GroupBuy.Domain.csproj
dotnet sln add src/GroupBuy.Application/GroupBuy.Application.csproj
dotnet sln add src/GroupBuy.Infrastructure/GroupBuy.Infrastructure.csproj
dotnet sln add src/GroupBuy.API/GroupBuy.API.csproj

# Add project references
cd src/GroupBuy.Application
dotnet add reference ../GroupBuy.Domain/GroupBuy.Domain.csproj

cd ../GroupBuy.Infrastructure
dotnet add reference ../GroupBuy.Domain/GroupBuy.Domain.csproj
dotnet add reference ../GroupBuy.Application/GroupBuy.Application.csproj

cd ../GroupBuy.API
dotnet add reference ../GroupBuy.Application/GroupBuy.Application.csproj
dotnet add reference ../GroupBuy.Infrastructure/GroupBuy.Infrastructure.csproj

cd ../..
```

#### Step 2.2: Install NuGet Packages

**See `docs/backend/01-PROJECT-STRUCTURE.md`** for all packages to install in each project.

Quick install script:
```bash
# Domain (no packages needed)

# Application
cd src/GroupBuy.Application
dotnet add package MediatR
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package AutoMapper
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package Microsoft.AspNetCore.Identity

# Infrastructure
cd ../GroupBuy.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package MailKit
dotnet add package Hangfire
dotnet add package Hangfire.PostgreSql
dotnet add package PayPalCheckoutSdk
dotnet add package Microsoft.AspNetCore.Identity

# API
cd ../GroupBuy.API
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Hangfire.AspNetCore
cd ../..
```

#### Step 2.3: Copy All Code from Documentation
Open each documentation file and copy the code:
1. `02-DOMAIN-LAYER.md` → Copy to `src/GroupBuy.Domain/`
2. `03-APPLICATION-LAYER-INTERFACES.md` → Copy to `src/GroupBuy.Application/Interfaces/`
3. `04-APPLICATION-LAYER-DTOS.md` → Copy to `src/GroupBuy.Application/DTOs/`
4. `05-APPLICATION-LAYER-CQRS.md` → Copy to `src/GroupBuy.Application/Commands/` and `Queries/`
5. `06-APPLICATION-LAYER-VALIDATORS.md` → Copy to `src/GroupBuy.Application/Validators/`
6. `07-INFRASTRUCTURE-LAYER-DATABASE.md` → Copy to `src/GroupBuy.Infrastructure/Data/`
7. `08-INFRASTRUCTURE-LAYER-PAYMENTS.md` → Copy to `src/GroupBuy.Infrastructure/Payments/`
8. `09-INFRASTRUCTURE-SERVICES.md` → Copy to `src/GroupBuy.Infrastructure/Services/`
9. `10-API-LAYER-SETUP.md` → Update `src/GroupBuy.API/Program.cs`
10. `11-CONTROLLERS.md` → Copy to `src/GroupBuy.API/Controllers/`

---

### PART 3: Configure Database

#### Step 3.1: Create Database
1. Open **pgAdmin**
2. Connect to PostgreSQL (use the password you set during installation)
3. Right-click "Databases" → Create → Database
4. Name: `groupbuy_db`
5. Click "Save"

#### Step 3.2: Update appsettings.json
Open `src/GroupBuy.API/appsettings.json` and update:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=groupbuy_db;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-must-be-at-least-32-characters-long",
    "Issuer": "GroupBuyAPI",
    "Audience": "GroupBuyClient"
  },
  "PayPal": {
    "Environment": "Sandbox",
    "ClientId": "YOUR_PAYPAL_CLIENT_ID",
    "ClientSecret": "YOUR_PAYPAL_CLIENT_SECRET"
  },
  "VisaMasterCard": {
    "MerchantId": "YOUR_MERCHANT_ID_FROM_BANK",
    "ApiKey": "YOUR_API_KEY_FROM_BANK",
    "GatewayUrl": "YOUR_BANK_GATEWAY_URL"
  },
  "Email": {
    "FromAddress": "noreply@groupbuy.com",
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "Username": "your-email@gmail.com",
    "Password": "your-gmail-app-password"
  }
}
```

**Replace:**
- `YOUR_POSTGRES_PASSWORD` with your PostgreSQL password
- `your-super-secret-key...` with a random 32+ character string
- PayPal credentials (get from PayPal Developer Dashboard)
- Visa/MasterCard: **Leave as is until bank gives you credentials**
- Email: Use your Gmail credentials (need app password, not regular password)

---

### PART 4: Run Migrations

#### Step 4.1: Create Initial Migration
```bash
cd src/GroupBuy.Infrastructure
dotnet ef migrations add InitialCreate --startup-project ../GroupBuy.API --output-dir Data/Migrations
```

This creates migration files based on your entities.

#### Step 4.2: Apply Migration to Database
```bash
dotnet ef database update --startup-project ../GroupBuy.API
```

This creates all tables in your `groupbuy_db` database.

#### Step 4.3: Verify Database
1. Open **pgAdmin**
2. Navigate to: Databases → groupbuy_db → Schemas → public → Tables
3. You should see: users, campaigns, campaign_participants, payments, notifications, password_reset_tokens

---

### PART 5: Test Locally

#### Step 5.1: Run the API
```bash
cd src/GroupBuy.API
dotnet run
```

You should see:
```
Now listening on: https://localhost:7001
Now listening on: http://localhost:5000
```

#### Step 5.2: Test with Swagger
1. Open browser: http://localhost:5000/swagger
2. You'll see all API endpoints
3. Try `/api/auth/register` to create a test user

#### Step 5.3: Update React Frontend
In your React app, update API base URL:
```typescript
const API_BASE_URL = "http://localhost:5000/api";
```

---

## 🌐 DEPLOYMENT OPTIONS

### Option 1: Azure (Microsoft Cloud)
**Cost**: ~$50-100/month for small app

**Steps:**
1. Create Azure account: https://azure.microsoft.com/free/
2. Install Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli
3. Deploy API to Azure App Service
4. Deploy PostgreSQL to Azure Database for PostgreSQL
5. Update React app API URL to Azure endpoint

**Pros**: Easy integration, good .NET support
**Cons**: Can be expensive

### Option 2: DigitalOcean (Recommended for beginners)
**Cost**: ~$12-25/month

**Steps:**
1. Create account: https://www.digitalocean.com/
2. Create a Droplet (Ubuntu server)
3. Install .NET 8, PostgreSQL on the droplet
4. Deploy your API
5. Use DigitalOcean App Platform for React frontend

**Pros**: Cheaper, simpler pricing
**Cons**: More manual setup

### Option 3: Railway.app (Easiest)
**Cost**: ~$5-20/month

**Steps:**
1. Create account: https://railway.app/
2. Connect GitHub repo
3. Add PostgreSQL database (one click)
4. Deploy API (automatic)

**Pros**: Simplest deployment, cheap
**Cons**: Limited customization

### Option 4: Your Own Server (Cheapest)
**Cost**: $5-10/month VPS

**Steps:**
1. Rent VPS from Hetzner/OVH/Contabo
2. Install Ubuntu, .NET 8, PostgreSQL, Nginx
3. Deploy manually

**Pros**: Cheapest, full control
**Cons**: Requires server management knowledge

---

## 🔄 BACKGROUND JOBS EXPLAINED

Background jobs run automatically without user interaction.

### What You Need:

#### 1. **Campaign Status Updates**
Every 5 minutes, check:
- If campaign reached end date → Mark as "Expired" or "Successful"
- If campaign reached minimum participants → Allow finalization
- Send notifications to participants

#### 2. **Payment Reminders**
Every day at 9 AM:
- Check for unpaid final payments
- Send reminder emails to participants
- Cancel participation after 7 days of no payment

#### 3. **Refund Processing**
Every hour:
- Check for failed campaigns
- Process automatic refunds
- Update participant statuses

#### 4. **Database Cleanup**
Every week:
- Delete expired password reset tokens
- Archive old campaigns
- Clean up old notifications

**Implementation**: See `docs/backend/12-BACKGROUND-JOBS.md` (will be created)

---

## 🔐 AZURE AD B2C - DO YOU NEED IT?

### What is it?
Azure AD B2C = Enterprise authentication (like "Login with Microsoft")

### Do you need it?
**NO, if:**
- Your users create accounts with email/password ✅ (You already have this)
- You use Google/Facebook OAuth (can add easily)

**YES, if:**
- Your customers are **businesses** (B2B)
- They want to use their company Microsoft accounts
- You need enterprise SSO features

### Recommendation:
**Start without it!** You already have JWT authentication. Add Azure AD B2C later only if customers request it.

---

## 📝 NEXT STEPS

1. ✅ Install prerequisites (PostgreSQL, .NET 8)
2. ✅ Create .NET solution
3. ✅ Copy all code from documentation
4. ✅ Configure appsettings.json
5. ✅ Run migrations
6. ✅ Test locally
7. ⏳ Generate controllers (I'll do this next)
8. ⏳ Test with React frontend
9. ⏳ Choose deployment option
10. ⏳ Deploy and launch!

---

## 🆘 Common Issues

### "Connection refused" error
- Check PostgreSQL is running
- Verify password in appsettings.json
- Check port 5432 is not blocked

### "Migration failed"
- Delete `Migrations` folder
- Run `dotnet ef database drop` to start fresh
- Create migration again

### "Package not found"
- Run `dotnet restore` in each project
- Check internet connection
- Verify NuGet package names

---

Need help with any step? Just ask!
