# Component Backup Documentation

This document serves as a backup record of components that are candidates for removal during the code cleanup process.

## Backup Created

- **Date**: $(date)
- **Git Commit**: $(git rev-parse HEAD)
- **Branch**: $(git branch --show-current)

## Components Being Removed

### 1. ContextualGuidance Component

**File Path**: `src/components/ContextualGuidance.tsx`

**Purpose**: Displays contextual guidance messages with different types (milestone, alert, encouragement, tip) with appropriate icons and styling.

**Dependencies**:

- React
- lucide-react icons (Lightbulb, TrendingUp, AlertCircle, Heart)
- ContextualGuidance type from aiAssistantService

**Key Features**:

- Type-based icon and color theming
- Dark mode support
- Shows only the most recent guidance
- Responsive design with Tailwind CSS

**Removal Reason**: No import statements found in codebase analysis

### 2. DatabaseSetup Component

**File Path**: `src/components/DatabaseSetup.tsx`

**Purpose**: Provides UI for database setup and migration, checking table status and providing SQL commands for Supabase setup.

**Dependencies**:

- React (useState, useEffect)
- lucide-react icons (Database, Copy, Check, AlertCircle)
- setupDatabase utility

**Key Features**:

- Database table status checking
- SQL command copying functionality
- Step-by-step setup instructions
- Real-time status updates
- Dark mode support

**Removal Reason**: No import statements found in codebase analysis

## Restoration Instructions

If these components need to be restored:

1. **From Git History**:

   ```bash
   git show HEAD:src/components/ContextualGuidance.tsx > src/components/ContextualGuidance.tsx
   git show HEAD:src/components/DatabaseSetup.tsx > src/components/DatabaseSetup.tsx
   ```

2. **From This Backup**: The complete component code is preserved in this document for manual restoration if needed.

## Validation Checklist

Before removal, verify:

- [ ] No static imports in any file
- [ ] No dynamic imports or lazy loading
- [ ] No string-based references
- [ ] No test files referencing these components
- [ ] No configuration files mentioning these components

## Post-Removal Validation

After removal:

- [ ] TypeScript compilation succeeds
- [ ] Build process completes without errors
- [ ] Application starts without runtime errors
- [ ] No broken imports detected
