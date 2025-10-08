# Abbey FullStack Challenge

A full-stack social connection application built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

✅ **Authentication**: OAuth 2.0 with Google  
✅ **User Accounts**: Profile management with avatar support  
✅ **Relationships**: Send, accept, and manage connection requests  
✅ **Session Management**: JWT-based authentication with httpOnly cookies  
✅ **Responsive UI**: Clean interface built with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Vite for build tooling

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Passport.js for OAuth
- JWT for session management

## Project Structure

```
abbey-challenge/
├── client/           # React frontend
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/
│   │   ├── context/  # Auth context
│   │   ├── pages/
│   │   └── types.ts
├── server/           # Express backend
│   ├── src/
│   │   ├── config/   # Database & configs
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── types.ts
│   └── migrations/   # SQL migrations
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)
- Google OAuth credentials

### 1. Clone and Install

```bash
git clone <your-repo>
cd abbey-challenge

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Setup

**Option A: Using Docker (Recommended)**
```bash
docker run --name abbey-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=abbey_db \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local PostgreSQL**
```bash
createdb abbey_db
```

**Run Migrations**
```bash
cd server
psql $DATABASE_URL -f migrations/init.sql
# Or: npm run migrate
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret

### 4. Environment Variables

**Server (.env in server/ directory)**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/abbey_db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_random_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Client (.env in client/ directory)**
```bash
VITE_API_URL=http://localhost:5000
```

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Visit `http://localhost:5173` and login with Google!

## Database Schema

### users
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
name            VARCHAR(255) NOT NULL
avatar_url      TEXT
oauth_provider  VARCHAR(50) NOT NULL
oauth_id        VARCHAR(255) UNIQUE NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

### connections
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER REFERENCES users(id)
friend_id   INTEGER REFERENCES users(id)
status      VARCHAR(20) CHECK (status IN ('pending', 'accepted'))
created_at  TIMESTAMP DEFAULT NOW()
UNIQUE(user_id, friend_id)
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/me` - Update profile (protected)

### Connections
- `GET /api/connections` - Get all connections (protected)
- `POST /api/connections/:userId` - Send connection request (protected)
- `PUT /api/connections/:id/accept` - Accept request (protected)
- `DELETE /api/connections/:id` - Remove/reject connection (protected)

## Production Deployment

### Backend (Render)

1. Create account on [Render](https://render.com)
2. Create PostgreSQL database:
   - Copy **Internal Database URL**
3. Create Web Service:
   - Connect GitHub repo
   - Root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Add environment variables from `.env.example`
   - Set `DATABASE_URL` to your Render PostgreSQL URL
   - Set `CLIENT_URL` to your Vercel URL (after frontend deployment)
4. Update Google OAuth redirect URI with Render URL

### Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Framework: Vite
4. Root directory: `client`
5. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
6. Deploy

### Post-Deployment

1. Update `CLIENT_URL` in Render backend environment variables
2. Add production redirect URI to Google OAuth:
   - `https://your-backend.onrender.com/api/auth/google/callback`
3. Test authentication flow

## Development Notes

### Key Implementation Details

- **Authentication**: OAuth 2.0 with Google using Passport.js
- **Session**: JWT stored in httpOnly cookies for security
- **CORS**: Configured to allow credentials between frontend/backend
- **Database**: PostgreSQL with connection pooling
- **Relationships**: Bidirectional connection model (like LinkedIn)

### Security Features

- httpOnly cookies prevent XSS attacks
- CSRF protection through SameSite cookies
- SQL injection prevention via parameterized queries
- Environment-based configuration
- Password-less authentication (OAuth only)

### Code Quality

- TypeScript for type safety
- Consistent file naming (camelCase)
- Clean architecture with separation of concerns
- Error handling throughout
- No over-engineering - simple and maintainable

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps  # If using Docker
pg_isready  # If using local PostgreSQL

# Test connection
psql $DATABASE_URL
```

### OAuth Errors
- Verify Google OAuth credentials
- Check redirect URIs match exactly
- Ensure cookies are enabled in browser

### CORS Issues
- Verify `CLIENT_URL` in backend `.env`
- Check `VITE_API_URL` in frontend `.env`
- Ensure `withCredentials: true` in axios

## License

MIT

---

Built for Abbey FullStack Engineer Challenge