const pool = require('../config/database');
const { DatabaseError } = require('../utils/errors');

class TokenRepository {
  async create(userId, token, expiresAt) {
    try {
      await pool.query(
        'INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
      
      return { userId, token, expiresAt };
    } catch (error) {
      throw new DatabaseError('Failed to create token', error);
    }
  }

  async findByToken(token) {
    try {
      const [rows] = await pool.query(
        `SELECT t.id, t.user_id, t.token, t.expires_at, t.created_at,
                u.email, u.full_name
         FROM tokens t
         JOIN users u ON t.user_id = u.id
         WHERE t.token = ? AND t.expires_at > NOW()`,
        [token]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return {
        id: rows[0].id,
        userId: rows[0].user_id,
        token: rows[0].token,
        expiresAt: rows[0].expires_at,
        createdAt: rows[0].created_at,
        user: {
          email: rows[0].email,
          fullName: rows[0].full_name
        }
      };
    } catch (error) {
      throw new DatabaseError('Failed to find token', error);
    }
  }

  async deleteByToken(token) {
    try {
      await pool.query('DELETE FROM tokens WHERE token = ?', [token]);
    } catch (error) {
      throw new DatabaseError('Failed to delete token', error);
    }
  }

  async deleteByUserId(userId) {
    try {
      await pool.query('DELETE FROM tokens WHERE user_id = ?', [userId]);
    } catch (error) {
      throw new DatabaseError('Failed to delete user tokens', error);
    }
  }

  async deleteExpired() {
    try {
      const [result] = await pool.query('DELETE FROM tokens WHERE expires_at < NOW()');
      return result.affectedRows;
    } catch (error) {
      throw new DatabaseError('Failed to delete expired tokens', error);
    }
  }
}

module.exports = new TokenRepository();
