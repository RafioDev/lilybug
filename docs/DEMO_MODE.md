# Demo Mode

Demo mode allows potential users and employers to explore Lilybug without creating an account.

## Features

- **No Authentication Required**: Access the app immediately at `/demo`
- **Sample Data**: Pre-populated with realistic baby tracking data
- **Full UI Experience**: Explore all features including activities, insights, and the interface
- **Read-Only**: Changes are logged to console but not persisted
- **Visual Indicator**: Amber banner at the top indicates demo mode

## Routes

- `/demo` - Main demo activities page
- `/demo/settings` - Demo settings page
- `/demo-welcome` - Optional landing page with demo introduction

## Access Points

1. **Auth Page**: "View Demo" button on the sign-in page
2. **Direct URL**: Navigate directly to `/demo`
3. **Landing Page**: Optional `/demo-welcome` for a guided introduction

## Implementation

### Key Files

- `src/contexts/DemoContext.tsx` - Provides demo data and context
- `src/components/DemoLayout.tsx` - Layout wrapper with demo banner
- `src/pages/DemoActivities.tsx` - Demo version of activities page
- `src/hooks/queries/useDemoQueries.ts` - Mock query hooks for demo data
- `src/hooks/queries/useContextualQueries.ts` - Switches between real/demo queries

### Demo Data

The demo includes:

- 1 demo baby (3 months old)
- Sample activities from today and yesterday
- Feeding, sleep, and diaper entries
- Realistic timestamps and quantities

### Customization

To modify demo data, edit `src/contexts/DemoContext.tsx`:

```typescript
const generateDemoData = () => {
  // Modify demo user, profile, babies, or entries here
}
```

## Usage for Employers

When showcasing to potential employers:

1. Share the `/demo` URL
2. Highlight the full feature set without requiring sign-up
3. Explain that it demonstrates the complete user experience
4. Note that the demo uses the same components as the real app

## Future Enhancements

- Add more sample data (multiple days, various activity types)
- Interactive tutorial overlay in demo mode
- Ability to "reset" demo data
- Demo-specific insights and patterns
