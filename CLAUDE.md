# Minsah Beauty E-commerce Website

## Project Overview
Minsah Beauty is a Next.js 16 e-commerce website for beauty products with React 19, TypeScript, and Tailwind CSS.

## Package Information
- **Name**: minsah-beauty
- **Version**: 0.1.0
- **Framework**: Next.js 16.0.3
- **React**: 19.2.0
- **TypeScript**: v5
- **Styling**: Tailwind CSS v4

## Dependencies
### Main Dependencies
- @google/generative-ai: ^0.24.1 (AI integration)
- @headlessui/react: ^2.2.9 (UI components)
- @heroicons/react: ^2.2.0 (Icons)
- next: 16.0.3 (Framework)
- next-auth: ^4.24.13 (Authentication)
- react: 19.2.0 (UI library)
- react-dom: 19.2.0

### Development Dependencies
- @tailwindcss/postcss: ^4
- @types/node: ^20
- @types/react: ^19
- @types/react-dom: ^19
- eslint: ^9
- eslint-config-next: 16.0.3
- tailwindcss: ^4
- typescript: ^5

## Scripts
- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Run ESLint
- `gemini`: Run Gemini CLI
- `gemini:interactive`: Run Gemini CLI in interactive mode

## File Structure

### App Router Structure (Next.js 13+)
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── globals.css             # Global styles
├── about/
│   └── page.tsx           # About page
├── admin/
│   ├── layout.tsx         # Admin layout
│   ├── page.tsx           # Admin dashboard
│   ├── AdminLayoutWrapper.tsx
│   ├── analytics/
│   │   └── page.tsx       # Analytics page
│   ├── customers/
│   │   └── page.tsx       # Customer management
│   ├── login/
│   │   └── page.tsx       # Admin login
│   ├── orders/
│   │   └── page.tsx       # Order management
│   └── products/
│       └── page.tsx       # Product management
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts   # NextAuth API
├── blog/
│   └── page.tsx           # Blog page
├── cart/
│   └── page.tsx           # Shopping cart
├── categories/
│   └── page.tsx           # Product categories
├── checkout/
│   └── page.tsx           # Checkout process
├── components/            # Reusable components
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── MegaMenu.tsx
│   ├── MobileMenu.tsx
│   ├── ProductCard.tsx
│   ├── SocialFloatingButtons.tsx
│   └── TopBar.tsx
├── contact/
│   └── page.tsx           # Contact page
├── faq/
│   └── page.tsx           # FAQ page
├── login/
│   └── page.tsx           # User login
├── not-found.tsx          # 404 page
├── products/
│   └── [id]/
│       └── page.tsx       # Product detail page
├── register/
│   └── page.tsx           # User registration
├── shop/
│   └── page.tsx           # Shop page
└── wishlist/
    └── page.tsx           # Wishlist page
```

### Context Providers
- `contexts/AdminAuthContext.tsx` - Admin authentication context
- `contexts/AuthContext.tsx` - User authentication context
- `contexts/DarkModeContext.tsx` - Dark mode context

### Data Files
- `data/categories.ts` - Product categories data

### Configuration Files
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `middleware.ts` - Next.js middleware

### Special Files
- `gemini-cli.js` - Gemini CLI tool (referenced in scripts)

## Key Features
- E-commerce functionality with product catalog
- User authentication and registration
- Admin dashboard for managing products, orders, and customers
- Shopping cart and wishlist
- Responsive design with mobile support
- Dark mode support
- Blog functionality
- AI integration with Google Generative AI
- Analytics dashboard

## Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Heroicons
- **Authentication**: NextAuth.js
- **AI Integration**: Google Generative AI
- **Development**: ESLint, TypeScript

## Project Notes
- ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
  Learn more: https://nextjs.org/docs/messages/middleware-to-proxy. Ignore It