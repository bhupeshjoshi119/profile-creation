# Quick Start Guide

## Prerequisites
- Node.js v22.19.0 or higher ✓ (already installed)
- MySQL 8.0+ or MariaDB 10.11+ ✓ (already installed)

## Setup Options

Choose one of the following methods to set up the database:

### Option 1: Interactive Node.js Script (Easiest)

```bash
npm run setup:db
```

This will:
- Prompt for MySQL credentials
- Create the database
- Optionally create a dedicated user
- Run migrations automatically
- Show you what to update in `.env`

### Option 2: Bash Script (Mac/Linux)

```bash
./setup-database.sh
```

### Option 3: Manual Setup

1. **Create database in MySQL:**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

2. **Update `.env` file:**
```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=auth_db
```

3. **Run migrations:**
```bash
npm run migrate
```

## Start the Server

```bash
npm run dev
```

You should see:
```
[INFO] Database connection established successfully
[INFO] Scheduled cleanup job: Expired tokens (every hour)
[INFO] Scheduled cleanup job: Rate limits (every 30 minutes)
[INFO] Server running on port 3000
[INFO] Environment: development
```

## Test the API

### Quick Test (Automated)
```bash
./test-api.sh
```

### Manual Test

1. **Health Check:**
```bash
curl http://localhost:3000/api/health
```

2. **Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "fullName": "Test User"
  }'
```

3. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

Save the `accessToken` from the response.

4. **Get Profile:**
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Issues

### MySQL Connection Error

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:** Make sure your MySQL password in `.env` is correct:
```env
DB_PASSWORD=your_actual_mysql_password
```

### Database Doesn't Exist

**Error:** `Unknown database 'auth_db'`

**Solution:** Run the database setup:
```bash
npm run setup:db
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Change the port in `.env`:
```env
PORT=3001
```

### JWT Secret Too Short

**Warning:** JWT secret should be at least 32 characters

**Solution:** Update in `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
```

## Next Steps

1. ✅ Database is set up
2. ✅ Server is running
3. ✅ API is tested

Now you can:
- Integrate with your Angular frontend
- Customize rate limiting settings
- Add more endpoints
- Deploy to production

## API Documentation

Full API documentation is available in [README.md](README.md)

## Need Help?

- Check [SETUP.md](SETUP.md) for detailed setup instructions
- Review [README.md](README.md) for complete API documentation
- Check the logs in the terminal for error messages
