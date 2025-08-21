# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Seller Console** - a lightweight React application for triaging leads and converting them to opportunities. The project is built as an MVP assessment focusing on structure and code quality.

### Core Features
- **Leads Management**: Display leads from local JSON with search, filter, and sort capabilities
- **Lead Detail Panel**: Slide-over panel for inline editing of lead status and email
- **Opportunity Conversion**: Convert leads to opportunities with basic form validation
- **Data Simulation**: Uses local JSON and setTimeout to simulate backend latency

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run typecheck        # Run TypeScript type checking
npm run format           # Format code with Prettier

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
```

## Architecture

### Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: React hooks (no external state library)
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier + Husky (pre-commit hooks)

### Project Structure
- `src/components/`: React components including shadcn/ui components
- `src/components/ui/`: Reusable UI components (shadcn/ui)
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions and shared logic
- `docs/GOAL.MD`: Detailed project requirements and constraints

### Key Dependencies
- **UI Components**: Radix UI primitives + shadcn/ui system
- **Icons**: Lucide React
- **Validation**: Zod for schema validation
- **Utilities**: clsx, tailwind-merge, class-variance-authority

### Component Architecture
The app uses a sidebar-based layout with:
- `AppSidebar`: Main navigation sidebar
- `SiteHeader`: Top header with search functionality
- `SidebarProvider`: Context for sidebar state management

### Path Aliases
- `@/`: Points to `src/` directory
- `@/components`: Component imports
- `@/lib`: Utility functions
- `@/hooks`: Custom hooks

## Development Notes

### Data Requirements
- Leads should contain: id, name, company, email, source, score, status
- Opportunities should contain: id, name, stage, amount (optional), accountName
- Target ~100 leads for performance testing

### Quality Standards
- TypeScript strict mode enabled
- Pre-commit hooks run lint and format automatically
- All components should follow shadcn/ui patterns
- Use Tailwind for styling consistently