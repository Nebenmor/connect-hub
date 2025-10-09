import { Request, Response } from 'express';
import pool from '../config/db';
import { User } from '../types';

/**
 * Get all users (for discovering connections)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    // Get all users except current user
    const result = await pool.query<User>(
      `SELECT id, email, name, avatar_url, created_at 
       FROM users 
       WHERE id != $1 
       ORDER BY created_at DESC`,
      [currentUserId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query<User>(
      'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Update current user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { name, avatar_url } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query<User>(
      `UPDATE users 
       SET name = $1, avatar_url = $2 
       WHERE id = $3 
       RETURNING id, email, name, avatar_url, created_at`,
      [name.trim(), avatar_url || null, currentUserId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};