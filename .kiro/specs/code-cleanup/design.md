# Design Document

## Overview

The code cleanup system will analyze the React application's component usage patterns to identify and safely remove unused components. Based on the analysis of the current codebase, the system will use static analysis to map component dependencies and identify candidates for removal.

## Architecture

The cleanup process follows a three-phase approach:

1. **Discovery Phase**: Scan and map all component files and their usage patterns
2. **Analysis Phase**: Identify unused components and assess removal safety
3. **Cleanup Phase**: Remove unused components and validate the changes

### Component Usage Analysis Results

From the current codebase analysis, here are the component usage patterns:

**Used Components:**

- `AIInsights` - Used in DashboardPage
- `ActivityForm` - Used in ActivityModal
- `ActivityGroup` - Used in GroupedActivitiesList
- `ActivityModal` - Lazy loaded in LazyModals, used in AIHomePage and BabyManagementPage
- `AppLayout` - Used in router.tsx
- `BabyForm` - Used in BabyModal
- `BabyModal` - Lazy loaded in LazyModals, used in BabyManagementPage
- `BabySelector` - Internal dependencies only
- `Button` - Widely used across multiple pages and components
- `ButtonGroup` - Used by Button component
- `Card` - Used in multiple pages (AIHomePage, OnboardingPage, AuthPage, DashboardPage)
- `ConfirmationModal` - Used in AIHomePage and BabyManagementPage
- `DateHeader` - Used in ActivityGroup
- `FloatingAIAssistant` - Used in AppLayout
- `GlobalAIAssistant` - Internal dependencies only
- `GroupedActivitiesList` - Used in AIHomePage
- `Input` - Widely used across forms and components
- `Layout` - Used in AIHomePage and DashboardPage
- `LazyModals` - Exports lazy-loaded modals
- `LoadingState` - Used in BabyManagementPage and BabySelector
- `MobileHeader` - Used in AppLayout
- `Modal` - Used in AIHomePage and ConfirmationModal
- `ModalForm` - Used in BabyModal and ActivityModal
- `NavBar` - Used in AppLayout
- `Sidebar` - Used in AppLayout
- `ThemeToggle` - Used in UserDropdown
- `UserDropdown` - Used in Sidebar and MobileHeader

**Potentially Unused Components:**

- `ContextualGuidance` - No direct imports found
- `DatabaseSetup` - No direct imports found

## Components and Interfaces

### ComponentAnalyzer

```typescript
interface ComponentAnalyzer {
  scanComponents(): ComponentMap
  findUsages(componentName: string): UsageInfo[]
  identifyUnused(): UnusedComponent[]
}

interface ComponentMap {
  [componentName: string]: ComponentInfo
}

interface ComponentInfo {
  filePath: string
  exports: string[]
  imports: ImportInfo[]
  usages: UsageInfo[]
}

interface UsageInfo {
  filePath: string
  importType: 'named' | 'default' | 'dynamic'
  lineNumber: number
}

interface UnusedComponent {
  name: string
  filePath: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
}
```

### CleanupExecutor

```typescript
interface CleanupExecutor {
  removeComponent(componentPath: string): CleanupResult
  validateBuild(): boolean
  createBackup(): BackupInfo
}

interface CleanupResult {
  success: boolean
  removedFiles: string[]
  errors: string[]
}
```

## Data Models

### Component Dependency Graph

The system will build a directed graph where:

- Nodes represent components
- Edges represent import relationships
- Leaf nodes with no incoming edges are potential candidates for removal

### Usage Confidence Scoring

Components are scored based on:

- **High Confidence (90-100%)**: No static imports found, no dynamic imports detected
- **Medium Confidence (70-89%)**: No static imports, but potential dynamic usage patterns
- **Low Confidence (0-69%)**: Complex usage patterns or potential runtime references

## Error Handling

### Safe Removal Validation

1. **Pre-removal checks**:

   - Verify no remaining static imports
   - Check for dynamic import patterns
   - Scan for string-based component references
   - Validate no test files reference the component

2. **Post-removal validation**:

   - Run TypeScript compilation
   - Execute build process
   - Validate no broken imports

3. **Rollback mechanism**:
   - Git-based backup before changes
   - Ability to restore individual components
   - Validation of successful rollback

### Error Recovery

- If build fails after removal, automatically restore from backup
- Provide detailed error messages for manual intervention
- Log all changes for audit trail

## Testing Strategy

### Validation Tests

1. **Static Analysis Tests**:

   - Verify component discovery accuracy
   - Test import pattern recognition
   - Validate dependency graph construction

2. **Removal Safety Tests**:

   - Test removal of known unused components
   - Verify build success after removal
   - Test rollback functionality

3. **Integration Tests**:
   - End-to-end cleanup process
   - Validate application functionality post-cleanup
   - Performance impact measurement

## Implementation Approach

### Phase 1: Analysis Implementation

- Build component scanner using file system traversal
- Implement import pattern matching using AST parsing
- Create dependency graph visualization

### Phase 2: Safety Validation

- Implement build validation checks
- Create backup and restore mechanisms
- Add confidence scoring algorithm

### Phase 3: Cleanup Execution

- Implement safe component removal
- Add post-removal validation
- Create cleanup reporting

## Current Cleanup Candidates

Based on the analysis, the following components appear to be unused:

1. **ContextualGuidance** (`src/components/ContextualGuidance.tsx`)

   - Confidence: High
   - Reason: No import statements found in codebase

2. **DatabaseSetup** (`src/components/DatabaseSetup.tsx`)
   - Confidence: High
   - Reason: No import statements found in codebase

These components should be validated for removal in the implementation phase.
