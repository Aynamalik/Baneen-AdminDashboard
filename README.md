# Baneen Admin Panel

A modern, responsive web application built with React for managing the Baneen ride-hailing platform.

## Features

- Real-time ride monitoring
- User and driver management
- SOS emergency alert handling
- Complaint resolution system
- Analytics and reporting dashboard
- Subscription plan management
- Chatbot monitoring
- Payment and transaction management

## Technology Stack

- **React 18.x** - UI Framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI) v5** - Component library
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form + Yup** - Form handling and validation

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API endpoints:
```
VITE_API_BASE_URL=https://baneen-api.railway.app/api/v1
VITE_SOCKET_URL=https://baneen-api.railway.app
VITE_APP_NAME=Baneen Admin
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
baneen-admin/
├── public/          # Static assets
├── src/
│   ├── assets/     # Images, icons, fonts
│   ├── components/ # Reusable components
│   ├── pages/      # Page components
│   ├── services/   # API services
│   ├── store/      # Redux store
│   ├── hooks/      # Custom hooks
│   ├── utils/      # Utility functions
│   ├── routes/     # Route configuration
│   └── theme.js    # MUI theme configuration
└── package.json
```

## Development Phases

### Phase 1: Setup & Foundation ✅ COMPLETED
- ✅ Project initialization (Vite + React)
- ✅ Theme and design system (MUI with pink/purple theme)
- ✅ Basic layout components (Header, Sidebar, Footer, AuthLayout, DashboardLayout)
- ✅ Routing and authentication structure
- ✅ Login page with email/phone support
- ✅ Forgot password page
- ✅ Protected routes with authentication check
- ✅ Redux store setup (auth, UI slices)
- ✅ API client with interceptors
- ✅ Error handling and loading states
- ✅ Dashboard page (basic structure)

### Phase 2: Core Pages (Next)
- Dashboard with overview cards
- User management pages
- Driver management pages
- Basic ride listing

## License

Private - Baneen Project

