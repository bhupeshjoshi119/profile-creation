# 🚀 START HERE - Authentication API Setup

## ✅ What's Already Done

- ✅ Project structure created
- ✅ All dependencies installed
- ✅ Code implementation complete
- ✅ Migration scripts ready

## 🎯 What You Need to Do

### Step 1: Create MySQL Database

Run this command and enter your MySQL password when prompted:

```bash
npm run setup:db
```

**OR** if you prefer, manually create the database:

```bash
mysql -u root -p
```

Then in MySQL:
```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 2: Update .env File

Open `.env` and update your MySQL password:

```env
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=auth_db
```

### Step 3: Run Migrations

```bash
npm run migrate
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

### Step 4: Start the Server

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

### Step 5: Test the API

Open a new terminal and run:

```bash
chmod +x test-api.sh
./test-api.sh
```

## 📝 Quick Manual Test

If you prefer to test manually:

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123",
    "fullName": "John Doe"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

## 🎉 That's It!

Your authentication API is now running!

## 📚 More Information

- **Full API Documentation**: See [README.md](README.md)
- **Detailed Setup Guide**: See [SETUP.md](SETUP.md)
- **Quick Reference**: See [QUICKSTART.md](QUICKSTART.md)

## 🐛 Troubleshooting

### Can't connect to MySQL?
- Make sure MySQL is running: `mysql --version`
- Check your password in `.env` file

### Database already exists?
- That's fine! Just run migrations: `npm run migrate`

### Port 3000 in use?
- Change PORT in `.env` to 3001 or another port

### Need help?
- Check the terminal logs for error messages
- All errors are logged with details
