/**
 * TimelinePhone — SVG element data for Hero phone animation
 * Used by TimelinePhone.vue
 */

export const phoneFrame = {
  width: 180,
  height: 360,
  rx: 24,
  stroke: 'var(--color-border, #E5E0DA)',
  fill: '#ffffff',
}

export const timelineEvents = [
  {
    y: 60,
    icon: 'M8,4 A4,4 0 1,1 8,12 A4,4 0 1,1 8,4', // stethoscope circle
    label: 'Визит к гинекологу',
    color: '#2A9D8F',
  },
  {
    y: 110,
    icon: 'M4,2 L12,2 L12,14 L4,14 Z M6,6 L10,6 M6,9 L10,9', // lab result
    label: 'Анализ крови',
    color: '#264653',
  },
  {
    y: 160,
    icon: 'M4,8 C4,4 8,2 8,2 C8,2 12,4 12,8 C12,12 8,16 8,16 C8,16 4,12 4,8', // heart
    label: 'УЗИ 20 нед.',
    color: '#E76F51',
  },
  {
    y: 210,
    icon: 'M8,2 L8,14 M4,6 L12,6 M4,10 L12,10 M5,14 L11,14 L11,16 L5,16 Z', // syringe
    label: 'АКДС №1',
    color: '#E9C46A',
  },
  {
    y: 260,
    icon: 'M4,4 L12,4 L12,14 L4,14 Z M4,2 L12,2 M7,7 L7,11 M5,9 L9,9', // calendar
    label: 'Осмотр педиатра',
    color: '#2A9D8F',
  },
]

export const notificationCard = {
  text: 'Завтра: УЗИ 20 нед.',
  subtext: '10:00, каб. 305',
}

export const prescriptionPill = {
  text: 'Витамин D3 — 08:00',
}

export const floatingIcons = [
  { icon: 'heart', x: 10, y: 60, delay: 0 },
  { icon: 'flask', x: 210, y: 100, delay: 0.5 },
  { icon: 'calendar', x: 15, y: 220, delay: 1 },
  { icon: 'bell', x: 205, y: 260, delay: 1.5 },
]
