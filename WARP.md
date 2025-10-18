# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Prod-Sense** is a React-based Product Manager training application called "Product Sense Gym". It's designed to help aspiring and current PMs practice product thinking skills by deconstructing real-world apps (like Swiggy and Spotify) through guided exercises.

### Key Features
- Interactive product critique exercises with role-based questions (Entry, Mid, Senior PM levels)
- AI-powered feedback using Google's Gemini API
- Multi-step user flows: product selection → role selection → flow analysis → AI feedback → performance summary
- Responsive UI built with React + Tailwind CSS

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

### Single File Operations
```bash
# Lint specific file
npx eslint src/App.jsx

# Check Tailwind classes in specific component
# (No specific command, but use browser dev tools to inspect generated CSS)
```

## Architecture & Structure

### Application Architecture
This is a single-page React application with a state machine pattern:

**State Flow**: `landing` → `selection` → `flowSelection` → `critique` → `summary`

**Core State Management**: All managed in the main `App.jsx` component using React hooks:
- `screen`: Controls which view is displayed
- `selectedProduct`: Currently selected product (Swiggy/Spotify)
- `selectedRole`: PM role level (Entry/Mid/Senior)
- `selectedFlow`: User flow being analyzed
- `finalAnswers`: User responses collected during critique

### Key Components
- **LandingPage**: Welcome screen with feature overview
- **ProductAndRoleSelection**: Product and PM role selection interface
- **FlowSelection**: Choose specific user flow to analyze
- **CritiqueView**: Main interaction component with questions, answers, and AI feedback
- **SummaryView**: Final performance evaluation

### Data Structure
The `productData` object in `App.jsx` contains:
- Product definitions (icon, description)
- Nested flows for each product
- Role-specific questions with placeholders for each flow

### AI Integration
- **API**: Google Gemini 2.5 Flash Preview
- **Functions**: `getAIFeedback()` for individual question feedback, `getAISummary()` for final evaluation
- **Environment**: Requires `VITE_GEMINI_API_KEY` in `.env.local`

### Styling Approach
- **Framework**: Tailwind CSS with custom configuration
- **Strategy**: Utility-first with conditional classes based on state
- **Responsiveness**: Mobile-first design with `sm:` and `lg:` breakpoints
- **Icons**: Lucide React icon library

## Environment Setup

### Required Environment Variables
Create a `.env.local` file with:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Development Stack
- **Build Tool**: Vite (fast HMR and optimized builds)
- **React Version**: 18.3.1 with React DOM
- **Linting**: ESLint with React-specific rules
- **PostCSS**: Autoprefixer integration for browser compatibility

## Important Implementation Notes

### State Management Pattern
- Uses React's built-in state management (no external state library)
- State lifting pattern: all major state in `App.jsx`
- Screen transitions handled through conditional rendering

### API Error Handling
- All API calls wrapped in try-catch blocks
- Graceful degradation with user-friendly error messages
- Loading states for better UX during API calls

### Responsive Design Considerations
- Textarea auto-resize for better mobile experience
- Button layouts adapt from vertical stack (mobile) to horizontal (desktop)
- Progress indicators scale appropriately

### Performance Considerations
- Single component file pattern (all components in `App.jsx`)
- Minimal bundle size with focused dependencies
- Efficient re-renders through proper key usage in lists
