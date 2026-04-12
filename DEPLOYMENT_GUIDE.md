# Railway Deployment Guide for DAGent

## Overview
This guide will help you deploy your DAGent application (MCP Agent + Next.js) on Railway.

## Prerequisites
- Railway account (free tier available)
- GitHub repository with your code
- All environment variables ready

## Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin prajinraj
```

## Step 2: Set Up Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" 
3. Select "Deploy from GitHub repo"
4. Choose your `vishakha-sharma21/tictechtoe` repository
5. Select the `prajinraj` branch

## Step 3: Configure Environment Variables
Railway will automatically detect your services. Set these environment variables:

### For MCP Agent Service:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dagent
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.railway.app
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### For Frontend Service:
```
NEXT_PUBLIC_MCP_AGENT_URL=https://your-mcp-agent-service.railway.app
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-app.railway.app
```

## Step 4: Configure Database
1. In Railway, click "Add Service"
2. Select "PostgreSQL"
3. Railway will provide a connection string
4. Update your MONGODB_URL with the Railway PostgreSQL connection

## Step 5: Update MCP Agent for PostgreSQL
Your MCP Agent currently uses MongoDB. For Railway, we'll use PostgreSQL:

Update `mcp_agent/app/routes/integrations.py`:
```python
# Replace MongoDB with PostgreSQL
import asyncpg

# Update connection logic
async def get_db_connection():
    return await asyncpg.connect(DATABASE_URL)
```

## Step 6: Deploy
1. Click "Deploy" on each service
2. Railway will build and deploy your containers
3. Wait for deployment to complete

## Step 7: Test Your Application
1. Railway will provide URLs for both services
2. Test the frontend URL
3. Test OAuth integrations
4. Test MCP agent endpoints

## Troubleshooting

### Common Issues:
1. **Build failures**: Check Dockerfile and dependencies
2. **Environment variables**: Ensure all required vars are set
3. **Database connection**: Verify PostgreSQL connection string
4. **Port conflicts**: Railway handles ports automatically

### Logs:
- Click on each service to view logs
- Check both frontend and backend services
- Look for error messages in the logs

## Next Steps
1. Set up custom domain (optional)
2. Configure monitoring
3. Set up backups
4. Scale up if needed

## Support
- Railway documentation: https://docs.railway.app
- Your deployed app will be available at `https://your-app-name.railway.app`
