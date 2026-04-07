/**
 * Module icons — SVG path data for 8 module cards
 * ViewBox: 0 0 40 40 for each icon
 * Style: outline/line art, stroke-width 2, stroke-linecap round
 */

export const moduleIcons = {
  carePlan: {
    label: 'Маршрут наблюдения',
    description: 'Автоматическая генерация маршрутов по протоколам',
    // Gear icon
    path: 'M20,14 A6,6 0 1,1 20,26 A6,6 0 1,1 20,14 M20,8 L20,11 M20,29 L20,32 M8,20 L11,20 M29,20 L32,20 M11.5,11.5 L13.6,13.6 M26.4,26.4 L28.5,28.5 M28.5,11.5 L26.4,13.6 M13.6,26.4 L11.5,28.5',
    hoverAnimation: { rotation: 60, transformOrigin: 'center center' },
  },
  timeline: {
    label: 'Хронология',
    description: 'Визуальный прогресс маршрута семьи',
    // Line chart
    path: 'M8,30 L14,22 L20,25 L26,15 L32,10 M8,30 L8,8 M8,30 L32,30',
    hoverAnimation: { strokeDashoffset: 0 },
    needsStrokeDraw: true,
  },
  prescriptions: {
    label: 'Умные назначения',
    description: 'Контроль приёма витаминов и лекарств',
    // Pill capsule
    path: 'M16,12 C16,9 18,7 20,7 C22,7 24,9 24,12 L24,28 C24,31 22,33 20,33 C18,33 16,31 16,28 Z M16,20 L24,20',
    hoverAnimation: { },
    customHover: 'pill-bounce',
  },
  appointments: {
    label: 'Умная запись',
    description: 'Онлайн-запись и напоминания о визитах',
    // Calendar page
    path: 'M10,12 L30,12 L30,32 L10,32 Z M10,12 L10,10 C10,8 12,8 12,8 L28,8 C28,8 30,8 30,10 L30,12 M15,8 L15,6 M25,8 L25,6 M10,18 L30,18 M16,23 L16,23.1 M20,23 L20,23.1 M24,23 L24,23.1 M16,27 L16,27.1 M20,27 L20,27.1',
    hoverAnimation: { rotationY: 180, transformOrigin: 'center center' },
  },
  archive: {
    label: 'Медицинский архив',
    description: 'Облачное хранилище анализов и документов',
    // Folder icon
    path: 'M8,14 L18,14 L20,11 L32,11 L32,31 L8,31 Z M8,14 L8,11 M8,18 L32,18',
    hoverAnimation: { },
    customHover: 'folder-open', // top flap rotates
  },
  vaccinations: {
    label: 'Вакцинация',
    description: '18+ прививок по нацкалендарю с напоминаниями',
    // Syringe
    path: 'M20,8 L20,26 M16,12 L24,12 M16,16 L24,16 M16,20 L24,20 M17,26 L23,26 L23,30 C23,32 17,32 17,30 Z M20,8 L18,6 M20,8 L22,6',
    hoverAnimation: { y: 5, ease: 'power2.out' },
  },
  coordinator: {
    label: 'Панель координатора',
    description: 'Очередь задач с приоритетами и KPI',
    // Checklist
    path: 'M12,12 L14,14 L18,10 M22,12 L30,12 M12,20 L14,22 L18,18 M22,20 L30,20 M12,28 L14,30 L18,26 M22,28 L30,28',
    hoverAnimation: { }, // sequential checkmarks
    customHover: 'checklist-sequential',
  },
  analytics: {
    label: 'Аналитика',
    description: 'Удержание, LTV, NPS — когортная аналитика',
    // Bar chart
    path: 'M10,30 L10,22 L16,22 L16,30 M18,30 L18,16 L24,16 L24,30 M26,30 L26,10 L32,10 L32,30 M8,30 L34,30',
    hoverAnimation: { }, // bars grow
    customHover: 'bar-grow',
  },
} as const

export type ModuleKey = keyof typeof moduleIcons
