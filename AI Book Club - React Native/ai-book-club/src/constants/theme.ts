import '@/global.css';

import { Platform } from 'react-native';

/* Design tokens sourced from Design/index.html (Folio — AI Book Club) */
export const DesignColors = {
  paper: '#E6E7E6',
  sand: '#CFBEAE',
  blue: '#B7C8D2',
  slate: '#9DA4AC',
  orange: '#E89C6C',
  ink: '#070707',
  muted: '#5F6369',
  brown: '#9C7368',
  white: '#f7f6f2',
  stageBg: '#d7d8d7',
} as const;

/* Georgia on iOS, bundled serif on Android, CSS stack on web. */
export const Fonts = {
  serif:
    Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "Georgia, 'Times New Roman', serif",
      default: 'serif',
    }) ?? 'serif',
} as const;

/* React Native lineHeight is absolute, so the design's ratios are resolved here. */
export const Type = {
  h1: { fontFamily: Fonts.serif, fontSize: 34, lineHeight: 35, letterSpacing: -1 },
  h2: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 26, letterSpacing: -0.4 },
  h3: { fontSize: 15, lineHeight: 19 },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  muted: { fontSize: 13, lineHeight: 19 },
  tiny: { fontSize: 11, lineHeight: 14 },
} as const;

