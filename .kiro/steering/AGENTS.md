# Agent Instructions

## Package Manager

**Always use `pnpm` for all package management operations.**

When running any package management commands, use `pnpm` instead of `npm` or `yarn`:

- Use `pnpm install` instead of `npm install`
- Use `pnpm build` instead of `npm run build`
- Use `pnpm dev` instead of `npm run dev`
- Use `pnpm test` instead of `npm test`
- Use `pnpm typecheck` instead of `npm run typecheck`
- Use `pnpm lint` instead of `npm run lint`

This project uses pnpm as the package manager for faster installs and better dependency management.

## Available Scripts

Common pnpm scripts available in this project:

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests (if configured)

## CSS Framework

**Always use Tailwind CSS 4 syntax and features.**

When writing CSS classes or styling components, follow Tailwind 4 conventions:

- Reference the official Tailwind CSS documentation: https://tailwindcss.com/docs
- Use modern Tailwind 4 syntax and avoid deprecated Tailwind 3 patterns
- Prefer utility-first approach with Tailwind classes
- Use Tailwind 4's improved color system and spacing scale
- Leverage new Tailwind 4 features like improved container queries and modern CSS features

**Avoid Tailwind 3 syntax** - always check the current documentation to ensure you're using the latest syntax and class names.

## TypeScript Best Practices

**Never use the `any` type in TypeScript code.**

When writing TypeScript code, always use proper typing:

- Use specific types instead of `any` (e.g., `string`, `number`, `boolean`)
- Use union types when multiple types are acceptable (e.g., `string | number`)
- Use generic types for reusable components (e.g., `<T>`, `<K extends keyof T>`)
- Use `unknown` instead of `any` when the type is truly unknown
- Use type assertions sparingly and only when absolutely necessary
- Define proper interfaces and types for all data structures
- Use `Record<string, unknown>` instead of `any` for object types with unknown properties
- Use function parameter types and return types explicitly

**Examples of proper typing:**

```typescript
// ❌ Avoid
function processData(data: any): any {
  return data.map((item: any) => item.value)
}

// ✅ Preferred
interface DataItem {
  value: string
  id: number
}

function processData(data: DataItem[]): string[] {
  return data.map((item) => item.value)
}

// ✅ For truly unknown data
function handleUnknownData(data: unknown): string {
  if (typeof data === 'string') {
    return data
  }
  return String(data)
}
```

This ensures better type safety, improved IDE support, and fewer runtime errors.

## UI Components

**Always use Shadcn/ui components instead of creating new components from scratch.**

When building UI components, prioritize using existing Shadcn/ui components:

- Reference the official Shadcn/ui documentation: https://ui.shadcn.com/docs/components
- Use existing Shadcn components as the foundation for UI elements
- Customize Shadcn components with Tailwind CSS classes as needed
- Only create new components when Shadcn doesn't provide a suitable alternative
- Follow Shadcn's component patterns and conventions

**Available Shadcn components to use:**

- `Button` - For all button interactions
- `Input` - For form inputs
- `Card` - For content containers
- `Modal/Dialog` - For overlays and modals
- `Tabs` - For tabbed interfaces
- `Select` - For dropdown selections
- `Checkbox` - For boolean inputs
- `RadioGroup` - For single-choice selections
- `Switch` - For toggle controls
- `Badge` - For status indicators
- `Alert` - For notifications and messages
- `Separator` - For visual dividers
- `Avatar` - For user profile images
- `Dropdown Menu` - For contextual menus
- `Navigation Menu` - For site navigation
- `Sheet` - For slide-out panels
- `Tooltip` - For helpful hints
- `Progress` - For loading states
- `Skeleton` - For loading placeholders

**Examples:**

```typescript
// ❌ Avoid creating custom components
const CustomButton = ({ children, onClick }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClick}>
    {children}
  </button>
)

// ✅ Use Shadcn Button component
import { Button } from "@/components/ui/button"

<Button variant="default" onClick={onClick}>
  {children}
</Button>

// ✅ Customize with Tailwind if needed
<Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={onClick}>
  {children}
</Button>
```

This approach ensures consistency, accessibility, and reduces maintenance overhead.
