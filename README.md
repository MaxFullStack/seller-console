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

## 🚀 CI/CD Pipeline & Deployment

This project implements a complete and professional CI/CD pipeline with GitHub Actions and GitHub Pages, following international best practices.

### 🎯 What has been configured:

**1. GitHub Actions Workflows:**
- `ci.yml` - Main pipeline with quality checks
- `deploy.yml` - Automatic deployment to GitHub Pages  
- `codeql.yml` - CodeQL security analysis
- `auto-update.yml` - Automatic maintenance

**2. Environment Strategy:**
- **Development** (`dev`) - Local development
- **Staging** (`staging`) - Staging environment at `/staging/`
- **Production** (`main`) - Production at root

**3. Quality Checks:**
- ESLint, TypeScript, Prettier
- Unit tests (Vitest) + Integration tests + coverage (80%+) - 106 tests passing
- E2E tests (Playwright) with proper timeout handling
- Security audit
- Mandatory quality gate

**4. Security Configurations:**
- Dependabot for automatic updates
- CodeQL for vulnerability analysis
- Branch protection (configure manually)

**5. Complete Documentation:**
- `docs/CI-CD.md` - Complete technical documentation
- `.github/DEPLOYMENT.md` - Deployment and troubleshooting guide

### 🚀 How to use:

1. **Configure GitHub Pages**: Settings > Pages > Source: "GitHub Actions"

2. **Automatic deployment:**
   - Push to `staging` → Deploy to staging
   - Push to `main` → Deploy to production

3. **Manual deployment:** GitHub Actions > "Deploy to GitHub Pages" > Run workflow

---

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
npm run test              # Run all tests (unit + integration)
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
npm run test:e2e:headed   # Run E2E tests with browser UI
npm run test:e2e:ui       # Run E2E tests with Playwright UI
npm run test:e2e:debug    # Debug E2E tests step by step
npm run test:all          # Run all tests (unit + integration + e2e)

# Husky (git hooks)
npm run prepare
```

## 🔧 Local Development

### Prerequisites
- **Node.js 18+** - Required for running the application
- **npm** - Package manager included with Node.js

### Getting Started

1. **Clone and install:**
   ```bash
   git clone https://github.com/MaxFullStack/seller-console.git
   cd seller-console
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # Opens at http://localhost:5173
   ```

3. **Run tests:**
   ```bash
   npm run test              # All tests (unit + integration)
   npm run test:unit         # Unit tests only (fast)
   npm run test:integration  # Integration tests only
   npm run test:e2e          # E2E tests (requires dev server)
   npm run test:all          # All tests
   ```

4. **Quality checks:**
   ```bash
   npm run typecheck         # TypeScript validation
   npm run lint              # Code linting
   npm run format            # Code formatting
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
* **Unit tests** (88 tests) and **Integration tests** (18 tests) for comprehensive coverage (106 tests, all passing)
* **Integration tests** for complete workflows
* **E2E tests** with Playwright following official best practices
* **Comprehensive test coverage** including form validation
* **Mock data system** with automated fallbacks for reliable testing
* **Optimized timeouts** preventing infinite hangs in CI/CD pipelines
* **Clean test output** with no warnings or console noise

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
