const pool = require('../config/database');
const { DatabaseError } = require('../utils/errors');

class UserRepository {
  async create(userData) {
    try {
      const { email, passwordHash, fullName } = userData;
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
        [email.toLowerCase(), passwordHash, fullName]
      );
      
      return {
        id: result.insertId,
        email: email.toLowerCase(),
        fullName,
        createdAt: new Date()
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DatabaseError('Email already exists', error);
      }
      throw new DatabaseError('Failed to create user', error);
    }
  }

  async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, password_hash, full_name, created_at, updated_at, last_login FROM users WHERE LOWER(email) = LOWER(?)',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return {
        id: rows[0].id,
        email: rows[0].email,
        passwordHash: rows[0].password_hash,
        fullName: rows[0].full_name,
        createdAt: rows[0].created_at,
        updatedAt: rows[0].updated_at,
        lastLogin: rows[0].last_login
      };
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', error);
    }
  }

  async findById(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, full_name, created_at, updated_at, last_login FROM users WHERE id = ?',
        [userId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return {
        id: rows[0].id,
        email: rows[0].email,
        fullName: rows[0].full_name,
        createdAt: rows[0].created_at,
        updatedAt: rows[0].updated_at,
        lastLogin: rows[0].last_login
      };
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID', error);
    }
  }

  async emailExists(email) {
    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE LOWER(email) = LOWER(?)',
        [email]
      );
      
      return rows[0].count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check email existence', error);
    }
  }

  async updateLastLogin(userId) {
    try {
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [userId]
      );
    } catch (error) {
      throw new DatabaseError('Failed to update last login', error);
    }
  }
}

module.exports = new UserRepository();
