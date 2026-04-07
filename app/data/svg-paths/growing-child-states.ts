/**
 * GrowingChild — 5 morph states for scroll-driven SVG morphing
 * Style: outline stroke, teal color, rounded line-caps
 * ViewBox: 0 0 200 150
 * Each state: ~20 path elements forming simplified child outline
 */

// State 1: Lying baby (horizontal)
export const childLying = 'M60,110 C60,110 65,95 80,90 C95,85 110,85 120,90 C130,95 135,100 140,105 C140,105 135,110 120,112 C105,114 75,114 60,110 Z M85,88 C83,82 88,76 95,76 C102,76 107,82 105,88 M75,95 C70,100 62,105 58,108 M130,98 C135,103 140,108 145,110'

// State 2: Propped up (semi-reclined)
export const childPropped = 'M70,115 C70,115 72,100 80,92 C88,84 95,80 100,78 C105,80 108,84 110,90 C112,96 112,105 110,112 C108,115 90,118 70,115 Z M95,75 C93,69 96,63 103,63 C110,63 113,69 111,75 M78,95 C72,98 65,105 60,110 M112,95 C118,100 125,108 130,112'

// State 3: Sitting upright
export const childSitting = 'M80,120 C80,120 82,115 85,112 C88,112 108,112 112,112 C115,115 117,120 117,120 C117,120 100,122 80,120 Z M90,112 C88,100 90,88 95,80 C100,88 102,100 100,112 M95,78 C92,72 94,65 100,64 C106,64 108,72 105,78 M88,95 C82,96 76,98 72,100 M102,95 C108,96 114,98 118,100'

// State 4: Crawling
export const childCrawling = 'M50,118 C55,115 60,112 68,110 C76,108 85,106 90,108 C95,110 98,115 100,118 M90,108 C92,100 95,92 100,88 C105,92 107,100 105,108 M100,86 C98,80 100,74 106,73 C112,73 114,80 112,86 M68,110 C65,115 58,120 52,122 M105,108 C110,112 118,118 125,120 M52,118 C48,115 44,118 42,122 M125,118 C128,115 132,118 134,122'

// State 5: Walking upright
export const childWalking = 'M92,120 C90,112 88,105 88,100 C88,95 90,90 92,88 M108,120 C106,114 104,108 102,102 C101,97 100,92 100,88 M92,88 C90,80 92,72 96,68 C100,72 102,80 100,88 M96,66 C93,60 95,53 100,52 C105,52 107,60 104,66 M90,82 C84,84 78,86 74,88 M102,80 C108,78 114,76 118,75'

export const childStates = [
  childLying,
  childPropped,
  childSitting,
  childCrawling,
  childWalking,
]

export const childStageLabels = [
  { age: '0 мес', label: 'Новорождённый' },
  { age: '3 мес', label: 'Приподнимается' },
  { age: '6 мес', label: 'Сидит' },
  { age: '9 мес', label: 'Ползает' },
  { age: '12–24 мес', label: 'Ходит' },
]
