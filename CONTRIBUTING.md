# Contributing to Studio Manager

Thank you for your interest in contributing to Studio Manager! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/studio-manager.git
   cd studio-manager
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
5. Set up your Firebase credentials in `.env`

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3003`

## Code Style

### TypeScript

- Use TypeScript strict mode
- Avoid using `any` types
- Use interfaces for object shapes
- Use generics for reusable components

### Formatting

We use Prettier for code formatting:
```bash
npm run format
```

### Linting

We use ESLint for code quality:
```bash
npm run lint
npm run lint:fix
```

### Type Checking

Check TypeScript types:
```bash
npm run typecheck
```

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── services/      # API and business logic
├── stores/        # Zustand state management
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
├── utils/         # Helper functions
├── types/         # TypeScript type definitions
└── layouts/       # Layout components
```

## Commit Guidelines

### Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(booking): add booking confirmation email
fix(auth): resolve login issue with Google OAuth
docs(readme): update installation instructions
```

## Pull Request Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run linting and formatting:
   ```bash
   npm run lint:fix
   npm run format
   npm run typecheck
   ```
4. Commit your changes
5. Push to your fork
6. Create a Pull Request

## Testing

Before submitting a PR, ensure:
- Code follows the project style guide
- All tests pass (when tests are added)
- TypeScript types are correct
- No console errors or warnings

## Questions?

Feel free to open an issue for questions or suggestions.
