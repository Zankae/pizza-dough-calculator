import { expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, STORAGE_KEY } from './storage';
it.each(['{broken', 'null', '{}', '{"size":99,"count":1,"thickness":"thin","glutenFree":false}', '{"size":16,"count":0,"thickness":"regular","glutenFree":true}', '{"size":16,"count":2,"thickness":"invalid","glutenFree":false}', '{"size":16,"count":2,"thickness":"regular","glutenFree":"false"}'])('uses defaults for corrupt or invalid storage: %s', raw => {
  localStorage.setItem(STORAGE_KEY, raw);
  expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
});
it('handles unavailable browser storage without crashing', () => {
  const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
  const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full'); });
  expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  expect(saveSettings(DEFAULT_SETTINGS)).toBe(false);
  get.mockRestore(); set.mockRestore();
});
it('restores the exact saved calculator settings', () => {
  const settings = { size: 12, count: 3, thickness: 'thin' as const, glutenFree: true };
  expect(saveSettings(settings)).toBe(true);
  expect(loadSettings()).toEqual(settings);
});
