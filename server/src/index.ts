import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';
import passport from 'passport';

// Load environment variables FIRST - THIS WAS COMMENTED OUT!
// dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import connectionRoutes from './routes/connectionRoutes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Important for cookies
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Abbey Challenge API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Client URL: ${CLIENT_URL}`);
  console.log(`✓ Database: ${process.env.DATABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`);
});