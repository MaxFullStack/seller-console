# Seller Console

## 🚀 Project

The **Seller Console** is a modern React application built with **React 19**, using **Vite** as the bundler and **TypeScript** for static typing. The focus was on applying feature-based architecture and best practices, following principles such as **SOLID**, **KISS**, **DRY**, and **Clean Code**.

The app uses **TanStack Router** and **TanStack Table**, with **Zustand** for global state management, **React Hook Form** for robust form handling, and **Zod** for comprehensive validations. The UI is built with **shadcn/ui** components and **Tailwind CSS 4**.

## 🔗 Links

* Deploy: [https://seller-console-max.vercel.app/](https://seller-console-max.vercel.app/)
* Repository: [https://github.com/MaxFullStack/seller-console](https://github.com/MaxFullStack/seller-console)

## 📦 Key Technologies

### Frontend Framework
* **React 19** + **TypeScript** - Latest React with full type safety
* **Vite 7** - Fast build tool and dev server

### UI & Styling
* **TailwindCSS 4** - Utility-first CSS framework
* **shadcn/ui** - High-quality, accessible React components
* **Radix UI** - Unstyled, accessible UI primitives
* **Lucide Icons** - Beautiful & consistent icons

### State Management & Data
* **Zustand** - Lightweight global state management
* **TanStack Router** - Type-safe routing
* **TanStack Table** - Powerful data tables

### Forms & Validation
* **React Hook Form** - Performant forms with easy validation
* **Zod** - TypeScript-first schema validation
* **@hookform/resolvers** - Form validation resolvers

### Testing
* **Vitest** - Fast unit test framework
* **Testing Library** - Simple and complete testing utilities
* **Playwright** - End-to-end testing

## 📜 Available Scripts

In the `package.json`, the following commands are available:

```bash
# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# TypeScript type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Code formatting with Prettier
npm run format

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
npm run test:all          # Run all tests (unit + e2e)

# Husky (git hooks)
npm run prepare
```

## ✅ Code Quality & Standards

### Development Standards
* **ESLint + Prettier** configured for consistent code style
* **Husky + lint-staged** to ensure commit quality  
* **TypeScript strict mode** enabled for maximum type safety
* Consistent use of **arrow functions** instead of `function`
* **Feature-based architecture** for better code organization

### Form Implementation
* **React Hook Form** for performant form handling
* **Zod schemas** for robust validation
* **shadcn/ui Form components** for consistent UI
* Type-safe form data with TypeScript inference

### Testing Strategy
* **Unit tests** for components and business logic
* **Integration tests** for complete workflows
* **E2E tests** with Playwright for user scenarios
* **Comprehensive test coverage** including form validation

### Best Practices
* **SOLID**, **KISS**, **DRY** principles applied
* Clean Code architecture
* Accessibility-first approach with ARIA support
* Mobile-responsive design

## 🚀 Features

### Lead Management
* **Lead tracking and qualification** - Complete pipeline from new to qualified leads
* **Inline editing** - Update lead status and email directly in the interface
* **Advanced filtering** - Search and filter leads by status, source, and other criteria
* **Lead conversion** - Transform qualified leads into opportunities

### Opportunity Pipeline
* **Opportunity management** - Track deals through different stages
* **Lead-to-opportunity conversion** - Seamless workflow with form validation
* **Pipeline visualization** - Clear view of opportunity stages and values
* **Account management** - Associate opportunities with companies

### User Experience
* **Responsive design** - Works perfectly on desktop and mobile
* **Accessible interface** - ARIA compliant and keyboard navigation
* **Real-time updates** - Instant feedback on all actions
* **Professional UI** - Clean, modern interface with shadcn/ui components

### Technical Excellence
* **Type-safe development** - Full TypeScript coverage
* **Form validation** - Robust validation with Zod schemas
* **Performance optimized** - Efficient rendering and state management
* **Comprehensive testing** - Unit, integration, and E2E test coverage

---

This project demonstrates **modern React development practices** with a focus on **code quality, user experience, and maintainability**.

---

## 📄 License

This project is licensed under the **MIT License**.
