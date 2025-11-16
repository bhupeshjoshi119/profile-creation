# Database Architecture Guide

## Overview

This document outlines the database architecture for the Product Management System, utilizing MariaDB as the primary database and Redis as a caching layer to reduce server load and improve performance.

## Technology Stack

### Primary Database: MariaDB
- **Recommended Version**: MariaDB 10.11.x (LTS) or 11.x (Stable)
- **Compatibility**: Fully compatible with Node.js v22.19.0 and Angular 17
- **Why MariaDB**: 
  - Drop-in replacement for MySQL with better performance
  - Open-source with no licensing concerns
  - Enhanced features (better JSON support, faster replication)
  - Active development and community support

### Caching Layer: Redis
- **Recommended Version**: Redis 7.2.x or later
- **Purpose**: Reduce database load, improve response times, session management
- **Use Cases**:
  - Query result caching
  - Session storage
  - Rate limiting
  - Real-time data caching
  - Product catalog caching

## Version Compatibility Matrix

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | v22.19.0 | ✅ Confirmed |
| Angular | 17.x | ✅ Confirmed |
| MariaDB | 10.11.x - 11.x | ✅ Recommended |
| Redis | 7.2.x+ | ✅ Recommended |
| mysql2 (npm) | Latest | ✅ Required |
| ioredis (npm) | Latest | ✅ Required |

## Architecture Design

### Data Flow

```
┌─────────────┐
│  Angular 17 │
│  Frontend   │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────┐
│   Node.js API   │
│   (v22.19.0)    │
└────┬───────┬────┘
     │       │
     │       └──────────┐
     ▼                  ▼
┌─────────┐      ┌──────────┐
│  Redis  │      │ MariaDB  │
│  Cache  │      │ Primary  │
└─────────┘      └──────────┘
```

## MariaDB Configuration

### Installation

**macOS (Homebrew)**:
```bash
brew install mariadb@10.11
brew services start mariadb@10.11
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo mysql_secure_installation
```

### Recommended Settings

Create a configuration file at `/etc/my.cnf` or `~/.my.cnf`:

```ini
[mysqld]
# Performance Settings
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Query Cache (if needed)
query_cache_type = 1
query_cache_size = 64M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

### Node.js Connection

Install the driver:
```bash
npm install mysql2
```

Connection pool configuration:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'product_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

module.exports = pool;
```

## Redis Configuration

### Installation

**macOS (Homebrew)**:
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### Recommended Settings

Edit `/etc/redis/redis.conf`:

```conf
# Memory Management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence (adjust based on needs)
save 900 1
save 300 10
save 60 10000

# Network
bind 127.0.0.1
port 6379
timeout 300

# Performance
tcp-keepalive 300
```

### Node.js Connection

Install the driver:
```bash
npm install ioredis
```

Connection configuration:
```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;
```

## Caching Strategy

### Cache Layers

1. **Application Cache (Redis)**
   - Product listings
   - User sessions
   - API response caching
   - Rate limiting counters

2. **Database Query Cache (MariaDB)**
   - Frequently accessed queries
   - Read-heavy operations

### Cache Implementation Patterns

#### 1. Cache-Aside Pattern (Lazy Loading)

