
import React from 'react';
import { ThemeType } from './types';

export const THEMES: { id: ThemeType; name: string; class: string }[] = [
  { id: 'light', name: 'Cloud White', class: 'bg-white text-gray-900' },
  { id: 'dark', name: 'Midnight', class: 'bg-gray-950 text-gray-100' },
  { id: 'sepia', name: 'Paper', class: 'bg-[#f4ecd8] text-[#5b4636]' },
  { id: 'ocean', name: 'Deep Blue', class: 'bg-[#0f172a] text-[#f1f5f9]' },
  { id: 'minimal', name: 'Grey', class: 'bg-zinc-100 text-zinc-900' }
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
