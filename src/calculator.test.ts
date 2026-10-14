import { describe, expect, it } from 'vitest';
import { calculate, type Settings } from './calculator';
import samples from './fixtures/original-results.json';

describe('Dough Guy calculation compatibility', () => {
  it('matches the live default recipe: six regular 16-inch pizzas', () => {
    const recipe = calculate({ size: 16, count: 6, thickness: 'regular', glutenFree: false });
    expect(recipe.ball).toBe(480);
    expect(recipe.flour).toBe(1705);
    expect(recipe.water).toBe(1057);
    expect(recipe.hydration).toBe(62);
    expect(recipe.ingredients.map(i => i.amount)).toEqual(['1705', '1057', '6.8', '43', '34', '56']);
  });
  it('uses the gluten-free flour basis and 80% hydration', () => {
    const recipe = calculate({ size: 16, count: 6, thickness: 'regular', glutenFree: true });
    expect(recipe.ball).toBe(562);
    expect(recipe.flour).toBe(1998);
    expect(recipe.water).toBe(1598);
    expect(recipe.hydration).toBe(80);
    expect(recipe.ingredients[0].name).toBe('GF flour');
    expect(recipe.ingredients.map(i => i.amount)).toEqual(['1998', '1598', '8.0', '50', '40', '66']);
  });
  it.each(samples)('matches the original recipe for $settings', sample => {
    const recipe = calculate(sample.settings as Settings);
    expect({ ball: recipe.ball, flour: recipe.flour, water: recipe.water, hydration: recipe.hydration }).toEqual({ ball: sample.ball, flour: sample.flour, water: sample.water, hydration: sample.hydration });
    expect(recipe.ingredients.map(i => `${i.amount}G`)).toEqual(sample.amounts);
  });
});
