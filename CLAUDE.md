# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based web scraping and content monitoring application with a modern cyberpunk UI aesthetic. The application scrapes content from external sources, displays it in a paginated list with swipe-to-dismiss functionality, and includes real-time cache status monitoring.

## Architecture

### Core Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with extensive custom animations
- **Database**: Redis for caching and dismissed item tracking
- **Deployment**: Vercel with environment variable configuration

### Key Application Flow
1. **Data Scraping**: `/api/scrape` route fetches content from external sources
2. **Caching**: Redis stores scraped data with TTL for performance
3. **UI Updates**: Real-time cache status updates every 30 seconds
4. **User Interactions**: Swipe-to-dismiss functionality with Redis persistence

### Directory Structure
- `app/`: Next.js App Router pages and API routes
  - `api/scrape/`: Main content scraping endpoint
  - `api/cache-status/`: Cache monitoring endpoint
  - `api/dismiss-item/`: Item dismissal tracking
  - `api/cron/`: Scheduled content updates
- `components/`: Reusable UI components with cyberpunk styling
- `lib/`: Utility functions and Redis client configuration
- `types/`: TypeScript type definitions

### State Management
- Client-side React state for UI interactions
- Redis for server-side caching and persistence
- Real-time updates through periodic API polling and browser event listeners

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Type Checking
```bash
# No TypeScript type-check script configured - add to package.json if needed:
npm run type-check  # Only if script is added to package.json
```

## Environment Configuration

The application uses multiple environment variable naming patterns for Redis configuration:
- `REDIS_URL` or `UPSTASH_REDIS_REST_URL` for Redis connection
- `REDIS_TOKEN` or `UPSTASH_REDIS_REST_TOKEN` for authentication
- `NODE_ENV` for environment detection

### Deployment Setup (Vercel)
For Vercel deployment, ensure Redis environment variables are configured:
1. Create Upstash Redis database at [console.upstash.com](https://console.upstash.com/)
2. Add environment variables in Vercel project settings:
   - `UPSTASH_REDIS_REST_URL`: Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN`: Redis authentication token

## Key Components

### Core UI Components
- `ContentList`: Paginated content display with swipe-to-dismiss
- `ContentCard`: Individual content item with hover effects
- `CyberButton`: Themed button component with loading states
- `HologramHUD`: Background holographic effect overlay
- `HologramPanel`: Container with holographic border styling

### API Architecture
- **Scraping Logic**: Fetches external content with pagination support
- **Cache Management**: TTL-based caching with force refresh capability
- **Dismissal Tracking**: Persistent storage of dismissed items
- **Auto-refresh**: Cron-based content updates every minute

## Data Flow

1. Initial load fetches cached data from `/api/scrape`
2. Background `fetchCacheStatus()` calls update cache validity
3. Browser events (visibility, focus, navigation) trigger data refreshes
4. Swipe dismissals update both local state and Redis storage
5. Intersection Observer enables infinite scroll functionality

## UI/UX Patterns

- **Cyberpunk Theme**: Neon colors, holographic effects, glitch animations
- **Responsive Design**: Mobile-first with touch gesture support
- **Loading States**: Spinners and skeleton components for async operations
- **Error Handling**: Graceful fallbacks with retry mechanisms
- **Real-time Feedback**: Status indicators and live cache monitoring