<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Photography Studio Management System

نظام شامل لإدارة استوديو التصوير الفوتوغرافي - إدارة الحجوزات، المعارض، العملاء، والموظفين

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Contributing](#contributing)

## 🎯 Project Overview

نظام متكامل لإدارة استوديو التصوير الفوتوغرافي، يشمل:
- إدارة الحجوزات والفعاليات
- إدارة المعارض والصور
- إدارة العملاء
- إدارة الموظفين
- نظام إشعارات
- تحليلات وإحصائيات

## ✨ Features

### للإدارة (Admin)
- 📅 إدارة الحجوزات والجدول الزمني
- 🖼️ إدارة المعارض والصور
- 👥 إدارة العملاء
- 💰 إدارة المالية
- 📊 التحليلات والإحصائيات
- ⚙️ إعدادات النظام

### للموظفين (Staff)
- 📋 عرض المهام المخصصة
- 📅 الجدول الزمني
- 🔔 التنبيهات
- 📊 حالة الحجوزات

### للعملاء (Public)
- 🏠 صفحة رئيسية جميلة
- 📸 معرض الأعمال
- 💼 الباقات والأسعار
- 📞 صفحة التواصل
- 🖼️ معرض الصور الخاص

## 📁 Project Structure

```
src/
├── components/          # Shared components
│   ├── ErrorBoundary.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── core/               # Core functionality
│   ├── logging/        # Logging system
│   ├── performance/    # Performance monitoring
│   └── utils/          # Utility functions
├── features/           # Feature modules (future)
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── public/         # Public pages
│   └── auth/           # Authentication pages
├── services/           # API services
│   ├── firebase.ts
│   └── clientGallery.ts
├── shared/             # Shared UI components
│   └── ui/
│       ├── theme.ts
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── toast.ts
│       └── LoadingSpinner.tsx
├── stores/             # State management
├── lib/                # Utility libraries
└── App.tsx             # Main app component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Firebase:**
```bash
cp .env.example .env
```

3. **Edit `.env` with your Firebase credentials:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Run development server:**
```bash
npm run dev
```

5. **Open browser:**
```
http://localhost:5173
```

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Copy your Firebase credentials to `.env`

### Firestore Collections

The app uses the following Firestore collections:
- `users` - User data
- `clients` - Client information
- `bookings` - Bookings and events
- `galleries` - Public galleries
- `client-galleries` - Client-specific galleries
- `photos` - Photo metadata
- `packages` - Pricing packages
- `settings` - App settings

### Firestore Indexes

Deploy the required indexes:
```bash
firebase deploy --only firestore:indexes
```

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use the shared UI components from `src/shared/ui/`
- Use the logging system from `src/core/logging/logger.ts`
- Use the performance monitor from `src/core/performance/monitor.ts`

### Adding New Features

1. Create the feature in `src/features/` (recommended)
2. Use the shared UI components
3. Add error handling with `handleApiError`
4. Add logging with `logger.info/warn/error/debug`
5. Add performance tracking with `performanceMonitor`

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
# Deploy hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

### Environment Variables

Make sure to set the following environment variables in production:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## 🏗️ Architecture

### Tech Stack

- **Frontend:** React 18 + TypeScript
- **Routing:** React Router v6
- **State Management:** Zustand
- **UI Components:** Custom components with Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Authentication:** Firebase Auth
- **Build Tool:** Vite
- **Hosting:** Firebase Hosting

### Design System

The app uses a unified design system defined in `src/shared/ui/theme.ts`:
- Consistent colors (purple, pink, blue)
- Unified spacing and typography
- Shared UI components (Button, Card, Input)
- Loading states and error handling

### Error Handling

- Global Error Boundary in `main.tsx`
- Unified toast notifications via `showToast`
- API error handling via `handleApiError`
- Logging system via `logger`

### Performance Monitoring

- Web Vitals tracking (LCP, FID, CLS)
- Component render time tracking
- API call performance tracking
- User action tracking

## 📊 Monitoring

### Logging

The app includes a comprehensive logging system:
```typescript
import { logger } from './core/logging/logger';

logger.info('User logged in', { userId: '123' }, 'auth');
logger.error('API call failed', error, 'api');
logger.warn('Deprecated feature used', null, 'feature');
logger.debug('Component rendered', { component: 'Dashboard' }, 'ui');
```

### Performance Tracking

Track performance metrics:
```typescript
import { performanceMonitor } from './core/performance/monitor';

performanceMonitor.trackPageView('/admin/dashboard');
performanceMonitor.trackAction('button_clicked', { button: 'save' });
performanceMonitor.trackPerformance('api_call', 150, 'fetch_clients');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@shady-photography.com or open an issue in the repository.

---

**Built with ❤️ for Photography Studio Management**
