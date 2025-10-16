# Dark Mode Contrast Standards

## Text Color Standards

### Primary Text

- **Light mode**: `text-gray-900`
- **Dark mode**: `text-gray-100`
- **Usage**: Main headings, primary content

### Secondary Text

- **Light mode**: `text-gray-700`
- **Dark mode**: `text-gray-200`
- **Usage**: Subheadings, important secondary content

### Body Text

- **Light mode**: `text-gray-600`
- **Dark mode**: `text-gray-300`
- **Usage**: Labels, descriptions, card text

### Muted Text

- **Light mode**: `text-gray-500`
- **Dark mode**: `text-gray-400`
- **Usage**: Timestamps, helper text, placeholders

### Disabled Text

- **Light mode**: `text-gray-400`
- **Dark mode**: `text-gray-500`
- **Usage**: Disabled states, very subtle text

## Interactive Element Colors

### Blue Elements (Primary)

- **Light mode**: `text-blue-600`
- **Dark mode**: `text-blue-400`
- **Usage**: Links, primary actions, active states

### Green Elements (Success)

- **Light mode**: `text-green-600`
- **Dark mode**: `text-green-400`
- **Usage**: Success states, positive actions

### Red Elements (Danger)

- **Light mode**: `text-red-600`
- **Dark mode**: `text-red-400`
- **Usage**: Error states, delete actions

## Icon Colors

### Default Icons

- **Light mode**: `text-gray-600`
- **Dark mode**: `text-gray-400`
- **Usage**: General icons, navigation icons

### Subtle Icons

- **Light mode**: `text-gray-400`
- **Dark mode**: `text-gray-500`
- **Usage**: Decorative icons, loading states

## Implementation Pattern

Always use both light and dark mode classes:

```tsx
className = 'text-gray-600 dark:text-gray-300'
```

## Examples Applied

✅ **Good Contrast**:

- Stats labels: `text-gray-600 dark:text-gray-300`
- Voice interface text: `text-gray-700 dark:text-gray-200`
- Helper text: `text-gray-500 dark:text-gray-400`
- Blue accents: `text-blue-600 dark:text-blue-400`

❌ **Poor Contrast** (Fixed):

- ~~`text-gray-600`~~ → `text-gray-600 dark:text-gray-300`
- ~~`text-gray-500`~~ → `text-gray-500 dark:text-gray-400`
- ~~`text-blue-600`~~ → `text-blue-600 dark:text-blue-400`
