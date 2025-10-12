// Example chat commands that the AI assistant can understand and execute

export const chatExamples = {
  // Creating entries
  createEntries: [
    'Log a bottle feeding of 120ml',
    'Record a dirty diaper change',
    'Add a 2 hour nap from 2pm to 4pm',
    'Track a wet diaper 30 minutes ago',
    'Log left breast feeding of 80ml',
    'Record both breast feeding',
    'Add sleep session for 1h 45m',
    "Log bottle feeding just now with note 'fussy after'",
  ],

  // Timer actions
  timerActions: [
    'Start a timer for left breast feeding',
    'Start timer for right breast',
    'Begin bottle feeding timer',
    'Start nursing timer for both sides',
  ],

  // Search queries
  searchQueries: [
    'How did baby sleep last night?',
    'Show me all feedings over 100ml this week',
    'How many dirty diapers yesterday?',
    "What's the longest sleep session?",
    "Compare this week's feeding to last week",
  ],

  // Natural language patterns the system understands
  patterns: {
    quantities: ['120ml', '4oz', '150 milliliters', '5 ounces'],
    times: ['just now', '30 minutes ago', '2 hours ago', 'from 2pm to 4pm'],
    durations: ['2 hours', '1h 30m', '45 minutes', '1.5 hours'],
    feedingTypes: [
      'bottle',
      'left breast',
      'right breast',
      'both breasts',
      'nursing',
    ],
    diaperTypes: ['wet', 'dirty', 'wet and dirty', 'both'],
  },
}

// Test function to validate parsing (for development)
export const testChatParsing = () => {
  console.log('Chat parsing examples:')
  console.log('✅ Natural language commands that work:')

  chatExamples.createEntries.forEach((example) => {
    console.log(`  • "${example}"`)
  })

  console.log('\n✅ Timer commands:')
  chatExamples.timerActions.forEach((example) => {
    console.log(`  • "${example}"`)
  })
}
