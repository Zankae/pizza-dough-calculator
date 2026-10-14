export type Thickness = 'thin' | 'regular' | 'thick';
export interface Settings { size: number; count: number; thickness: Thickness; glutenFree: boolean }
export interface Ingredient { name: string; detail?: string; amount: string; percent: string }
export interface Recipe { ball: number; flour: number; water: number; hydration: number; ingredients: Ingredient[] }
export function calculate(settings: Settings): Recipe {
  const factors = { thin: 1.8, regular: 2.11, thick: 2.75 };
  const basis = settings.glutenFree ? 333 * 6 : 1509.797685 * (480 / 425);
  const flour = basis * Math.pow(settings.size / 16, 2) * (settings.count / 6) * (factors[settings.thickness] / 2.11);
  const hydration = settings.glutenFree ? 80 : 62;
  const water = Math.round(flour * (hydration / 100));
  return {
    ball: Math.round(flour * (2550 / 1509.797685) / settings.count),
    flour: Math.round(flour), water, hydration,
    ingredients: [
      { name: settings.glutenFree ? 'GF flour' : 'Bread flour', detail: settings.glutenFree ? 'Caputo GF recommended' : '12–14% protein', amount: String(Math.round(flour)), percent: '100%' },
      { name: 'Water', detail: 'Cold, under 60°F (16°C)', amount: String(water), percent: `${hydration}%` },
      { name: 'Yeast', detail: 'Active dry', amount: (flour * 0.004).toFixed(1), percent: '0.4%' },
      { name: 'Salt', amount: String(Math.round(flour * 0.025)), percent: '2.5%' },
      { name: 'Sugar', amount: String(Math.round(flour * 0.02)), percent: '2%' },
      { name: 'Olive oil', amount: String(Math.round(flour * 0.033)), percent: '3.3%' },
    ],
  };
}
