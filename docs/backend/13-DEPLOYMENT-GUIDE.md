# Complete Deployment Guide

## 🌐 Deployment Options Comparison

| Provider | Monthly Cost | Difficulty | Best For |
|----------|-------------|------------|----------|
| **Railway.app** | $5-20 | ⭐ Easy | Beginners, MVP |
| **DigitalOcean** | $12-25 | ⭐⭐ Medium | Growing apps |
| **Azure** | $50-100 | ⭐⭐⭐ Hard | Enterprise |
| **AWS** | $30-80 | ⭐⭐⭐ Hard | Scalability |
| **VPS (Hetzner)** | $5-10 | ⭐⭐⭐⭐ Expert | Cost-conscious |

---

## Option 1: Railway.app (EASIEST) ⭐ Recommended for Beginners

### Why Railway?
- ✅ Simplest deployment
- ✅ Automatic PostgreSQL setup
- ✅ Free trial with $5 credit
- ✅ Git-based deployment
- ✅ Built-in environment variables

### Step-by-Step Railway Deployment

#### 1. Prepare Your Project
```bash
# Add .gitignore to exclude
echo "appsettings.Development.json" >> .gitignore
echo "bin/" >> .gitignore
echo "obj/" >> .gitignore

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
gh repo create GroupBuy-Backend --public
git remote add origin https://github.com/YOUR_USERNAME/GroupBuy-Backend.git
git push -u origin main
```

#### 2. Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `GroupBuy-Backend` repository
5. Railway will detect .NET project automatically

#### 3. Add PostgreSQL Database
1. In your project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Wait for provisioning (2 minutes)
4. Railway automatically connects your API to the database

#### 4. Configure Environment Variables
1. Click on your API service
2. Go to "Variables" tab
3. Add these variables:

```
ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
Jwt__Secret=your-super-secret-jwt-key-at-least-32-characters-long
Jwt__Issuer=GroupBuyAPI
Jwt__Audience=GroupBuyClient
PayPal__Environment=Sandbox
PayPal__ClientId=YOUR_PAYPAL_CLIENT_ID
PayPal__ClientSecret=YOUR_PAYPAL_SECRET
Email__FromAddress=noreply@yourdomain.com
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__Username=your-email@gmail.com
Email__Password=your-gmail-app-password
```

#### 5. Deploy
1. Railway auto-deploys on every push
2. Check "Deployments" tab for build logs
3. Your API URL will be: `https://groupbuy-backend.up.railway.app`

#### 6. Run Migrations
```bash
# Connect to Railway database
railway link
railway run dotnet ef database update --project src/GroupBuy.API
```

✅ **Done!** Your API is live at Railway-provided URL.

---

## Option 2: DigitalOcean App Platform (MEDIUM)

### Cost: ~$12/month

### Step-by-Step DigitalOcean Deployment

#### 1. Create Account
1. Go to https://www.digitalocean.com/
2. Sign up (get $200 free credit for 60 days)

#### 2. Create PostgreSQL Database
1. Click "Create" → "Databases"
2. Choose "PostgreSQL 15"
3. Select "$12/month" plan
4. Choose region closest to your users
5. Name it `groupbuy-db`
6. Click "Create Database"

#### 3. Create App
1. Click "Create" → "Apps"
2. Connect your GitHub repository
3. DigitalOcean detects .NET app
4. Choose "$5/month" plan for API
5. Click "Next"

#### 4. Configure Environment Variables
Add to App settings:
```
CONNECTION_STRING=postgresql://user:pass@db-host:25060/groupbuy?sslmode=require
JWT_SECRET=your-jwt-secret
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
```

#### 5. Deploy
- DigitalOcean builds and deploys automatically
- Your API: `https://groupbuy-api-xxxxx.ondigitalocean.app`

#### 6. Run Migrations
```bash
# Get database connection string from DigitalOcean dashboard
export CONNECTION_STRING="your-do-db-connection-string"

# Run migrations
dotnet ef database update --project src/GroupBuy.API --connection "$CONNECTION_STRING"
```

---

## Option 3: Azure App Service (ENTERPRISE)

### Cost: ~$50-100/month

