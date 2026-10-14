import type { Settings } from './calculator';
export const DEFAULT_SETTINGS: Settings = { size: 16, count: 6, thickness: 'regular', glutenFree: false };
export const STORAGE_KEY = 'pizza-dough-settings-v1';
export function loadSettings(): Settings {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (s && Number.isInteger(s.size) && s.size >= 10 && s.size <= 20 && Number.isInteger(s.count) && s.count >= 1 && s.count <= 10 && ['thin', 'regular', 'thick'].includes(s.thickness) && typeof s.glutenFree === 'boolean') {
      return { size: s.size, count: s.count, thickness: s.thickness, glutenFree: s.glutenFree };
    }
  } catch { /* Private browsing or damaged storage: safe defaults. */ }
  return { ...DEFAULT_SETTINGS };
}
export function saveSettings(settings: Settings): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); return true; }
  catch { return false; }
}
