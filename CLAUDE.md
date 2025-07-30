# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- **Start development**: `npm run dev` (runs tests then starts with nodemon)
- **Production start**: `npm start`
- **Run tests**: `npm test` (Jest test suite)
- **Lint code**: `npm run lint` (ESLint with max-warnings 0)

### Application Startup
The app uses `src/app.js` as the main entry point. Development mode includes automatic restart via nodemon and runs tests before starting.

## Architecture Overview

### Core Structure
This is a **Simpsons Trivia API** built with Express.js that serves quotes and characters from The Simpsons for a trivia game. The application supports both authenticated users and anonymous gameplay.

### Database Layer
- **Primary Database**: PostgreSQL (via `pg` pool connections)
- **Cache Layer**: Redis (via `ioredis`)
- **Authentication**: Supabase (with OAuth support for Google/GitHub)
- **Connection Management**: Toggle databases via environment variables (`CONNECTPOSTGRES`, `CONNECTREDIS`)

### Key Architectural Components

#### Configuration Management (`config.js`)
Central configuration hub that manages all environment variables and provides defaults. All modules import config through this single source.

#### Database Management
- `src/dbFiles/databaseManager.js`: PostgreSQL connection pooling and query execution
- `src/dbFiles/redisManager.js`: Redis connection and operations  
- `src/dbFiles/queries.js`: PostgreSQL query implementations
- `src/dbFiles/queriesRedis.js`: Redis query implementations
- `src/dbFiles/creatingTables/userTables.js`: Database schema definitions

#### Authentication & Authorization
- **Multi-provider auth**: Supabase handles user management with OAuth (Google, GitHub)
- **Role-based access**: Admin/User roles with middleware protection
- **Session handling**: JWT tokens with refresh mechanism
- **Security layers**: Rate limiting, brute force protection, CORS

#### Route Architecture (`src/routes/routes.js`)
Three-tier route structure:
- **Public routes**: Open access (quotes, characters, healthcheck)
- **Auth routes**: Login, register, OAuth callbacks
- **Protected routes**: Require authentication and role verification

#### Security Implementation
- **Rate limiting**: Different limits for public/authenticated/internal routes
- **Brute force protection**: Via `express-brute`
- **JMeter bypass**: Special handling for load testing
- **Role middleware**: Granular permission checking

### Key Patterns

#### Environment-Driven Configuration
The application gracefully handles missing services - databases and external services can be toggled on/off via environment variables without breaking functionality.

#### Dual Database Strategy
- PostgreSQL for persistent data (users, scores, game state)
- Redis for session management, caching, and temporary data

#### OAuth Integration
- Supports multiple OAuth providers through unified callback handling
- Token management with automatic refresh
- Secure cookie-based session persistence

#### API Documentation System
- **Conditional Documentation**: Environment-aware documentation display using Swagger UI
- **Development Mode**: Full API documentation with all endpoints (23 routes)
- **Production Mode**: Limited documentation showing only public, game, and admin routes (10 routes)
- **Implementation**: `src/routes/docsConditional.js` handles automatic environment detection and serves appropriate OpenAPI specs
- **Documentation Files**:
  - `src/routes/apiRoutesDoc.yaml`: Complete OpenAPI 3.0 specification for development
  - `src/routes/apiRoutesDocProduction.yaml`: Filtered specification for production deployment
- **Access Points**: 
  - Main page with embedded documentation
  - `/api/v1/docs` for standalone Swagger UI
  - `/api/v1/docs.json` for raw OpenAPI JSON spec
  - `/api/v1/docs-info` for environment and documentation metadata

## Testing & Quality

### Test Strategy
- **Framework**: Jest
- **Location**: `tests/` directory
- **Integration**: Automated via `npm run dev` command

### Code Quality
- **ESLint**: Configured with zero warnings tolerance
- **Standards**: CommonJS modules, Node.js/browser globals
- **CI/CD**: GitHub Actions for automated testing and deployment

## Development Environment

### Multi-Environment Support
- **Development**: Local PostgreSQL/Redis, detailed logging, extra debugging routes
- **Production**: Cloud databases (Supabase, Upstash Redis), optimized performance
- **Docker**: Multi-stage builds for dev/prod environments

### Data Sources
The trivia content comes from CSV files:
- `src/scrapQuotes/characters_simpson.csv`: Character data
- `src/scrapQuotes/quotes_simpson.csv`: Quote data with character associations

## Deployment Architecture

### Supported Platforms
- **Primary**: Fly.io (configured via `fly.toml`)
- **Alternative**: Render, Docker containers
- **Monitoring**: Sentry integration for error tracking

### Key Services Integration
- **Supabase**: Authentication, user management, file storage
- **Upstash Redis**: Session cache and temporary data
- **PostgreSQL**: Primary data persistence
- **GitHub Actions**: Automated CI/CD pipeline

## Pending Tasks & Future Development

### Completed Features ✅
- **Conditional API Documentation**: Environment-aware documentation system implemented with production/development modes
- **Comprehensive Streak System**: Full tracking for current streaks, best streaks, and session management
- **OAuth Account Linking**: Users can link/unlink multiple OAuth providers (Google, GitHub)
- **Anonymous User Redis Support**: Complete Redis-based scoring and session management for guests
- **Game Session Reset**: Proper score and streak reset functionality across user types

