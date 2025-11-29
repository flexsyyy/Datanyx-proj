# Codebase Index - Mush The Room

## Project Overview

**Mush The Room** is a React-based web application built with TypeScript, Vite, and shadcn-ui components. The project is a **mushroom cultivation monitoring and management system** for tracking and optimizing growing conditions in mushroom growing facilities/shelters. 

Key features include:
- Real-time monitoring of environmental conditions (temperature, humidity, CO2 levels)
- Health index tracking for growing facilities
- Alerts and notifications for critical conditions
- Predictive analytics for optimal growing conditions
- Live monitoring dashboards
- Comparison tools for multiple facilities
- AI-powered chatbot assistant for mushroom growing advice
- Reports and recommendations for improving yields

## Technology Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **UI Library**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: TanStack React Query 5.83.0
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 0.462.0

## Project Structure

```
mush-the-room-main/
├── src/                          # Main source directory
│   ├── App.tsx                   # Root component with routing
│   ├── main.tsx                  # Application entry point
│   ├── index.css                 # Global styles
│   ├── vite-env.d.ts            # Vite type definitions
│   │
│   ├── pages/                    # Page components
│   │   ├── Landing.tsx           # Landing/home page
│   │   ├── Login.tsx             # Login page
│   │   ├── Signup.tsx            # Signup/registration page
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Shelters.tsx          # Shelters management page
│   │   ├── Alerts.tsx            # Alerts page
│   │   ├── Predict.tsx           # Predictions page
│   │   ├── LiveMonitor.tsx       # Live monitoring page
│   │   ├── Compare.tsx           # Comparison page
│   │   ├── Reports.tsx           # Reports page
│   │   ├── Recommendations.tsx  # Recommendations page
│   │   └── NotFound.tsx          # 404 error page
│   │
│   ├── components/               # Reusable components
│   │   ├── Chatbot.tsx           # Chatbot component
│   │   ├── SettingsPanel.tsx     # Settings panel component
│   │   ├── NavLink.tsx           # Navigation link component
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   └── Navigation.tsx    # Main navigation component
│   │   │
│   │   └── ui/                   # shadcn-ui components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── kpi-card.tsx      # KPI card component
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sonner.tsx        # Toast notifications
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── tooltip.tsx
│   │
│   ├── contexts/                 # React contexts
│   │   └── UnitsContext.tsx      # Units conversion context (metric/imperial)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── use-toast.ts          # Toast notification hook
│   │
│   └── lib/                      # Utility libraries
│       └── utils.ts              # Utility functions (cn for Tailwind class merging)
│
├── public/                       # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
├── dist/                         # Build output directory
│   ├── assets/
│   ├── index.html
│   └── placeholder.svg
│
├── mush-the-room/                # Nested project directory (appears to be duplicate/alternative version)
│   └── [similar structure to root]
│
├── node_modules/                 # Dependencies
│
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Dependency lock file
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # TypeScript app-specific config
├── tsconfig.node.json            # TypeScript node-specific config
├── vite.config.ts                # Vite build configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── eslint.config.js              # ESLint configuration
├── components.json                # shadcn-ui components configuration
└── README.md                      # Project documentation

```

## Application Routes

