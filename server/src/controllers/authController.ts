import { Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../config/db";
import { generateToken } from "../middleware/auth";
import { User } from "../types";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Lazy initialization - only validate when passport strategy is actually used
const initializeGoogleStrategy = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Missing required OAuth environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    );
  }

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          const existingUser = await pool.query<User>(
            "SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2",
            ["google", profile.id]
          );

          if (existingUser.rows.length > 0) {
            return done(null, existingUser.rows[0]);
          }

          // Create new user
          const newUser = await pool.query<User>(
            `INSERT INTO users (email, name, avatar_url, oauth_provider, oauth_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [
              profile.emails?.[0].value,
              profile.displayName,
              profile.photos?.[0].value,
              "google",
              profile.id,
            ]
          );

          done(null, newUser.rows[0]);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
};

// Initialize strategy immediately
initializeGoogleStrategy();

/**
 * Initiate Google OAuth flow
 */
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

/**
 * Handle Google OAuth callback
 */
export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate(
    "google",
    { session: false },
    (err: Error, user: User) => {
      if (err || !user) {
        console.error("OAuth error:", err);
        return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log("✓ OAuth successful for user:", user.email);
      console.log("✓ Token cookie set");

      // Redirect to frontend
      res.redirect(`${CLIENT_URL}/dashboard`);
    }
  )(req, res);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<User>(
      "SELECT id, email, name, avatar_url, oauth_provider, created_at FROM users WHERE id = $1",
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

/**
 * Logout user
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};