```javascript
async function getProduct(productId) {
  const cacheKey = `product:${productId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Cache miss - fetch from database
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE id = ?',
    [productId]
  );
  
  if (rows.length > 0) {
    // Store in cache with 1 hour TTL
    await redis.setex(cacheKey, 3600, JSON.stringify(rows[0]));
    return rows[0];
  }
  
  return null;
}
```

#### 2. Write-Through Pattern

```javascript
async function updateProduct(productId, data) {
  // Update database
  await pool.query(
    'UPDATE products SET ? WHERE id = ?',
    [data, productId]
  );
  
  // Update cache
  const cacheKey = `product:${productId}`;
  await redis.setex(cacheKey, 3600, JSON.stringify(data));
  
  // Invalidate related caches
  await redis.del('products:list');
}
```

#### 3. Cache Invalidation

```javascript
async function deleteProduct(productId) {
  // Delete from database
  await pool.query('DELETE FROM products WHERE id = ?', [productId]);
  
  // Invalidate caches
  await redis.del(`product:${productId}`);
  await redis.del('products:list');
  await redis.del('products:count');
}
```

## Performance Optimization Strategies

### 1. Query Optimization
- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Use prepared statements to prevent SQL injection

### 2. Connection Pooling
- Reuse database connections
- Configure appropriate pool sizes based on load

### 3. Redis Caching Rules
- Cache frequently accessed data (products, categories)
- Set appropriate TTL values (Time To Live)
- Use Redis for session management
- Implement cache warming for critical data

### 4. Load Reduction Techniques

**For Read-Heavy Operations**:
- Cache product listings with pagination
- Cache user authentication tokens
- Cache category hierarchies
- Cache search results

**For Write Operations**:
- Use Redis for temporary data before batch inserts
- Implement write-behind caching for non-critical updates
- Use Redis queues for async operations

## Environment Configuration

Create a `.env` file:

```env
# MariaDB Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=pms_user
DB_PASSWORD=your_secure_password
DB_NAME=product_management

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# Application
NODE_ENV=development
PORT=3000
```

## Database Schema Considerations

### Indexing Strategy

```sql
-- Primary indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created ON products(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_products_search ON products(name, description);

-- Full-text search (MariaDB specific)
CREATE FULLTEXT INDEX idx_products_fulltext ON products(name, description);
```

### Partitioning (for large datasets)

```sql
-- Partition by date range
ALTER TABLE orders
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

## Monitoring and Maintenance

### MariaDB Monitoring

```sql
-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Monitor connections
SHOW PROCESSLIST;

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'product_management'
ORDER BY (data_length + index_length) DESC;
```

### Redis Monitoring

```bash
# Monitor Redis in real-time
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli CLIENT LIST

# Get cache hit rate
redis-cli INFO stats | grep keyspace
```

## Backup Strategy

### MariaDB Backup

```bash
# Full backup
mysqldump -u root -p product_management > backup_$(date +%Y%m%d).sql

# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/var/backups/mariadb"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p$DB_PASSWORD product_management | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Redis Backup

```bash
# Manual snapshot
redis-cli BGSAVE

# Automated backup (copy RDB file)
cp /var/lib/redis/dump.rdb /var/backups/redis/dump_$(date +%Y%m%d).rdb
```

## Scaling Considerations

### Horizontal Scaling Options

1. **MariaDB Replication**
   - Master-Slave setup for read scaling
   - Multi-master for write scaling

2. **Redis Clustering**
   - Redis Cluster for distributed caching
   - Redis Sentinel for high availability

3. **Load Balancing**
   - Use HAProxy or Nginx for database load balancing
   - Implement read replicas for heavy read operations

## Security Best Practices

1. **Database Security**
   - Use strong passwords
   - Create dedicated database users with minimal privileges
   - Enable SSL/TLS for connections
   - Regular security updates

2. **Redis Security**
   - Enable password authentication
   - Bind to localhost only (unless clustering)
   - Disable dangerous commands (FLUSHALL, CONFIG)
   - Use Redis ACL for fine-grained access control

3. **Application Security**
   - Use parameterized queries (prevent SQL injection)
   - Validate and sanitize all inputs
   - Implement rate limiting with Redis
   - Use environment variables for credentials

## Next Steps

1. Install MariaDB and Redis on your development machine
2. Configure connection pools in your Node.js application
3. Implement caching layer for frequently accessed data
4. Set up monitoring and logging
5. Create backup automation scripts
6. Test performance improvements with load testing

## Additional Resources

- [MariaDB Documentation](https://mariadb.com/kb/en/documentation/)
- [Redis Documentation](https://redis.io/documentation)
- [mysql2 npm package](https://www.npmjs.com/package/mysql2)
- [ioredis npm package](https://www.npmjs.com/package/ioredis)
