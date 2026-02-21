# Demo Mode Functionality

## Overview

The demo mode now has full CRUD (Create, Read, Update, Delete) functionality that works without a database by using React Query's cache as an in-memory data store.

## How It Works

### State Management

1. **Initial Data**: Demo entries are generated in `DemoContext` and stored in React Query cache on mount
2. **Cache Key**: All demo data uses the cache key `['entries', 'demo', 'all']`
3. **Mutations**: Create, update, and delete operations modify the cache directly
4. **Reactivity**: React Query automatically triggers re-renders when cache updates

### Implemented Features

#### ✅ Create (Add Activity)

- Click the "+" button in the footer
- Fill out the activity form
- Click "Save Activity"
- New entry appears immediately in the list

#### ✅ Read (View Activities)

- All activities display in the activities list
- Grouped by date (Today, Yesterday, etc.)
- Shows activity type, time, duration, and details

#### ✅ Update (Edit Activity)

- Click the "..." menu on any activity
- Select "Edit"
- Modify the activity details
- Click "Save" to update
- Changes reflect immediately

#### ✅ Delete (Remove Activity)

- Click the "..." menu on any activity
- Select "Delete"
- Confirm deletion in the modal
- Activity is removed from the list

#### ✅ Stop In-Progress Activity

- If an activity is in progress (no end time)
- Click "Stop" in the footer
- End time is set to current time
- Activity updates to show duration

## Technical Implementation

### Key Files

**`src/hooks/queries/useDemoQueries.ts`**

- `useDemoCreateEntry`: Adds new entry to cache
- `useDemoUpdateEntry`: Updates existing entry in cache
- `useDemoDeleteEntry`: Removes entry from cache
- All mutations invalidate queries to trigger re-renders

**`src/contexts/DemoContext.tsx`**

- Generates initial demo data
- Initializes React Query cache with demo entries
- Provides demo context to child components

**`src/pages/DemoActivities.tsx`**

- Handles edit/delete modal state
- Connects UI actions to demo mutations
- Manages confirmation dialogs

**`src/components/DemoLayout.tsx`**

- Handles "Add Activity" modal from footer
- Manages in-progress activity stopping
- Provides consistent demo experience

### Data Flow

```
User Action → Component Handler → Demo Mutation → Cache Update → Query Invalidation → UI Re-render
```

Example for Delete:

1. User clicks "Delete" on activity
2. `handleDeleteEntry` opens confirmation modal
3. User confirms deletion
4. `useDemoDeleteEntry` mutation executes
5. Entry removed from cache at `['entries', 'demo', 'all']`
6. All entry queries invalidated
7. Components re-fetch from cache
8. UI updates to show entry removed

## Limitations

- **Session-Only**: Changes persist only during the current browser session
- **No Persistence**: Refreshing the page resets to initial demo data
- **Single User**: Demo data is not shared across tabs/windows
- **No Validation**: Some backend validations may be skipped

## User Experience

### Visual Feedback

- Modals open/close smoothly
- Confirmation dialogs for destructive actions
- Loading states during mutations
- Immediate UI updates after actions

### Demo Banner

- Amber banner at top indicates demo mode
- Reminds users that changes aren't saved permanently
- Provides context for the experience

## Future Enhancements

- Add toast notifications for actions
- Implement undo functionality
- Add more sample data variety
- Create demo-specific tutorials
- Add "Reset Demo" button to restore initial state
