// Скины ФинГида (ТЗ, геймификация: «Классика», «Футуризм», «Капитал», «Винтаж»).

export type FinGuideSkinId = 'classic' | 'futurism' | 'capital' | 'vintage';

export interface FinGuidePalette {
  body: string;
  bodyDark: string;
  helmet: string;
  visor: string;
  /** Цвет пиктограмм на экране и антенны. */
  glow: string;
}

export interface FinGuideSkin {
  id: FinGuideSkinId;
  name: string;
  /** Цена в монетах; 0 — доступен сразу. */
  price: number;
  palette: FinGuidePalette;
}

export const DEFAULT_SKIN: FinGuideSkinId = 'classic';

export const FINGUIDE_SKINS: FinGuideSkin[] = [
  {
    id: 'classic',
    name: 'Классика',
    price: 0,
    palette: { body: '#4CAF50', bodyDark: '#2E7D32', helmet: '#E5E7EB', visor: '#0F172A', glow: '#7CFFB2' },
  },
  {
    id: 'futurism',
    name: 'Футуризм',
    price: 150,
    palette: { body: '#7C3AED', bodyDark: '#4C1D95', helmet: '#1E293B', visor: '#020617', glow: '#22D3EE' },
  },
  {
    id: 'capital',
    name: 'Капитал',
    price: 250,
    palette: { body: '#D4A017', bodyDark: '#8A6500', helmet: '#FFF7E0', visor: '#1C1917', glow: '#FDE68A' },
  },
  {
    id: 'vintage',
    name: 'Винтаж',
    price: 300,
    palette: { body: '#8D6E63', bodyDark: '#5D4037', helmet: '#EFEBE9', visor: '#3E2723', glow: '#FFCC80' },
  },
];
