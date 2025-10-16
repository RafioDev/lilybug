export const queryKeys = {
  // User and profile queries
  user: ['user'] as const,
  profile: ['profile'] as const,

  // Baby queries
  babies: ['babies'] as const,
  activeBaby: ['babies', 'active'] as const,
  baby: (id: string) => ['babies', id] as const,

  // Tracker entries queries
  entries: ['entries'] as const,
  entriesForBaby: (babyId: string, limit?: number) =>
    ['entries', 'baby', babyId, { limit }] as const,
  entry: (id: string) => ['entries', id] as const,
} as const
