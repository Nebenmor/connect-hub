import { Request, Response } from 'express';
import pool from '../config/db';
import { Connection, ConnectionWithUser, User } from '../types';

/**
 * Get all connections for current user (both accepted and pending)
 */
export const getConnections = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    // Get connections where user is either sender or receiver
    const result = await pool.query<ConnectionWithUser>(
      `SELECT 
        c.id, 
        c.user_id, 
        c.friend_id, 
        c.status, 
        c.created_at,
        u.id as friend_id,
        u.email as friend_email,
        u.name as friend_name,
        u.avatar_url as friend_avatar_url
       FROM connections c
       JOIN users u ON (
         CASE 
           WHEN c.user_id = $1 THEN c.friend_id = u.id
           ELSE c.user_id = u.id
         END
       )
       WHERE c.user_id = $1 OR c.friend_id = $1
       ORDER BY c.created_at DESC`,
      [currentUserId]
    );

    // Transform to include friend details
    const connections = result.rows.map((row) => ({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      is_sender: row.user_id === currentUserId,
      friend: {
        id: row.friend_id,
        email: (row as any).friend_email,
        name: (row as any).friend_name,
        avatar_url: (row as any).friend_avatar_url,
      },
    }));

    res.json(connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};

/**
 * Send connection request
 */
export const sendConnectionRequest = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;

    // Validate
    if (parseInt(userId) === currentUserId) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if connection already exists (either direction)
    const existingConnection = await pool.query<Connection>(
      `SELECT * FROM connections 
       WHERE (user_id = $1 AND friend_id = $2) 
       OR (user_id = $2 AND friend_id = $1)`,
      [currentUserId, userId]
    );

    if (existingConnection.rows.length > 0) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    // Create connection request
    const result = await pool.query<Connection>(
      `INSERT INTO connections (user_id, friend_id, status) 
       VALUES ($1, $2, 'pending') 
       RETURNING *`,
      [currentUserId, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
};

/**
 * Accept connection request
 */
export const acceptConnection = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { id } = req.params;

    // Find connection and verify user is the receiver
    const connection = await pool.query<Connection>(
      'SELECT * FROM connections WHERE id = $1',
      [id]
    );

    if (connection.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const conn = connection.rows[0];

    // Only the receiver can accept
    if (conn.friend_id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to accept this connection' });
    }

    if (conn.status === 'accepted') {
      return res.status(400).json({ error: 'Connection already accepted' });
    }

    // Accept connection
    const result = await pool.query<Connection>(
      `UPDATE connections 
       SET status = 'accepted' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ error: 'Failed to accept connection' });
  }
};

/**
 * Delete/reject connection
 */
export const deleteConnection = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { id } = req.params;

    // Find connection and verify user is involved
    const connection = await pool.query<Connection>(
      'SELECT * FROM connections WHERE id = $1',
      [id]
    );

    if (connection.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const conn = connection.rows[0];

    // User must be either sender or receiver
    if (conn.user_id !== currentUserId && conn.friend_id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to delete this connection' });
    }

    // Delete connection
    await pool.query('DELETE FROM connections WHERE id = $1', [id]);

    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
};