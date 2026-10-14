import { expect, it } from 'vitest';
import { recipeText } from './recipe-text';
it('exports the complete selected recipe and making instructions', () => {
  const text = recipeText({ size: 16, count: 6, thickness: 'regular', glutenFree: true });
  expect(text).toContain('6 × 16″ pizzas · regular · Gluten-free');
  expect(text).toContain('Dough ball estimate: 562 g each');
  expect(text).toContain('GF flour: 1998 g (100%)');
  expect(text).toContain('Water: 1598 g (80%)');
  expect(text).toContain('Yeast: 8.0 g (0.4%)');
  expect(text).toContain('Salt: 50 g (2.5%)');
  expect(text).toContain('Sugar: 40 g (2%)');
  expect(text).toContain('Olive oil: 66 g (3.3%)');
  expect(text).toContain('6. Refrigerate up to 48 hours');
});