The application uses React Router with the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Landing` | Landing/home page |
| `/login` | `Login` | User login page |
| `/signup` | `Signup` | User registration page |
| `/dashboard` | `Dashboard` | Main dashboard |
| `/shelters` | `Shelters` | Shelters management |
| `/alerts` | `Alerts` | Alerts and notifications |
| `/predict` | `Predict` | Predictions page |
| `/live-monitor` | `LiveMonitor` | Live monitoring |
| `/compare` | `Compare` | Comparison view |
| `/reports` | `Reports` | Reports page |
| `/recommendations` | `Recommendations` | Recommendations page |
| `*` | `NotFound` | 404 error page |

## Key Components

### App Component (`src/App.tsx`)
- Root component that sets up routing
- Configures React Query client
- Provides Units context
- Conditionally renders Chatbot (hidden on landing, login, signup pages)
- Sets up toast notifications and tooltips

### Chatbot Component (`src/components/Chatbot.tsx`)
- AI assistant for mushroom cultivation advice
- Provides guidance on:
  - Temperature optimization (18-24°C ideal)
  - Humidity management (80-95% during fruiting)
  - CO2 levels (below 1000 ppm)
  - Contamination prevention
  - Substrate preparation
  - Fruiting triggers
  - Harvest timing
- Interactive chat interface with suggested questions

### Contexts

#### UnitsContext (`src/contexts/UnitsContext.tsx`)
- Manages unit system preference (metric/imperial)
- Provides conversion functions:
  - `formatTemperature(celsius)` - Converts and formats temperature
  - `formatWeight(kg)` - Converts and formats weight
  - `formatSpeed(mps)` - Converts and formats speed
- Persists unit preference to localStorage
- Exports `useUnits()` hook for consuming the context

### Custom Hooks

#### use-toast (`src/hooks/use-toast.ts`)
- Toast notification hook for displaying temporary messages

### UI Components (shadcn-ui)

The project uses shadcn-ui components built on Radix UI primitives. Key components include:

- **Form Components**: `input`, `select`, `checkbox`, `label`, `textarea`
- **Layout Components**: `card`, `separator`, `sheet`, `tabs`
- **Feedback Components**: `toast`, `toaster`, `sonner`, `progress`, `alert`
- **Overlay Components**: `dialog`, `popover`, `tooltip`, `sheet`
- **Data Display**: `table`, `chart`, `kpi-card`, `stat-card`, `badge`, `avatar`
- **Navigation**: `navigation-menu`, `breadcrumb`
- **Interactive**: `button`, `switch`, `slider`, `toggle`, `calendar`

## Configuration Files

### `vite.config.ts`
- React SWC plugin for fast compilation
- Path alias: `@` → `./src`
- Development server on port 8080
- Lovable tagger plugin for development mode

### `tailwind.config.ts`
- Custom color scheme with CSS variables
- Extended theme with custom colors (primary, secondary, accent, success, warning, critical, info)
- Custom animations for accordion components
- Dark mode support via class strategy

### `tsconfig.json`
- TypeScript configuration with strict mode
- Path aliases configured for `@/*` imports

### `package.json` Scripts
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Key Features

1. **Mushroom Cultivation Monitoring**: 
   - Temperature tracking (optimal: 18-24°C)
   - Humidity monitoring (80-95% during fruiting)
   - CO2 level tracking (target: <1000 ppm)
   - Health index calculation for facilities

2. **Unit System Support**: Metric/Imperial conversion for temperature, weight, and speed

3. **AI Chatbot Assistant**: Context-aware mushroom growing advisor with knowledge base on:
   - Environmental conditions
   - Contamination prevention
   - Substrate preparation
   - Fruiting triggers
   - Harvest timing

4. **Toast Notifications**: Multiple toast systems (Radix UI + Sonner)

5. **Responsive Design**: Tailwind CSS with mobile-first approach

6. **Type Safety**: Full TypeScript implementation

7. **Form Validation**: React Hook Form + Zod schemas

8. **Data Fetching**: TanStack React Query for server state management

9. **Charts & Visualization**: Recharts for data visualization and KPI cards

10. **Multi-Facility Management**: Support for monitoring multiple shelters/facilities

## Dependencies Summary

### Core Dependencies
- React ecosystem (react, react-dom, react-router-dom)
- TypeScript
- Vite
- TanStack React Query
- React Hook Form + Zod

### UI Dependencies
- Radix UI primitives (comprehensive set)
- Tailwind CSS + tailwindcss-animate
- Lucide React (icons)
- Recharts (charts)
- Sonner (toast notifications)

### Utility Dependencies
- clsx, tailwind-merge (className utilities)
- class-variance-authority (variant management)
- date-fns (date utilities)
- cmdk (command menu)

## Development Notes

- The project has a nested `mush-the-room/` directory that appears to be a duplicate or alternative version
- Uses path aliases (`@/`) for cleaner imports
- Development server runs on port 8080
- Lovable platform integration for development workflow
- ESLint configured for code quality

## Build Output

- Production builds output to `dist/` directory
- Assets are hashed for cache busting
- HTML entry point: `index.html`

---

*Last indexed: Generated automatically*
*Project: Mush The Room*
*Framework: React + TypeScript + Vite*

