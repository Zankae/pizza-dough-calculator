import { expect, it } from 'vitest';
import { getGuidance } from './guidance';
import type { Settings } from './calculator';
import samples from './fixtures/original-results.json';
it.each(samples)('matches the original contextual tip for $settings', sample => {
  expect(getGuidance(sample.settings as Settings).tip?.text.toUpperCase() ?? null).toBe(sample.tip);
});
it('provides the regular cold-ferment instructions', () => {
  const guide = getGuidance({ size: 16, count: 6, thickness: 'regular', glutenFree: false });
  expect(guide.instructions).toHaveLength(9);
  expect(guide.instructions[0]).toBe('Cool water to under 60°F (16°C)');
  expect(guide.instructions[7]).toBe('Refrigerate 2–4 days (3 ideal)');
  expect(guide.fermentation).toBe('Cold ferment 2–4 days');
  expect(guide.tip).toBeNull();
});
it('provides the gluten-free rest instructions', () => {
  const guide = getGuidance({ size: 16, count: 6, thickness: 'regular', glutenFree: true });
  expect(guide.instructions).toHaveLength(7);
  expect(guide.instructions[3]).toBe('Refrigerate 15 min to firm up');
  expect(guide.instructions[5]).toBe('Refrigerate up to 48 hours');
  expect(guide.fermentation).toBe('Cold rest up to 48hrs');
});