### Prerequisites
- Azure account (https://azure.microsoft.com/free/)
- Azure CLI installed

### Step-by-Step Azure Deployment

#### 1. Install Azure CLI
```bash
# Windows (run as admin)
winget install Microsoft.AzureCLI

# Mac
brew install azure-cli

# Login
az login
```

#### 2. Create Resource Group
```bash
az group create --name groupbuy-rg --location eastus
```

#### 3. Create PostgreSQL Database
```bash
az postgres flexible-server create \
  --resource-group groupbuy-rg \
  --name groupbuy-db-server \
  --location eastus \
  --admin-user dbadmin \
  --admin-password "YourStrongP@ssw0rd!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15
```

#### 4. Create App Service Plan
```bash
az appservice plan create \
  --name groupbuy-plan \
  --resource-group groupbuy-rg \
  --sku B1 \
  --is-linux
```

#### 5. Create Web App
```bash
az webapp create \
  --resource-group groupbuy-rg \
  --plan groupbuy-plan \
  --name groupbuy-api \
  --runtime "DOTNET|8.0"
```

#### 6. Configure App Settings
```bash
az webapp config appsettings set \
  --resource-group groupbuy-rg \
  --name groupbuy-api \
  --settings \
    ConnectionStrings__DefaultConnection="Host=groupbuy-db-server.postgres.database.azure.com;Database=groupbuy_db;Username=dbadmin;Password=YourStrongP@ssw0rd!;SslMode=Require" \
    Jwt__Secret="your-jwt-secret" \
    PayPal__ClientId="xxx"
```

#### 7. Deploy Application
```bash
cd src/GroupBuy.API
dotnet publish -c Release

# Deploy
az webapp deployment source config-zip \
  --resource-group groupbuy-rg \
  --name groupbuy-api \
  --src bin/Release/net8.0/publish.zip
```

#### 8. Run Migrations
```bash
# Update connection string in appsettings.json to Azure DB
dotnet ef database update --project src/GroupBuy.API
```

---

## Option 4: Your Own VPS (EXPERT)

### Cost: $5-10/month (Hetzner, OVH, Contabo)

### Example: Hetzner Cloud

#### 1. Create Server
1. Go to https://www.hetzner.com/cloud
2. Create account
3. Create new project
4. Add server: Ubuntu 22.04, 2GB RAM ($5/month)
5. Note the IP address

#### 2. Connect to Server
```bash
ssh root@YOUR_SERVER_IP
```

#### 3. Install Prerequisites
```bash
# Update system
apt update && apt upgrade -y

# Install .NET 8
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
apt update
apt install -y dotnet-sdk-8.0

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
apt install -y nginx
```

#### 4. Setup PostgreSQL
```bash
sudo -u postgres psql

CREATE DATABASE groupbuy_db;
CREATE USER groupbuy WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE groupbuy_db TO groupbuy;
\q
```

#### 5. Deploy Application
```bash
# Create app directory
mkdir -p /var/www/groupbuy-api

# Copy your published files (from local machine)
scp -r bin/Release/net8.0/publish/* root@YOUR_SERVER_IP:/var/www/groupbuy-api/

# Run migrations (on server)
cd /var/www/groupbuy-api
dotnet ef database update
```

#### 6. Create Systemd Service
```bash
nano /etc/systemd/system/groupbuy.service
```

```ini
[Unit]
Description=GroupBuy .NET API

[Service]
WorkingDirectory=/var/www/groupbuy-api
ExecStart=/usr/bin/dotnet /var/www/groupbuy-api/GroupBuy.API.dll
Restart=always
RestartSec=10
SyslogIdentifier=groupbuy-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable groupbuy
systemctl start groupbuy
systemctl status groupbuy
```

#### 7. Configure Nginx
```bash
nano /etc/nginx/sites-available/groupbuy
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/groupbuy /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 8. Setup SSL (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## React Frontend Deployment

### Update API URL in React
```typescript
// src/config/api.ts
const API_BASE_URL = import.meta.env.PROD
  ? "https://your-api-domain.com/api"
  : "http://localhost:5000/api";
```

### Deploy Frontend to Vercel (Free)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd your-react-app
vercel --prod
```

Or use:
- **Netlify** (free)
- **Vercel** (free)
- **Railway** (cheap)
- **DigitalOcean App Platform** ($5/month)

---

## Post-Deployment Checklist

- [ ] API is accessible via HTTPS
- [ ] Database connection works
- [ ] Migrations applied successfully
- [ ] JWT authentication working
- [ ] Test user registration
- [ ] Test user login
- [ ] Test campaign creation
- [ ] PayPal sandbox working
- [ ] Email notifications sending
- [ ] Hangfire dashboard accessible
- [ ] React app connected to API
- [ ] CORS configured correctly

---

## Recommended Deployment Path

**For Beginners:**
1. Start with **Railway.app** ($5/month) - Deploy in 10 minutes
2. Test everything
3. Move to DigitalOcean if you need more control

**For Production:**
1. **DigitalOcean** ($17/month) - Best balance of simplicity and features
2. Setup monitoring (UptimeRobot, free)
3. Setup backups (DigitalOcean automated backups, $2/month)

**For Enterprise:**
1. **Azure** or **AWS** - Full features, scalability
2. Setup CI/CD pipelines
3. Use Azure AD B2C for enterprise auth

---

## Need Help?

Common issues and solutions documented at each step. Follow the deployment option that matches your technical skill level!
