# Setup Guide

## Quick Setup (Automated)

Run the automated setup script:

```bash
./setup-database.sh
```

This script will:
- Test MySQL connection
- Create the `auth_db` database
- Optionally create a dedicated MySQL user
- Run database migrations
- Show you what to update in your `.env` file

## Manual Setup

### Step 1: MySQL Database Setup

#### Option 1: Using Automated Script (Recommended)

```bash
./setup-database.sh
```

#### Option 2: Manual MySQL Setup

1. **Open MySQL command line:**
```bash
mysql -u root -p
```

2. **Create database:**
```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Create dedicated user (recommended for production):**
```sql
CREATE USER 'auth_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

4. **OR use root user (for development only):**
```sql
-- Just create the database, no need to create user
EXIT;
```

## Step 2: Update .env file

Edit `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=auth_user  # or root
DB_PASSWORD=your_password_here
DB_NAME=auth_db
```

## Step 3: Run Migrations

```bash
node database/migrate.js
```

You should see:
```
Connected to database
Running migration: 001_create_users_table.sql
✓ 001_create_users_table.sql completed
Running migration: 002_create_tokens_table.sql
✓ 002_create_tokens_table.sql completed
Running migration: 003_create_rate_limits_table.sql
✓ 003_create_rate_limits_table.sql completed

All migrations completed successfully!
```

## Step 4: Start the Server

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

## Step 5: Test the API

### Test Health Check:
```bash
curl http://localhost:3000/api/health
```

### Test User Registration:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": "Test User"
  }'
```

### Test User Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

Save the `accessToken` from the response.

### Test Get Profile:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Troubleshooting

### Database Connection Issues

1. **Check MySQL is running:**
```bash
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql
```

2. **Test connection:**
```bash
mysql -u root -p -e "SELECT 1;"
```

3. **Check user permissions:**
```sql
SHOW GRANTS FOR 'auth_user'@'localhost';
```

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

### JWT Secret Warning

Make sure your JWT_SECRET is at least 32 characters long for security.

## Next Steps

Once everything is working:

1. Change default passwords in `.env`
2. Set up proper MySQL user with limited privileges
3. Configure CORS for your frontend URL
4. Review rate limiting settings
5. Set up proper logging in production
6. Consider using environment-specific .env files (.env.development, .env.production)
