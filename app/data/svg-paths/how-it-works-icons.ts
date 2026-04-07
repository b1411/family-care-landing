/**
 * HowItWorks timeline icon morph states
 * Each point has 2-3 morph states that animate based on scroll progress
 * ViewBox: 0 0 40 40 for each icon
 */

export const timelineIconStates = {
  // Зачатие: два кольца → сближаются → соединяются
  conception: [
    // Two separate rings
    'M12 20 A5 5 0 1 0 22 20 A5 5 0 1 0 12 20 M18 20 A5 5 0 1 0 28 20 A5 5 0 1 0 18 20',
    // Rings overlap
    'M14 20 A5 5 0 1 0 24 20 A5 5 0 1 0 14 20 M16 20 A5 5 0 1 0 26 20 A5 5 0 1 0 16 20',
    // Single merged circle
    'M12 20 A8 8 0 1 0 28 20 A8 8 0 1 0 12 20 M16 20 A4 4 0 1 0 24 20 A4 4 0 1 0 16 20',
  ],
  // Беременность: силуэт с растущим животом (3 фазы)
  pregnancy: [
    // Flat silhouette
    'M20 8 A3 3 0 1 0 20 14 A3 3 0 1 0 20 8 M17 16 L17 30 M23 16 L23 30 M17 16 C17 16 20 16 23 16 M15 34 L25 34',
    // Small bump
    'M20 8 A3 3 0 1 0 20 14 A3 3 0 1 0 20 8 M17 16 L16 30 M23 16 L24 30 M17 16 C17 16 20 16 23 16 C25 22 25 24 23 28 M15 34 L25 34',
    // Full bump
    'M20 8 A3 3 0 1 0 20 14 A3 3 0 1 0 20 8 M17 16 L15 30 M23 16 L25 30 M17 16 C17 16 20 16 23 16 C27 20 28 26 25 30 M15 34 L25 34',
  ],
  // Роды: arms reaching → cradling → holding baby
  birth: [
    // Open arms
    'M20 12 A3 3 0 1 0 20 18 A3 3 0 1 0 20 12 M14 22 L10 26 M26 22 L30 26 M17 20 L17 30 M23 20 L23 30 M15 34 L25 34',
    // Arms closing
    'M20 12 A3 3 0 1 0 20 18 A3 3 0 1 0 20 12 M14 22 L12 28 M26 22 L28 28 M17 20 L17 30 M23 20 L23 30 M15 34 L25 34',
    // Holding baby (small circle in arms)
    'M20 12 A3 3 0 1 0 20 18 A3 3 0 1 0 20 12 M14 22 L14 28 M26 22 L26 28 M17 20 L17 30 M23 20 L23 30 M18 25 A2 2 0 1 0 22 25 A2 2 0 1 0 18 25',
  ],
  // 0-12 мес: лежит → сидит → ползёт
  infant: [
    // Lying baby
    'M14 22 A3 3 0 1 0 14 28 A3 3 0 1 0 14 22 M17 26 L30 26 M30 24 L32 22 M30 28 L32 30',
    // Sitting baby
    'M20 12 A3 3 0 1 0 20 18 A3 3 0 1 0 20 12 M17 20 L17 28 M23 20 L23 28 M14 28 L17 28 L23 28 L26 28 M15 28 L15 34 M25 28 L25 34',
    // Crawling baby
    'M26 16 A3 3 0 1 0 26 22 A3 3 0 1 0 26 16 M24 22 L16 26 M14 26 L12 30 M16 26 L14 24 M24 24 L22 28 M22 28 L18 30',
  ],
  // 12-24 мес: стоит → шагает
  toddler: [
    // Standing
    'M20 8 A3 3 0 1 0 20 14 A3 3 0 1 0 20 8 M17 16 L17 26 M23 16 L23 26 M17 26 L17 34 M23 26 L23 34 M14 20 L17 18 M26 20 L23 18',
    // Arms up, one foot forward
    'M20 8 A3 3 0 1 0 20 14 A3 3 0 1 0 20 8 M17 16 L17 26 M23 16 L23 26 M17 26 L15 34 M23 26 L25 34 M14 18 L11 14 M26 18 L29 14',
    // Walking (legs apart)
    'M20 8 A3 3 0 1 0 20 14 A3 3 0 1 0 20 8 M17 16 L17 26 M23 16 L23 26 M17 26 L13 34 M23 26 L27 34 M14 18 L10 16 M26 18 L30 16',
  ],
} as const
