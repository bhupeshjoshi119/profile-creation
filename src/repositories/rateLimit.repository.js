const pool = require('../config/database');
const { DatabaseError } = require('../utils/errors');

class RateLimitRepository {
  async create(ipAddress, action, attemptedEmail = null) {
    try {
      await pool.query(
        'INSERT INTO rate_limits (ip_address, action, attempted_email) VALUES (?, ?, ?)',
        [ipAddress, action, attemptedEmail]
      );
    } catch (error) {
      throw new DatabaseError('Failed to create rate limit record', error);
    }
  }

  async countAttempts(ipAddress, action, timeWindowMinutes) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM rate_limits 
         WHERE ip_address = ? 
         AND action = ? 
         AND attempt_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
        [ipAddress, action, timeWindowMinutes]
      );
      
      return rows[0].count;
    } catch (error) {
      throw new DatabaseError('Failed to count rate limit attempts', error);
    }
  }

  async deleteByIp(ipAddress, action) {
    try {
      await pool.query(
        'DELETE FROM rate_limits WHERE ip_address = ? AND action = ?',
        [ipAddress, action]
      );
    } catch (error) {
      throw new DatabaseError('Failed to delete rate limit records', error);
    }
  }

  async deleteExpired(olderThanMinutes) {
    try {
      const [result] = await pool.query(
        'DELETE FROM rate_limits WHERE attempt_time < DATE_SUB(NOW(), INTERVAL ? MINUTE)',
        [olderThanMinutes]
      );
      return result.affectedRows;
    } catch (error) {
      throw new DatabaseError('Failed to delete expired rate limit records', error);
    }
  }
}

module.exports = new RateLimitRepository();