### Incomplete Features
- **AI API Route**: Create route for AI integration
- **Anonymous User Score Migration**: Save Redis scores to Supabase when users register
- **Cloudflare Anti-Bot**: Implement bot protection
- **Profile Image Rewards**: Point-based profile image reward system
- **Request Caching**: Implement Redis caching for trivia questions to improve response times

### OAuth Account Linking System ✅ **IMPLEMENTED**

#### Architecture Overview
The account linking system uses Supabase's native identity linking capabilities, avoiding the need for additional database tables. This implementation allows users to manually link/unlink multiple OAuth providers (Google, GitHub) to a single account while maintaining session integrity.

#### Key Components and Flow

**Controller Functions** (`src/controllers/triviaControllers.js`):
- `linkOAuthProvider()` - Establishes user session with `setSession()`, then generates linking URL using `linkIdentity()`
- `handleOAuthLinkCallback()` - Processes OAuth callback, handles empty query params, redirects to profile with status
- `getUserLinkedIdentities()` - Retrieves user identities from Supabase auth using `getUser()` 
- `unlinkOAuthProvider()` - Removes identity using `auth.unlinkIdentity()` with safety checks

**Route Configuration** (`src/routes/routes.js`):
- `POST /api/v1/oauth/link/:provider` - Authenticated users only, requires `supabaseAuth` middleware
- `GET /api/v1/oauth/link-callback` - **Public route** (no auth required for callback processing)
- `GET /api/v1/oauth/linked-accounts` - Returns user's linked identities from Supabase
- `DELETE /api/v1/oauth/unlink/:provider` - Removes OAuth identity (prevents unlinking sole identity)

**Frontend Interface** (`src/views/profile.ejs`):
- Enhanced UI with improved styling and animations
- `loadLinkedAccounts()` - Fetches and displays current linked providers with provider icons
- `linkProvider()` - Initiates linking flow with debugging and error handling
- `unlinkProvider()` - Removes provider with confirmation dialog and success feedback
- `handleLinkingResult()` - Processes URL parameters for success/error messages
- Dynamic UI updates hide/show provider buttons based on current linking status

#### Data Flow for Linking Process

1. **User Initiates Linking**:
   - Frontend calls `POST /api/v1/oauth/link/:provider`
   - Controller validates authentication using correct `req.user.dataUser.id` structure
   - Establishes Supabase session using `setSession()` with access/refresh tokens
   - Generates linking URL with proper callback URL construction

2. **OAuth Provider Flow**:
   - User redirected to provider (Google/GitHub) for authorization
   - Provider redirects back to `/api/v1/oauth/link-callback`
   - **Session preserved** - no new session creation to avoid logout

3. **Identity Association & Callback**:
   - Supabase automatically links new identity to existing user
   - Callback handles empty query params (normal for successful linking)
   - Redirects to profile with success status: `/api/v1/profile?linked=success`
   - Frontend displays success message and reloads to show new linked account

#### Technical Implementation Details

**Authentication Flow Fixes**:
- Corrected `req.user` structure validation (`req.user.dataUser.id` vs `req.user.id`)
- Proper session establishment using `userSupabase.auth.setSession()`
- Callback URL construction matches production/development environments

**Session Management**:
- **No session replacement** - linking preserves existing user session
- Uses existing cookie-based authentication (`accessToken`, `refreshToken`)
- Callback route uses public limiter to avoid authentication conflicts

**Error Handling**:
- Comprehensive debugging logs for troubleshooting
- Graceful handling of empty callback parameters
- Frontend error/success message system with auto-cleanup

#### Security Considerations

- **Authentication Required**: All linking operations require valid user session
- **Provider Validation**: Only Google and GitHub providers are supported
- **Identity Protection**: Cannot unlink the only authentication method
- **Session Integrity**: Maintains user session throughout linking process
- **CSRF Protection**: Uses existing CORS and rate limiting

#### Database Integration

The system leverages existing user management:
- `getUserByEmail()` checks for existing accounts during OAuth callback
- `createUserOAuth()` creates local user records for new OAuth users
- No additional tables needed - Supabase auth handles identity relationships
- Local user data remains consistent across all linked identities

#### Current Status
- ✅ **Fully Functional**: Users can link/unlink Google and GitHub accounts
- ✅ **Session Preservation**: No logout during linking process
- ✅ **UI Integration**: Complete profile page integration with success/error feedback
- ✅ **Security Compliant**: Maintains all existing authentication protections

### Security Enhancements
- Implement HTTPS enforcement
- Add password security policies
- Implement CSRF tokens
- Add security headers (HSTS, CSP, etc.)
- Implement secure logging
- Add session expiration policies
- Stricter CORS policies
- Input sanitization for all user entries

### Suggested Profile Routes
The codebase includes planned public profile routes:
- `GET /api/v1/users/:username/profile` - Public profile view
- `GET /api/v1/users/:username/scores` - Public user scores
- `PATCH /api/v1/profile/image` - Update profile image