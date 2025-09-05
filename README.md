# SvelteKit + Tailwind Admin Template

Production-ready SvelteKit admin dashboard template with authentication, dark mode support, and modern UI components.

It includes sensible defaults: SvelteKit 5, Tailwind CSS 4, TypeScript, JWT authentication with automatic token refresh, role-based access control, and a responsive admin layout with dark mode support.

## Quick start (use as a template)

1. **Create a new project from this folder**

```bash
git clone git@github.com:7shiroi/sveltekil-tailwind-template.git new-sveltekit-project
cd new-sveltekit-project
```

2. **Reset Git history (optional)**

```bash
rm -rf .git && git init && git add . && git commit -m "init: scaffold from template starter"
```

3. **Install dependencies**

```bash
npm install
```

4. **Configure environment**

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_URL="http://localhost:3000"
VITE_API_KEY="your-api-key"

# Additional environment variables as needed
```

5. **Run the app**

```bash
# development
npm run dev

# build for production
npm run build

# preview production build
npm run preview
```

## What's included

### Core

- **SvelteKit v5** with TypeScript v5
- **Tailwind CSS v4** with dark mode support
- **Phosphor Icons** for consistent iconography
- **Vite** for fast development and building

### Authentication System

- JWT-based authentication with automatic token refresh
- Secure token storage in localStorage
- Role-based access control
- Login/logout functionality with API integration
- Automatic token expiration handling
- Logout from single device or all devices

### UI Components & Layout

- Responsive admin dashboard layout
- Dark mode support with class-based strategy
- Custom color palette (primary: cyan, secondary: slate, accent: violet)
- Inter font family for modern typography
- Error handling with custom error pages

### API Integration

- Centralized API utility with automatic auth handling
- Request/response interceptors
- Error handling and retry logic
- TypeScript interfaces for type safety

## Project structure

```
src/
  lib/
    assets/               # Static assets (favicon, etc.)
    stores/
      auth.ts            # Authentication store and utilities
    utils/
      api.ts             # API client with auth integration
  routes/
    +layout.svelte       # Root layout with auth initialization
    +error.svelte        # Error page component
    login/
      +page.svelte       # Login page
  app.css                # Global styles and Tailwind imports
  app.d.ts               # TypeScript declarations
  app.html               # HTML template
```

## Authentication Flow

The template includes a complete authentication system:

1. **Login**: Users authenticate via `/login` page
2. **Token Management**: JWT tokens are automatically managed with refresh logic
3. **Protected Routes**: Routes can be protected based on authentication status
4. **Auto-logout**: Tokens are automatically refreshed or users are logged out on expiration

### Using the Auth Store

```typescript
import { isAuthenticated, user, logout, logoutAll } from "$lib/stores/auth";

// Check if user is authenticated
$isAuthenticated; // boolean

// Get current user data
$user; // { id, username, role, userKey } | null

// Logout functions
logout(); // Logout from current device
logoutAll(); // Logout from all devices
```

### API Usage

```typescript
import { api } from "$lib/utils/api";

// Authenticated API calls (tokens handled automatically)
const response = await api<ResponseType>("/endpoint", {
  method: "POST",
  body: { data: "example" },
});

// Skip authentication for public endpoints
const publicResponse = await api("/public-endpoint", {
  skipAuth: true,
});
```

## Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_API_KEY`: API key for service authentication

## NPM Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run check        # Type checking
npm run check:watch  # Type checking in watch mode

# Maintenance
npm run prepare      # Sync SvelteKit (runs automatically)
```

## Customization

### Styling

- Modify `tailwind.config.js` for custom theme colors and fonts
- Update CSS variables in `src/app.css` for global styling
- Dark mode classes are automatically applied based on system preference

### Authentication Backend

The template expects a backend API with these endpoints:

- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /admin/auth/logout` - Logout from current device
- `POST /admin/auth/logout-all` - Logout from all devices

### Adding New Pages

1. Create route files in `src/routes/`
2. Use the auth store to protect routes if needed
3. Follow SvelteKit routing conventions

## Features

- ✅ **Modern Stack**: SvelteKit 5 + Tailwind CSS 4 + TypeScript
- ✅ **Authentication**: JWT with automatic refresh and role-based access
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **Dark Mode**: System preference detection and manual toggle support
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Developer Experience**: Hot reload, type checking, modern tooling
- ✅ **Production Ready**: Optimized builds with SvelteKit adapter-auto

## Notes

- Tokens are stored in localStorage and automatically managed
- The template uses SvelteKit 5's new syntax with runes (`$props`, `$state`)
- API responses are expected to follow a consistent structure
- Error boundaries are set up for graceful error handling
- The template is framework-agnostic for the backend (works with any REST API)

## License

MIT - see [LICENSE](./LICENSE) file for details.
