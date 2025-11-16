#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MySQL Database Setup for Auth API ===${NC}\n"

# Prompt for MySQL credentials
echo -e "${YELLOW}Please enter your MySQL root password:${NC}"
read -s MYSQL_PASSWORD
echo ""

# Test MySQL connection
echo -e "${YELLOW}Testing MySQL connection...${NC}"
mysql -u root -p"$MYSQL_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to connect to MySQL. Please check your password.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ MySQL connection successful${NC}\n"

# Create database
echo -e "${YELLOW}Creating database 'auth_db'...${NC}"
mysql -u root -p"$MYSQL_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database 'auth_db' created successfully${NC}\n"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

# Ask if user wants to create a dedicated MySQL user
echo -e "${YELLOW}Do you want to create a dedicated MySQL user 'auth_user'? (recommended for production)${NC}"
echo -e "${YELLOW}[y/N]:${NC} "
read CREATE_USER

if [[ "$CREATE_USER" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Enter password for 'auth_user':${NC}"
    read -s AUTH_USER_PASSWORD
    echo ""
    
    mysql -u root -p"$MYSQL_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS 'auth_user'@'localhost' IDENTIFIED BY '$AUTH_USER_PASSWORD';
GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User 'auth_user' created successfully${NC}\n"
        echo -e "${YELLOW}Update your .env file with:${NC}"
        echo -e "DB_USER=auth_user"
        echo -e "DB_PASSWORD=$AUTH_USER_PASSWORD"
        echo -e "DB_NAME=auth_db\n"
    else
        echo -e "${RED}✗ Failed to create user${NC}"
    fi
else
    echo -e "${YELLOW}Using root user. Update your .env file with:${NC}"
    echo -e "DB_USER=root"
    echo -e "DB_PASSWORD=$MYSQL_PASSWORD"
    echo -e "DB_NAME=auth_db\n"
fi

# Run migrations
echo -e "${YELLOW}Do you want to run database migrations now? [Y/n]:${NC} "
read RUN_MIGRATIONS

if [[ ! "$RUN_MIGRATIONS" =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}Running migrations...${NC}\n"
    
    # Update .env temporarily for migration
    if [[ "$CREATE_USER" =~ ^[Yy]$ ]]; then
        export DB_USER=auth_user
        export DB_PASSWORD=$AUTH_USER_PASSWORD
    else
        export DB_USER=root
        export DB_PASSWORD=$MYSQL_PASSWORD
    fi
    export DB_NAME=auth_db
    export DB_HOST=localhost
    export DB_PORT=3306
    
    node database/migrate.js
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Migrations completed successfully${NC}\n"
    else
        echo -e "\n${RED}✗ Migrations failed${NC}\n"
        exit 1
    fi
fi

echo -e "${GREEN}=== Database setup completed! ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update your .env file with the database credentials shown above"
echo -e "2. Run: ${BLUE}npm run dev${NC}"
echo -e "3. Test the API: ${BLUE}./test-api.sh${NC}\n"
